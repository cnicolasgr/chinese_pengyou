import { Component } from '@angular/core';
import { TeacherService } from './teacher.service';

@Component({
  selector: 'app-teacher',
  templateUrl: './teacher.component.html',
  styleUrls: []
})
export class TeacherComponent {
    teacherIntroduction = "Hey! I'm your chinese teacher, do you want a short story?";
    teacherAnswer = "";

    // Options
    levels: {name: string}[] = [{"name": "HSK1"}, {"name": "HSK2"}, {"name": "HSK3"}, {"name": "HSK4"},{"name": "HSK5"}, {"name": "HSK6"}, {"name": "fluent"}];
    selectedLevel: string = "HSK1";
    selectedTheme: string = "a random common story theme";
    selectedNumberOfLines: number = 20;

    constructor(public teacherService: TeacherService)
    {
        this.teacherService = new TeacherService();

        this.teacherService.talk$.subscribe({
        next: (message) => this.teacherAnswer = message.text,
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

        this.teacherService.askQuestion(
            `You are a chinese teacher (you cannot speak english), tell me a story suited for a student with a ${this.selectedLevel} about the following theme: ${this.selectedTheme}.
            The story shall be written using simplified mandarin characters and shall be composed of ${this.selectedNumberOfLines} lines.`);
    }
}
