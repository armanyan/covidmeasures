import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Title } from "@angular/platform-browser";
import Chart from 'chart.js';

import { createLineChart, getCountryNameByAlpha, monthNames, mobileWidth } from '../utils';

export interface Stats {
  country: string;
  total_cases: number;
  new_cases: number;
  total_deaths: number;
  new_deaths: number;
}

interface Country {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-covid',
  templateUrl: './covid.component.html',
  styleUrls: ['./covid.component.css']
})
export class CovidComponent implements OnInit {
  public isMobile: boolean;
  public statsHeaders = ['Country', 'Total Cases', 'New Cases', 'Total Deaths', 'New Deaths'];
  public stats: Stats[];
  public worldStats: Stats[];
  public worldDataUpdatedOn: string;
  public views = ['Day by Day', 'Total'];
  public casesView = 'Day by Day';
  public deathsView = 'Day by Day';

  public casesLastUpdate: string;
  public deathsLastUpdate: string;

  public casesChart: Chart;
  public deathsChart: Chart;

  public countryList: Country[];

  private casesEvolutionData: number[];
  private deathsEvolutionData: number[];

  private evolution: any;

  constructor(
    private titleService: Title,
    private http: HttpClient
  ) { }

  async ngOnInit() {
    this.titleService.setTitle('COVID-19 Statistics: Citizens Tracking COVID-19 Statistics');
    this.isMobile = window.innerWidth > mobileWidth ? false : true;

    const url = 'https://covidmeasures-data.s3.amazonaws.com/evolution.json';
    this.evolution = (await this.http.get(url).toPromise() as any);

    const casesCTX = (document.getElementById("chartCases") as any).getContext("2d");
    const labels = this.evolution.dates.map(date => this.changeDateFormat(date));
    // remove today's data since in the other parts we use data from different sources,
    // and incoherence would be obvious
    labels.pop()
    this.casesEvolutionData = this.getEvolutionData('cases');
    this.deathsEvolutionData = this.getEvolutionData('deaths');

    // World cases evolution chart
    this.casesChart = createLineChart(casesCTX, labels, this.casesEvolutionData);
    this.casesLastUpdate = labels[labels.length-1];

    // World deaths evolution chart
    const deathsCTX = (document.getElementById("chartDeaths") as any).getContext("2d");
    this.deathsChart = createLineChart(deathsCTX, labels, this.deathsEvolutionData);
    this.deathsLastUpdate = labels[labels.length-1];


    const alphas = Object.keys(this.evolution.data);
    this.countryList = [];
    for (const alpha of alphas) {
      this.countryList.push({
        "value": alpha,
        "viewValue": this.evolution.data[alpha].name.split('_').join(' ')
      });
    }

    // world table
    try {
      await this.fetchWorldData();
      this.stats = JSON.parse(JSON.stringify(this.worldStats)).slice(0, 10);
    } catch (e) {
      throw new Error(`AWS Evolution Error: ${e.message}`)
    }
    if (this.stats[this.stats.length-1].country === 'World') {
      return;
    }
    this.stats.push(this.getWorldRow());
  }

  /**
   *  Returns an array where every element represents the number of COVID-19 cases/deaths for every day since 31 December 2019
   * @param dataKey 'cases' if we compute the evolution of COVID-19 infection cases,
   *                'deaths' if we compute the evolution of COVID-19 deaths
   */
  private getEvolutionData(dataKey: string) {
    const data = []
    for (const index in this.evolution.dates) {
      let current = 0;
      for(const country in this.evolution.data) {
        current += this.evolution.data[country][dataKey][index]
      }
      data.push(current);
    }
    // remove today's data since in the other parts we use data from different sources,
    // and incoherence would be obvious
    data.pop();
    return data;
  }

  /**
   * Returns an array where every element represents the number of cumulated COVID-19 cases/deaths since 31 December 2019
   * @param evolutionData data returned by getEvolutionData function
   */
  private getTotalData(evolutionData: number[]) {
    const data = []
    let previousDay = 0;
    for (const current of evolutionData) {
      previousDay = previousDay + current;
      data.push(previousDay);
    }
    return data;
  }

  /**
   * Transforms a european format date to universal
   * Ex: 15/01/2020 to 15 January 2020
   * @param date to change
   */
  private changeDateFormat(date: string) {
    const data = date.split('/');
    return `${data[0]} ${monthNames[parseInt(data[1])-1]} ${data[2]}` 
   }

  public casesChangeView(view?: string) {
    if (view) {
      this.casesView = view;
    } else {
      this.casesView = this.casesView === 'Total' ? 'Day by Day' : 'Total';
    }
    if (this.casesView === 'Total') {
      this.casesChart.data.datasets[0].data = this.getTotalData(this.casesEvolutionData);
    } else {
      this.casesChart.data.datasets[0].data = this.getEvolutionData('cases');
    }
    this.casesChart.update();
  }

  public deathsChangeView(view?: string) {
    if (view) {
      this.deathsView = view;
    } else {
      this.deathsView = this.deathsView === 'Total' ? 'Day by Day' : 'Total';
    }
    if (this.deathsView === 'Total') {
      this.deathsChart.data.datasets[0].data = this.getTotalData(this.deathsEvolutionData);
    } else {
      this.deathsChart.data.datasets[0].data = this.getEvolutionData('deaths');
    }
    this.deathsChart.update();
  }

  /**
   * Fetches World COVID-19 data that is made from ECDC reports.
   */
  private async fetchWorldData() {
    const evolution = (await this.http.get('https://covidmeasures-data.s3.amazonaws.com/evolution.json').toPromise() as any);
    this.worldStats = [];
    for (const alpha in evolution.data) {
      this.worldStats.push({
        "country": evolution.data[alpha].name.split('_').join(' '),
        "total_cases": evolution.data[alpha].cases.reduce((a, b) => a+b),
        "new_cases": evolution.data[alpha].cases[evolution.data[alpha].cases.length-1],
        "total_deaths": evolution.data[alpha].deaths.reduce((a, b) => a+b),
        "new_deaths": evolution.data[alpha].deaths[evolution.data[alpha].deaths.length-1]
      });
    }
    const date = evolution.dates[evolution.dates.length - 1].split('/');
    this.worldDataUpdatedOn = date[0] + " " + monthNames[parseInt(date[1])-1]+" 2020";
  }

  /**
   * Search filter for the world COVID-19 Statistics table
   * @param event object that contains the search word entered by the user.
   */
  applyFilter(event: Event) {
    const search = (event.target as any).value.toLowerCase();
    this.stats = this.worldStats.filter(
      row => row.country.toLowerCase().includes(search)
    ).slice(0, 10);
    if (this.stats[this.stats.length-1].country !== "World") {
      this.stats.push(this.getWorldRow());
    }
  }

  /**
   * Computes a row for the COVID-19 world table that contains the combined data off all countries 
   */
  private getWorldRow() {
    const row = {
      "country": "World", "total_cases": 0, "new_cases": 0, "total_deaths": 0, "new_deaths": 0
    };
    const reducer = (acc, currVal) => {return currVal + acc};
    row.total_cases = this.worldStats.map(row => row.total_cases).reduce(reducer);
    row.new_cases = (this.worldStats.map(row => row.new_cases).reduce(reducer) as any);
    row.total_deaths = this.worldStats.map(row => row.total_deaths).reduce(reducer);
    row.new_deaths = (this.worldStats.map(row => row.new_deaths).reduce(reducer) as any);
    return row;
  }

}
