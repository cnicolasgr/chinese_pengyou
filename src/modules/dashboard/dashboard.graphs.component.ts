import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ScoreFileService } from './scorefile.service';
import { BarElement } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.graphs.component.html',
  styleUrls: []
})
export class DashboardGraphsComponent {

  @Input() accordionFileUploadSelected = true;
  @Output() accordionFileUploadSelectedChange = new EventEmitter<boolean>();

  showDetails = false;
  graphDetailsLevel = -1;
  
  constructor(private messageService: MessageService, public scoreFileService: ScoreFileService)
  {
  }
  
  /**
   * Handle the upload of a new file through the upload input
   * @param event 
   * @returns true if the file was uplaoded correctly, false otherwise
   */
  customUploader(event: {files: File[]}): boolean
  {
    if(!event.files)
    {
      console.error("Could not upload database file.")
      return false;
    }
      this.scoreFileService.readDatabaseFromFile(event.files[0])
      this.messageService.add({severity: 'info', summary: 'File Uploaded', detail: ''});
      console.info("Database file uploaded sucessfuly.")
      this.accordionFileUploadToggle(false);
      return true;
  }

  /** Toggle the accordion for the file upload
   * @param value true if the accordion shall open, false otherwise
   */
  accordionFileUploadToggle(value: boolean)
  {
    this.accordionFileUploadSelected = value;
    this.accordionFileUploadSelectedChange.emit(value);
  }

  /**
   * Callback invoked when clicking on the barplot
   * @param event clicking event
   */
  onBarChartClicked(event: any)
  {
    if (event.element.element instanceof BarElement)
    {
      this.graphDetailsLevel = event.element.index + 1;
      this.showDetails = true;
    }
  }

  onDetailsHidden()
  {
    this.showDetails = false;
  }
}
