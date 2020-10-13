import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

import { mobileWidth, aws, getCountryNameByAlpha } from '../utils';

@Component({
  selector: 'app-testing',
  templateUrl: './testing.component.html',
  styleUrls: ['./testing.component.css']
})
export class TestingComponent implements OnInit {
  public isMobile: boolean;
  public testingData = [];
  public testingTableHeaders = ['Country', 'Positive Rate', 'Daily Tests', 'Total Cases'];
  public pageIndicator = 1;

  private evolution: any;
 
  constructor(
    private titleService: Title,
    private http: HttpClient
  ) { }

  async ngOnInit() {
    this.isMobile = window.innerWidth > mobileWidth ? false : true;
    this.titleService.setTitle('Tests and Vaccines: Citizens Tracking COVID-19 Testing');
    this.processTestingData();
  }

  private async processTestingData() {
    const rawTestingData = (await this.http.get(`${aws}/ourworldindata_testing.json`).toPromise() as any);
    this.evolution = (await this.http.get(`${aws}/evolution.json`).toPromise() as any);

    for (const alpha of Object.keys(rawTestingData.data)) {
      if (!Object.keys(this.evolution.data).includes(alpha)) {
        continue;
      }
      const lastIndex = rawTestingData.data[alpha].length - 1;
      const evolutionIndex = this.evolution.data[alpha].cases.length - 1;
      this.testingData.push({
        "alpha3": alpha,
        "name": getCountryNameByAlpha(alpha),
        "positive_rate": rawTestingData.data[alpha][lastIndex][7]*100,
        "daily_test": rawTestingData.data[alpha][lastIndex][1],
        "cases": this.evolution.data[alpha].cases[evolutionIndex]
      })
    }
  }

}
