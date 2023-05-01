import { NgModule } from '@angular/core';
import { TeacherService } from 'src/modules/teacher/teacher.service';

import { ScrollPanelModule } from 'primeng/scrollpanel';
import { CardModule } from 'primeng/card';

import { TeacherComponent } from './teacher.component';


@NgModule({
  declarations: [
    TeacherComponent
  ],
  imports: [
    ScrollPanelModule,
    CardModule
  ],
  providers: [
    TeacherService
  ],
  exports: [
    TeacherComponent
    ]
})
export class TeacherModule { }
