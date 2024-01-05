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
import { UtilService } from '../utils/util';
import { NgxCsvParserModule } from 'ngx-csv-parser';
import { DashboardGraphsDetailsComponent } from './dashboard.graphs.details.component';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [
    DashboardGraphsComponent,
    DashboardGraphsDetailsComponent
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
    ProgressSpinnerModule,
    NgxCsvParserModule,
    TableModule,
    DialogModule,
    TagModule,
    InputTextModule,
    TooltipModule
  ],
  providers: [
    MessageService,
    ScoreFileService,
    UtilService
  ],
  exports: [
    DashboardGraphsComponent
    ]
})
export class DashboardModule { }
