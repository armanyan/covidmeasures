import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import Chart from 'chart.js';
import { mobileWidth, aws, createPieChart } from '../utils';
import moment from 'moment';

@Component({
  selector: 'app-masks',
  templateUrl: './masks.component.html',
  styleUrls: ['./masks.component.css']
})
export class MasksComponent implements OnInit {
  public isMobile: boolean;
  public readMore = false;
  public countryMasksData: any;

  public masksPieChart: Chart;
  public maskPieLastUpdated: string;
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
      // const survey_answers = Object.keys( q3Count ).map( key => q3Count[key]);
      const answers_label =  Object.keys( q3Count ).map( key => q3Count[key]).map( key => key.answer );
      const answers_value = Object.keys( q3Count ).map( key => q3Count[key]).map( key => key.percent );
      const backgroundColor: Array<string> = ['rgb(91, 86, 237)','rgb(237, 86, 88)','rgb(108, 185, 113)','rgb(229, 229, 229)']
      const countriesCTX = (document.getElementById("masksPieChart") as any).getContext("2d");
      this.masksPieChart = createPieChart(countriesCTX, answers_label, answers_value, backgroundColor, 'Countries');

      const latestDate = new Date(Math.max.apply(null, data.map(function(e) {
        return new Date(e['Submition Date']);
      })));
      this.maskPieLastUpdated = moment(latestDate).format('LLL');
    });
  }
}