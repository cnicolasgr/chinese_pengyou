import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'chinese-pengyou';
  activeIndex = 0;
  openAccordionFileUpload = true;

  askToUploadDb()
  {
    this.activeIndex = 0;
    this.openAccordionFileUpload = true;
  }
}
