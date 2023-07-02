import { Component, EventEmitter, Output } from '@angular/core';
import { TeacherService } from './teacher.service';
import { ScoreFileService } from '../dashboard/scorefile.service';
import { SqlValue } from 'sql.js';

@Component({
  selector: 'app-teacher',
  templateUrl: './teacher.component.html',
  styleUrls: []
})
export class TeacherComponent {
    teacherIntroduction = "Hey! I'm your chinese teacher, do you want a short story?";
    teacherAnswer = "";
    @Output() askToUploadDb: EventEmitter<any> = new EventEmitter();


    // Options
    levels: {name: string}[] = [{"name": "personal"}, {"name": "HSK1"}, {"name": "HSK2"}, {"name": "HSK3"}, {"name": "HSK4"},{"name": "HSK5"}, {"name": "HSK6"}, {"name": "fluent"}];
    selectedLevel: string = "HSK1";
    selectedTheme: string = "a random common story theme";
    selectedNumberOfLines: number = 20;
    
    sidebarVisible: boolean= false;
    searchQuery: string[] = [];


    constructor(public teacherService: TeacherService, private scorefileService: ScoreFileService)
    {
        this.teacherService = new TeacherService();

        this.teacherService.talk$.subscribe({
        next: (data) => this.teacherAnswer = data.choices[0].message.content,
        });
    }

    /**
     * Start the story
     * @param $event the mouse event
     */
    public startStory($event: MouseEvent)
    {
        // TODO REFACTOR THAT
        // prevent event bubbling to the accordion component
        $event.stopPropagation();

        if (this.selectedLevel == "personal")
        {
            if (!this.scorefileService.selectedScorefile)
            {
                this.askToUploadDb.emit();
                return;
            }
            let listOfCardsLearnedQueryResult = this.scorefileService.getLearnedCards();
            if (listOfCardsLearnedQueryResult == undefined)
            {
                console.error("No card learned yet.")
                return
            }
            let listOfCardsLearned = listOfCardsLearnedQueryResult[0].values;
            let nbOfCardsForStory = 10;
            let selectedCardsForStory = new Array<SqlValue>(nbOfCardsForStory);
            let i =0;
            while (i < nbOfCardsForStory)
            {
                listOfCardsLearned = this.shuffle(listOfCardsLearned)
                let selectedValue = listOfCardsLearned.pop() as SqlValue[];
                let character = selectedValue[1] as String;
                let sanitizedChar = character.replaceAll('@', '');
                this.searchQuery.push(sanitizedChar);
                selectedCardsForStory[i] = sanitizedChar;
                i++;
            }

            this.teacherService.askQuestion(
                `You are a chinese teacher (you cannot speak english), tell me a story about the following theme: ${this.selectedTheme}.
                The story shall be written using simplified mandarin characters and shall be composed of ${this.selectedNumberOfLines} lines.
                You must absolutely use the following characters: ${selectedCardsForStory}`);
            
            return
        }

        this.teacherService.askQuestion(
            `You are a chinese teacher (you cannot speak english), tell me a story suited for a student with a ${this.selectedLevel} about the following theme: ${this.selectedTheme}.
            The story shall be written using simplified mandarin characters and shall be composed of ${this.selectedNumberOfLines} lines.`);
    }

    private shuffle(array: any) {
        let currentIndex = array.length,  randomIndex;
      
        // While there remain elements to shuffle.
        while (currentIndex != 0) {
      
          // Pick a remaining element.
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
      
          // And swap it with the current element.
          [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
      
        return array;
      }
}
