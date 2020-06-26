import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { mobileWidth, aws } from '../utils';

@Component({
  selector: 'app-masks',
  templateUrl: './masks.component.html',
  styleUrls: ['./masks.component.css']
})
export class MasksComponent implements OnInit {
  public isMobile: boolean;
  public readMore = false;
  public countryMasksData: any;

  public survey_answers: any;
  public answers_label: Array<string>;
  public answers_value: Array<number>;
  public backgroundColor: Array<string> = ['rgb(91, 86, 237)','rgb(237, 86, 88)','rgb(108, 185, 113)','rgb(229, 229, 229)']

  constructor(
    private titleService: Title,
    private changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.isMobile = window.innerWidth > mobileWidth ? false : true;
    this.titleService.setTitle('Masks: Citizens Tracking Masks Issues Related to COVID-19');

  }

  async ngAfterViewInit(){
    // this.countryMasksData = await this.http.get(`${aws}/masks_survey.json`).toPromise();
    fetch(`${aws}/masks_survey.json`).then(res => res.json()).then((data) => {
      this.countryMasksData = data;
      this.changeDetector.detectChanges();
      const q3Count = {};
      data.forEach((survey) => {
        if (survey['Q3 - Efficient']) {
          if(q3Count[survey['Q3 - Efficient']]){
            q3Count[survey['Q3 - Efficient']].number = q3Count[survey['Q3 - Efficient']].number + 1;
            q3Count[survey['Q3 - Efficient']].percent = 
              parseFloat(((q3Count[survey['Q3 - Efficient']].number / data.length) * 100).toFixed(2));
          }else {
            q3Count[survey['Q3 - Efficient']] = {
              answer: survey['Q3 - Efficient'],
              number: 1,
              percent: parseFloat(((1 / data.length) * 100).toFixed(2))
            };
          }
        }
      });
      this.survey_answers = Object.keys( q3Count ).map( key => q3Count[key]);
      this.answers_label =  Object.keys( q3Count ).map( key => q3Count[key]).map( key => key.answer );
      this.answers_value = Object.keys( q3Count ).map( key => q3Count[key]).map( key => key.percent );
    });
  }
}
