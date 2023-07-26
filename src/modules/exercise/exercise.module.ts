import { NgModule } from '@angular/core';
import { ExerciseFormComponent } from './exercise.form.component';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { KeyValuePipe, CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';

@NgModule({
  declarations: [
    ExerciseFormComponent
  ],
  imports: [
    KeyValuePipe,

    FormsModule,
    CheckboxModule,
    CommonModule,
    CardModule,
    DividerModule,
    ButtonModule
  ],
  providers: [
  ],
  exports: [
    ExerciseFormComponent
    ]
})
export class ExerciseModule { }
