import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { TeacherService } from 'src/modules/teacher/teacher.service';

import { ScrollPanelModule } from 'primeng/scrollpanel';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';

import { TeacherComponent } from './teacher.component';


@NgModule({
  declarations: [
    TeacherComponent
  ],
  imports: [
    FormsModule,
    ScrollPanelModule,
    CardModule,
    DropdownModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    AccordionModule
  ],
  providers: [
    TeacherService
  ],
  exports: [
    TeacherComponent
    ]
})
export class TeacherModule { }
