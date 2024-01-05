import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ScoreFileService } from "./scorefile.service";
import chroma from "chroma-js";
import { Table } from 'primeng/table';

@Component({
    selector: 'app-graphs-details',
    templateUrl: './dashboard.graphs.details.component.html',
    styleUrls: []
  })
export class DashboardGraphsDetailsComponent 
{
  @Input() level: number;  
  @Input() visible = false;
  @Output() hideEmitter = new EventEmitter();
  data: tableRow[] = [];
  numberCardsLearned = 0;
      
  constructor(public scoreFileService: ScoreFileService)
  {
  }

  onShow() 
  {
    if (!this.scoreFileService.selectedScorefile)
    {
      throw new Error("Cannot display details: no scorefile selected");
    }

    if (this.scoreFileService.selectedScorefile.name == 'Writing')
    {
      let levelKey = this.level.toString();
      if (this.level == 7)
      {
        levelKey = '7-9';
      }
      this.scoreFileService.hskChars[levelKey].forEach(e => 
        {        
          let score = this.scoreFileService.categoriesDict['Level '+ levelKey].cards[e.Hanzi]?.score;
          let learned = false;
          if (!score)
          {
            score = 0;
          }

          if (score > this.scoreFileService.scoreCardLearned)
          {
            this.numberCardsLearned++;
            learned = true;
          }
          let colorScale = chroma.scale(['red', 'green']).mode('lab');
          let color = colorScale(score / this.scoreFileService.scoreCardLearned).css();
          this.data.push({ item: e.Hanzi, score: score, learned: learned, color: color })
      });
    }
    else if (this.scoreFileService.selectedScorefile.name == 'Vocabulary')
    {
      let levelKey = this.level.toString();
      if (this.level == 7)
      {
        levelKey = '7-9';
      }
      this.scoreFileService.hskVocabulary[levelKey].forEach(e => 
        {          
          let score = this.scoreFileService.categoriesDict['Level '+ levelKey].cards[e.Simplified]?.score;
          let learned = false;
          if (!score)
          {
            score = 0;
          }

          if (score > this.scoreFileService.scoreCardLearned)
          {
            this.numberCardsLearned++;
            learned = true;
          }
          let colorScale = chroma.scale(['red', 'green']).mode('lab');
          let color = colorScale(score / this.scoreFileService.scoreCardLearned).css();
          this.data.push({ item: e.Simplified, score: score, learned: learned, color: color })
      });
    }

    this.data=this.data.slice();
  }

  onHide()
  {
    this.data = [];
    this.numberCardsLearned = 0;
    this.visible = false;
    this.hideEmitter.emit();
  }

  clear(table: Table) 
  {
    table.clear();
  }
}

type tableRow = 
{
  item: string,
  pinyin?: string,
  score: number,
  learned: boolean,
  color: string
}