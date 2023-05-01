import { NgModule } from '@angular/core';
import { DashboardGraphsComponent } from './dashboard.graphs.component';

import { FormsModule } from '@angular/forms';

import { MessageService } from 'primeng/api';
import { ScoreFileService } from './scorefile.service';

import { FileUploadModule } from 'primeng/fileupload';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { ChartModule } from 'primeng/chart';
import { InputNumberModule } from 'primeng/inputnumber';
import { AccordionModule } from 'primeng/accordion';
import { DividerModule } from 'primeng/divider';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@NgModule({
  declarations: [
    DashboardGraphsComponent
  ],
  imports: [
    FileUploadModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ToastModule,
    DropdownModule,
    FormsModule,
    ChartModule,
    InputNumberModule,
    AccordionModule,
    DividerModule,
    CardModule,
    ProgressSpinnerModule
  ],
  providers: [
    MessageService,
    ScoreFileService
  ],
  exports: [
    DashboardGraphsComponent
    ]
})
export class DashboardModule { }
