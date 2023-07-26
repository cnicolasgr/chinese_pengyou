import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { TeacherService } from 'src/modules/teacher/teacher.service';
import { ScoreFileService } from 'src/modules/dashboard/scorefile.service'

import { ScrollPanelModule } from 'primeng/scrollpanel';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';

import { TeacherComponent } from './teacher.component';
import { HighlightPipe } from './highlight.pipe';
import { ExerciseModule } from '../exercise/exercise.module';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';



@NgModule({
  declarations: [
    TeacherComponent,
    HighlightPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    ScrollPanelModule,
    CardModule,
    DropdownModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    AccordionModule,
    ExerciseModule,
    ProgressSpinnerModule
  ],
  providers: [
    TeacherService,
    ScoreFileService
  ],
  exports: [
    TeacherComponent
    ]
})
export class TeacherModule { }
