import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ScoreFileService } from './scorefile.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.graphs.component.html',
  styleUrls: []
})
export class DashboardGraphsComponent {

  accordionFileUploadSelected = true;
  
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
      this.accordionFileUploadSelected = false;
      return true;
  }
}
