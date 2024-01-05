import { Injectable } from '@angular/core';
import { ChartData, ChartOptions, ChartTypeRegistry, TooltipItem } from 'chart.js';
import 'chartjs-adapter-date-fns';
import initSqlJs, { Database } from "sql.js";
import { UtilService } from '../utils/util';
import { HttpClient } from '@angular/common/http';
import { NgxCsvParser, NgxCSVParserError } from 'ngx-csv-parser';

@Injectable()
export class ScoreFileService
{
    uploadedFile!: Uint8Array ;
    SQL!: initSqlJs.SqlJsStatic;
    db: Database | undefined;

    scorefiles: Scorefile[]  = [];
    selectedScorefile: undefined | Scorefile;
    scoreCardLearned = 600;

    lineChartData: ChartData | undefined;
    lineChartOptions: ChartOptions | undefined;
    barChartData: ChartData | undefined;
    barChartOptions: ChartOptions | undefined;

    // reviewed cards organised by categories
    categoriesDict: CategoriesDict = {};

    private _reviewedCards!: ReviewedCardsResponse;
    get reviewedCards(): ReviewedCardsResponse
    {
        if (this._reviewedCards)
        {
            return this._reviewedCards;
        }
        throw new Error("Reviewed cards not loaded yet.");
    }

    // HSK char hashmap organised by level, extracted from the HSK3.0-chars csv
    hskChars: { [key: string]: CharEntry[] } = 
    {
        '1': [],
        '2': [],
        '3': [],
        '4': [],
        '5': [],
        '6': [],
        '7-9': []
    };

    // HSK vocabulary hashmap organised by level, extracted from the HSK3.0 csv
    hskVocabulary: { [key: string]: Vocabulary[] } = 
    {
        '1': [],
        '2': [],
        '3': [],
        '4': [],
        '5': [],
        '6': [],
        '7-9': []
    };

    constructor(private utilService: UtilService, private httpClient: HttpClient, private ngxCsvParser: NgxCsvParser){
        this.initDatabase();
        this.parseHskCharsCSV();
        this.parseHskVocabularyCSV();
    }

    /**
     * Initialization of sql.js and the locate the .wasm file
     */
    async initDatabase()
    {
        this.SQL = await initSqlJs({
            locateFile: () => '../../assets/sql-wasm.wasm'
            });        
    }

    /**
     * Parse the HSK3.0 file requirements for chars 
     */
    parseHskCharsCSV()
    {
        this.httpClient.get('assets/HSK/hsk30-chars.csv', {responseType: 'blob'})
        .subscribe(data => 
            {
                let file = new File([data], 'hsk30-chars.csv');
                this.ngxCsvParser.parse(file, { header: true, delimiter: ',', encoding: 'utf8' })
                .pipe().subscribe(
                    {
                        next: (result): void => 
                        {
                            (result as CharEntry[]).forEach((el: CharEntry) => this.hskChars[el.Level].push(el));

                        },
                        error: (error: NgxCSVParserError): void => 
                        {
                            console.log('Error', error);
                        }
                    });
            });
    }

    /**
     * Parse the HSK3.0 file requirements for chars 
     */
    parseHskVocabularyCSV()
    {
        this.httpClient.get('assets/HSK/hsk30.csv', {responseType: 'blob'})
        .subscribe(data => 
            {
                let file = new File([data], 'hsk30.csv');
                this.ngxCsvParser.parse(file, { header: true, delimiter: ',', encoding: 'utf8' })
                .pipe().subscribe(
                    {
                        next: (result): void => 
                        {
                            (result as Vocabulary[]).forEach((el: Vocabulary) => this.hskVocabulary[el.Level].push(el));
                        },
                        error: (error: NgxCSVParserError): void => 
                        {
                            console.log('Error', error);
                        }
                    });
            });
    }

    /**
     * Convert the input file to an Array buffer and store it in memory
     * Subsequently execute the readDatabase function
     * @param file The sqlLite file
     */
    readDatabaseFromFile(file: File) 
    {
      const reader = new FileReader();
      reader.onload = () => 
      {
        console.info("Pleco backup file read.")

        this.uploadedFile = new Uint8Array(<ArrayBuffer>reader.result);
        this.db = new this.SQL.Database(this.uploadedFile);

        this.scorefiles = this.listScorefiles(this.db);

        // auto select the first scorefile
        if (this.scorefiles.length > 0)
        {
            this.selectedScorefile = this.scorefiles[0];
            this.listReviewedCards();
        }
      }
      reader.readAsArrayBuffer(file);
    }


    /**
     * List the scorefiles of the provided database
     * @param db The database
     */
    listScorefiles(db: Database): Scorefile[]
    {
        console.info("Listing scorefiles...")

        const scorefiles: Scorefile[] = [];
        const res = db.exec("SELECT id, name FROM pleco_flash_scorefiles;");
        if (res.length > 0)
        {
            res[0].values.map( v => scorefiles.push({id: <number>v[0], name: <string>v[1]}))
        }
        return scorefiles;
    }

    /**
     * Request the db to get the list of reviewed cards and launch prepareChartData
     * @returns the score, firstreviewedtime and character for each reviewed card or undefined if the request couldn't be made
     */
    listReviewedCards()
    {
        if (!this.db)
        {
            console.error("Cannot list cards: database not defined.")
            return
        }

        if (!this.selectedScorefile)
        {
            console.error("Cannot list cards: no scorefile selected.")
            return
        }

        let skillFilter = ` AND LOWER(pleco_flash_categories.name)='${this.selectedScorefile.name.toLowerCase()}'`;
        if (this.selectedScorefile.name == 'Vocabulary')
        {
            skillFilter = ` AND (pleco_flash_categories.name='Level 1' OR 
            pleco_flash_categories.name='Level 2' OR
            pleco_flash_categories.name='Level 3' OR
            pleco_flash_categories.name='Level 4' OR
            pleco_flash_categories.name='Level 5' OR
            pleco_flash_categories.name='Level 6' OR
            pleco_flash_categories.name='Level 7-9')`;
        }

        console.log("Listing reviewed cards for scorefile " + this.selectedScorefile.name + "...")

        const scoreTable = `pleco_flash_scores_${this.selectedScorefile.id}`
        const sqlCommand = `
        SELECT ${scoreTable}.score, ${scoreTable}.firstreviewedtime, pleco_flash_cards.hw, pleco_flash_categoryassigns.cat, pleco_flash_categories.name
        FROM ${scoreTable} 
        INNER JOIN pleco_flash_cards ON ${scoreTable}.card=pleco_flash_cards.id 
        INNER JOIN pleco_flash_categoryassigns ON pleco_flash_cards.id=pleco_flash_categoryassigns.card
        INNER JOIN pleco_flash_categories ON pleco_flash_categoryassigns.cat=pleco_flash_categories.id
        WHERE firstreviewedtime > 0${skillFilter}
        ORDER BY firstreviewedtime ASC;`

        const res = this.db.exec(sqlCommand);

        if (res.length > 0)
        {
            // get the raw result and convert it to ReviewedCardsResponse type 
            const rawResult = res[0];
            this._reviewedCards = {columns: ["score", "firstreviewedtime", "character", "category", 'categoryName'], values: []};
            rawResult.values.forEach((value) => {
                this._reviewedCards.values.push(value.reduce((obj, cur, i) => ({ ...obj, [this._reviewedCards.columns[i]]: cur}), {} as ReviewedCardsValues));
            })
            this.prepareLineChartData(this._reviewedCards);
            this.prepareBarChart(this._reviewedCards);
        }

        return res;
    }

    /**
     * Prepare the data to be compliant with the lineChart chartJS data model
     * @param reviewedCards list of reviewed cards
     */
    prepareLineChartData(reviewedCards: ReviewedCardsResponse)
    {
        console.info("Preparing data for line chart...")
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        // deep copy of the object
        const reviewedCardsCopy: ReviewedCardsResponse = structuredClone(reviewedCards);

        // remove duplicate caused by multiple categories for same card
        reviewedCardsCopy.values = reviewedCardsCopy.values.reduce((prev,cur) => 
            prev.some(n=>n.firstreviewedtime === cur.firstreviewedtime) ? prev : [...prev, cur], [] as ReviewedCardsValues[]);


        const js_timestamps = reviewedCardsCopy.values.map(x => x.firstreviewedtime * 1000);
        const cards: number[] = [];
        const learnedCards: number[] = [];

        let nbOfLearnedCards = 0;
        for (let i = 0; i < js_timestamps.length; i++)
        {
            cards.push(i)

            // nbOfLearnedCards only incremented if card score is superior to a threshold 
            if (reviewedCardsCopy.values[i].score > this.scoreCardLearned)
            {
                nbOfLearnedCards++;
            }
            learnedCards.push(nbOfLearnedCards)
        }

        this.lineChartData = {
        labels: js_timestamps,
        datasets: [
            {
                label: 'Cards reviewed',
                data: cards,
                fill: false,
                tension: 0.1
            },
            {
                label: 'Cards learned',
                data: learnedCards,
                fill: false,
                tension: 0.1
            }
        ]
        };

        this.lineChartOptions = {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context: TooltipItem<keyof ChartTypeRegistry>) {
                        const labelArray = [];
                        // this is the label of the serie
                        let serieLabel = context.dataset.label || '';
    
                        if (serieLabel) {
                            serieLabel += ': ';
                        }
                        if (context.parsed.y !== null) {
                            serieLabel += context.parsed.y;
                            labelArray.push(serieLabel);

                            // get chinese character
                            let zi = reviewedCardsCopy.values[context.dataIndex].character;
                            zi = zi.replaceAll('@', '');
                            labelArray.push("Last character: " + zi);
                        }                   
                        return labelArray;
                    }
                }
            }
        },
        scales: {
            x: {
                type: 'time',

                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            },
            y: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                },
                beginAtZero: true
            }
        }
        };
    }

    /**
     * Prepare the data to be compliant with the barChart chartJS data model
     * @param reviewedCards list of reviewed cards
     * @returns 
     */
    prepareBarChart(reviewedCards: ReviewedCardsResponse)
    {
        console.info("Preparing data for bar chart...")
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        if (!this.db)
        {
            return;
        }

        if (!this.selectedScorefile)
        {
            return;
        }

        // create category labels
        let i = 1;
        while (i < 7)
        {
            this.categoriesDict['Level '+i] = {name: 'Level '+i, numberOfCards: 0, numberOfCardsLearned: 0, cards: {}};
            i++;
        }
        this.categoriesDict['Level 7-9'] = {name: 'Level 7-9', numberOfCards: 0, numberOfCardsLearned: 0, cards: {}};

        // populate categories
        // use predefined pleco categories to assign vocabulary cards
        // for characters, find the corresponding category in the CSV file
        for (const entry of reviewedCards.values)
        {
            let categoryKey = entry.categoryName;

            // for characters, find the corresponding category in the CSV file
            if (this.selectedScorefile.name == 'Writing')
            {
                let categoryNumber: string = '';
                Object.values(this.hskChars).forEach((lvl: CharEntry[]) => 
                {
                    let findResult = lvl.find(e => e.Hanzi == entry.character);
                    if (findResult)
                    {
                        categoryNumber = findResult.WritingLevel;
                        return;
                    }
                });

                if (categoryNumber == '')
                {
                    console.info('Char not found in HSK requirement doc : ' + entry.character);
                    continue;
                }
                categoryKey = 'Level ' + categoryNumber;
            }

            this.categoriesDict[categoryKey].cards[entry.character] = { score: entry.score };
            this.categoriesDict[categoryKey].numberOfCards++;
            if (entry.score > this.scoreCardLearned)
            {
                this.categoriesDict[categoryKey].numberOfCardsLearned++;
            }
        } 

        this.barChartData = {
            labels: Object.values(this.categoriesDict).map((v) => v.name),
            datasets: [
                {
                    label: 'Cards reviewed',
                    data: Object.values(this.categoriesDict).map((v) => v.numberOfCards),
                    borderWidth: 1
                },
                {
                    label: 'Cards learned',
                    data: Object.values(this.categoriesDict).map((v) => v.numberOfCardsLearned),
                    borderWidth: 1
                }
            ]
        };

        this.barChartOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.6,
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder
                    }
                },
                x: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder
                    }
                }
            }
        };
    }

    /**
     * Launch chart data preparation
     * @param reviewedCards list of reviewed cards
     */
    prepareCharts(reviewedCards: ReviewedCardsResponse)
    {
        this.prepareLineChartData(reviewedCards);
        this.prepareBarChart(reviewedCards);
    }

    /**
     * Get all the cards that were learned
     * @returns 
     */
    getLearnedCards()
    {
        if (!this.selectedScorefile || !this.db)
        {
            throw new TypeError("Invalid scorefile or database.");
        }

        console.log("Get cards learned for scorefile " + this.selectedScorefile.name + "...")

        const scoreTable = `pleco_flash_scores_${this.selectedScorefile.id}`
        const sqlCommand = `
        SELECT ${scoreTable}.score, pleco_flash_cards.hw
        FROM ${scoreTable} 
        INNER JOIN pleco_flash_cards ON ${scoreTable}.card=pleco_flash_cards.id 
        WHERE score > ${this.scoreCardLearned};`

        const res = this.db.exec(sqlCommand);

        if (res.length > 0)
        {
            console.log(res);
        }

        return res;
    }

    /**
     * Return random learned characters
     * @param n Number of random characters to return
     * @returns { Array<String> } an array of string containing the random characters
     */
    getRandomLearnedCharacters(n: number)
    {
        const selectedCards = new Array<string>(n);
        const listOfCardsLearnedQueryResult = this.getLearnedCards();

        let listOfCardsLearned = listOfCardsLearnedQueryResult[0].values;

        // shuffle the list of cards learned and select the first n characters
        listOfCardsLearned = this.utilService.shuffle(listOfCardsLearned)
        for (let i=0; i < n; i++)
        {
            selectedCards[i] = this.utilService.sanitizedPlecoCharacter(listOfCardsLearned[i][1] as string);
        }

        return selectedCards
    }

    /**
     * Get the card score for a given char for the selected scorefile
     * @param chars - The char to search for
     * @returns The char score
     */
    getCardScoreByChars(chars: string): number | undefined
    {
        if (!this.reviewedCards)
        {
            throw new Error("Cards need to be loaded first");
        }

        let card = this.reviewedCards.values.find(e => this.utilService.sanitizedPlecoCharacter(e.character) == chars);
        if (!card)
        {
            return undefined;
        }
        return card.score;
    }
}

type Scorefile = 
{
    id: number,
    name: string
}

type ReviewedCardsResponse = 
{
    columns: string[],
    values: ReviewedCardsValues[]
}

type ReviewedCardsValues =
{
    score: number, 
    firstreviewedtime: number, 
    character: string,
    category: number,
    categoryName: string
}

type CategoriesDict = 
{
    [id: string]: 
    {
        name: string, 
        numberOfCards: number, 
        numberOfCardsLearned: number, 
        cards: 
        { 
            [character: string]: 
            {
                score: number
            } 
        } 
    }
}

type CharEntry = 
{
    Example: string,
    Freq: string,
    Hanzi: string,
    Level: string,
    Traditional: string,
    WritingLevel: string
}

type Vocabulary =
{
    ID: string,
    Simplified: string,
    Traditional: string,
    Pinyin: string,
    POS: string,
    Level: string,
    WebNo: string,
    WebPinyin: string,
    OCR: string,
    Variants: string,
    CEDICT: string
}