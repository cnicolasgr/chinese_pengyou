import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'chinese-pengyou';
  activeIndex: number = 0;
  openAccordionFileUpload: boolean = true;

  askToUploadDb($event: Event)
  {
    this.activeIndex = 0;
    this.openAccordionFileUpload = true;
  }
}
