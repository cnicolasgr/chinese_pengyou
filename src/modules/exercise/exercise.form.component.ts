import { Component, Input } from '@angular/core';
import { ExerciseType } from './exercise';
import { ExerciseForm } from './exercise.form';

@Component({
  selector: 'exercise-form',
  templateUrl: './exercise.form.component.html',
  styleUrls: []
})
export class ExerciseFormComponent 
{
  @Input() exercise: ExerciseForm;

  constructor() { 
  }

  ngOnInit() {
  }
}
