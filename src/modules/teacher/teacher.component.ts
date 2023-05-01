import { Component } from '@angular/core';
import { TeacherService } from './teacher.service';

@Component({
  selector: 'app-teacher',
  templateUrl: './teacher.component.html',
  styleUrls: []
})
export class TeacherComponent {
    teacherAnswer = "Hey! I'm your chinese teacher, do you want a short story?";

    constructor(private teacher: TeacherService)
    {
        this.teacher = new TeacherService();

        this.teacher.talk$.subscribe({
        next: (message) => this.teacherAnswer = message.text,
        });
    }

    
    public myfunction()
    {
        // You are a chinese teacher, please tell me a story using words from HSK1 and simplified mandarin characters
        this.teacher.askQuestion("You are a chinese teacher, tell me a story using words from HSK1 and simplified mandarin characters");
    }
}
