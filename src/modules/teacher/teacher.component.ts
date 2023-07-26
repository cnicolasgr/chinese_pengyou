import { Component, EventEmitter, Output } from '@angular/core';
import { TeacherService } from './teacher.service';
import { ScoreFileService } from '../dashboard/scorefile.service';
import { Prompt } from './prompts';
import { ExerciseForm } from '../exercise/exercise.form';

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

    // loaders
    isLoadingStory = false;

    exercise: ExerciseForm | undefined;

    constructor(public teacherService: TeacherService, private scorefileService: ScoreFileService)
    {
        this.teacherService = new TeacherService();
    }

    /**
     * Start the story
     * @param $event the mouse event
     */
    public async startStory($event: MouseEvent)
    {
        // prevent event bubbling to the accordion component
        $event.stopPropagation();

        // reset exercise
        this.exercise = undefined;

        // set loader
        this.isLoadingStory=true

        if (this.selectedLevel == "personal")
        {
            if (!this.scorefileService.selectedScorefile)
            {
                this.askToUploadDb.emit();
                return;
            }
            
            this.selectedCardsForStory = this.scorefileService.getRandomLearnedCharacters(10);
        }
        await this.teacherService.askQuestion(Prompt.story(this.selectedTheme, this.selectedLevel ,this.selectedCardsForStory));
        this.teacherAnswer = this.teacherService.getTextAnswer();
        this.isLoadingStory=false

        this.giveExercise()
    }

    public giveExercise()
    {
        let exercise = new ExerciseForm(this.teacherService);
        exercise.requestNew()
        this.exercise = exercise;
    }
}
