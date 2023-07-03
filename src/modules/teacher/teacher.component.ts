import { Component, EventEmitter, Output } from '@angular/core';
import { TeacherService } from './teacher.service';
import { ScoreFileService } from '../dashboard/scorefile.service';

@Component({
  selector: 'app-teacher',
  templateUrl: './teacher.component.html',
  styleUrls: []
})
export class TeacherComponent {
    teacherIntroduction = "Hey! I'm your chinese teacher, do you want a short story?";
    teacherAnswer = "";
    @Output() askToUploadDb: EventEmitter<void> = new EventEmitter();


    // Options
    levels: {name: string}[] = [{"name": "personal"}, {"name": "HSK1"}, {"name": "HSK2"}, {"name": "HSK3"}, {"name": "HSK4"},{"name": "HSK5"}, {"name": "HSK6"}, {"name": "fluent"}];
    selectedLevel = "HSK1";
    selectedTheme = "a random common story theme";
    selectedNumberOfLines = 20;
    
    sidebarVisible = false;
    selectedCardsForStory: string[] = [];


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
        // prevent event bubbling to the accordion component
        $event.stopPropagation();

        if (this.selectedLevel == "personal")
        {
            if (!this.scorefileService.selectedScorefile)
            {
                this.askToUploadDb.emit();
                return;
            }
            
            this.selectedCardsForStory = this.scorefileService.getRandomLearnedCharacters(10);

            this.teacherService.askQuestion(
                `You are a chinese teacher (you cannot speak english), tell me a story about the following theme: ${this.selectedTheme}.
                The story shall be written using simplified mandarin characters and shall be composed of ${this.selectedNumberOfLines} lines.
                You must absolutely use the following characters: ${this.selectedCardsForStory}`);
            
            return
        }

        this.teacherService.askQuestion(
            `You are a chinese teacher (you cannot speak english), tell me a story suited for a student with a ${this.selectedLevel} about the following theme: ${this.selectedTheme}.
            The story shall be written using simplified mandarin characters and shall be composed of ${this.selectedNumberOfLines} lines.`);
    }
}
