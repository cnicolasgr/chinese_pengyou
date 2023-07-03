import { Injectable } from '@angular/core';
import { ChartData, ChartOptions, ChartTypeRegistry, TooltipItem } from 'chart.js';
import 'chartjs-adapter-date-fns';
import initSqlJs, { Database } from "sql.js";
import { UtilService } from '../utils/util';

@Injectable()
export class ScoreFileService
{
    uploadedFile!: Uint8Array ;
    SQL!: initSqlJs.SqlJsStatic;
    db: Database | undefined;

    scorefiles: Scorefile[]  = [];
    selectedScorefile: undefined | Scorefile;
    scoreCardLearned = 500;

    lineChartData: ChartData | undefined;
    lineChartOptions: ChartOptions | undefined;
    barChartData: ChartData | undefined;
    barChartOptions: ChartOptions | undefined;

    reviewedCards!: ReviewedCardsResponse;

    constructor(private utilService: UtilService){
        this.initDatabase();
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
     * Convert the input file to an Array buffer and store it in memory
     * Subsequently execute the readDatabase function
     * @param file The sqlLite file
     */
    readDatabaseFromFile(file: File) {
      const reader = new FileReader();
      reader.onload = () => {
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

        console.log("Listing reviewed cards for scorefile " + this.selectedScorefile.name + "...")

        const scoreTable = `pleco_flash_scores_${this.selectedScorefile.id}`
        const sqlCommand = `
        SELECT ${scoreTable}.score, ${scoreTable}.firstreviewedtime, pleco_flash_cards.hw, pleco_flash_categoryassigns.cat
        FROM ${scoreTable} 
        INNER JOIN pleco_flash_cards ON ${scoreTable}.card=pleco_flash_cards.id 
        INNER JOIN pleco_flash_categoryassigns ON pleco_flash_cards.id=pleco_flash_categoryassigns.card 
        WHERE firstreviewedtime > 0 
        ORDER BY firstreviewedtime ASC;`

        const res = this.db.exec(sqlCommand);

        if (res.length > 0)
        {
            // get the raw result and convert it to ReviewedCardsResponse type 
            const rawResult = res[0];
            this.reviewedCards = {columns: ["score", "firstreviewedtime", "character", "category"], values: []};
            rawResult.values.forEach((value) => {
                this.reviewedCards.values.push(value.reduce((obj, cur, i) => ({ ...obj, [this.reviewedCards.columns[i]]: cur}), {} as ReviewedCardsValues));
            })
            this.prepareLineChartData(this.reviewedCards);
            this.prepareBarChart(this.reviewedCards);
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

        // create category labels
        const sqlCommand = `
        SELECT id, name 
        FROM pleco_flash_categories
        ORDER BY id ASC;`

        const categoriesRes = this.db.exec(sqlCommand);
        const categoriesDict: {[id: number] : {name: string, numberOfCards: number, numberOfCardsLearned: number}} = {};

        if (categoriesRes.length > 0)
        {
            const rawResult = categoriesRes[0];
            rawResult.values.forEach((value) => {
                categoriesDict[<number>value[0]] = {name: <string>value[1], numberOfCards: 0, numberOfCardsLearned: 0};
            })
        }

        // populate categories
        for (const entry of reviewedCards.values)
        {
            categoriesDict[entry.category].numberOfCards++;
            if (entry.score > this.scoreCardLearned)
            {
                categoriesDict[entry.category].numberOfCardsLearned++;
            }
        }

        this.barChartData = {
            labels: Object.values(categoriesDict).map((v) => v.name),
            datasets: [
                {
                    label: 'Cards reviewed',
                    data: Object.values(categoriesDict).map((v) => v.numberOfCards),
                    borderWidth: 1
                },
                {
                    label: 'Cards learned',
                    data: Object.values(categoriesDict).map((v) => v.numberOfCardsLearned),
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
    category: number
}