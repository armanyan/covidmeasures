import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Title } from "@angular/platform-browser";
import Chart from 'chart.js';

import { createLineChart, monthNames, mobileWidth } from '../utils';

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
  public dataLastUpdate: string;
  public views = ['Day by Day', 'Total'];
  public casesView = 'Day by Day';
  public deathsView = 'Day by Day';
  public filterCountry : string;
  public sortStatus = {
    country: {
      active:true,
      asc: true
    },
    totalCases : {
      active:false,
      asc: false
    },
    newCases : {
      active:false,
      asc: false
    },
    totalDeaths : {
      active:false,
      asc: false
    },
    newDeaths : {
      active:false,
      asc: false
    }
  };

  public casesChart: Chart;
  public deathsChart: Chart;

  public countryList: Country[];

  private cases: number[];
  private deaths: number[];

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

    const labels = this.evolution.dates.map(date => this.changeDateFormat(date));
    this.cases = this.getEvolutionData('cases');
    this.deaths = this.getEvolutionData('deaths');
    
    // World cases evolution chart
    this.casesChart = createLineChart((document.getElementById("chartCases") as any).getContext("2d"), labels, this.cases);
    this.dataLastUpdate = labels[labels.length-1];

    // World deaths evolution chart
    this.deathsChart = createLineChart((document.getElementById("chartDeaths") as any).getContext("2d"), labels, this.deaths);


    this.countryList = [];
    for (const alpha of Object.keys(this.evolution.data)) {
      this.countryList.push({
        "value": alpha,
        "viewValue": this.evolution.data[alpha].name.split('_').join(' ')
      });
    }

    // world table
    try {
      await this.composeWorldData();
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
    this.casesView = view ? view :
      this.casesView === 'Total' ? 'Day by Day' : 'Total';

    this.casesChart.data.datasets[0].data = this.casesView === 'Total' ?
      this.getTotalData(this.cases) : this.getEvolutionData('cases');

    this.casesChart.update();
  }

  public deathsChangeView(view?: string) {
    this.deathsView = view ? view :
      this.deathsView === 'Total' ? 'Day by Day' : 'Total';
    
    this.deathsChart.data.datasets[0].data = this.deathsView === 'Total' ?
      this.getTotalData(this.deaths) : this.getEvolutionData('deaths');
    
    this.deathsChart.update();
  }

  /**
   * Composes World COVID-19 data that is made from ECDC reports.
   */
  private async composeWorldData() {
    this.worldStats = [];
    for (const alpha in this.evolution.data) {
      this.worldStats.push({
        "country": this.evolution.data[alpha].name.split('_').join(' '),
        "total_cases": this.evolution.data[alpha].cases.reduce((a, b) => a+b),
        "new_cases": this.evolution.data[alpha].cases[this.evolution.data[alpha].cases.length-1],
        "total_deaths": this.evolution.data[alpha].deaths.reduce((a, b) => a+b),
        "new_deaths": this.evolution.data[alpha].deaths[this.evolution.data[alpha].deaths.length-1]
      });
    }
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

  public sortTable(sortBy: string) {
    // 'Country', 'Total Cases', 'New Cases', 'Total Deaths', 'New Deaths'
    const tableStats = this.filterCountry ? 
      this.stats.filter(item => item.country != 'World') : JSON.parse(JSON.stringify(this.worldStats));

    for (const key in this.sortStatus) {
      if (this.sortStatus.hasOwnProperty(key)) {
        this.sortStatus[key].active = false;
      }
    }
    switch (sortBy) {
      case 'Country':
        this.sortStatus.country.asc ?
          this.stats = tableStats.sort((a, b) => b.country.localeCompare(a.country)).slice(0, 10) :
          this.stats = tableStats.sort((a, b) => a.country.localeCompare(b.country)).slice(0, 10)
        this.sortStatus.country.asc = !this.sortStatus.country.asc;
        this.sortStatus.country.active = true;
        break;

      case 'Total Cases':
        this.sortStatus.totalCases.asc ?
          this.stats = tableStats.sort((a, b) => b.total_cases - a.total_cases).slice(0, 10) :
          this.stats = tableStats.sort((a, b) => a.total_cases - b.total_cases).slice(0, 10)
        this.sortStatus.totalCases.asc = !this.sortStatus.totalCases.asc;
        this.sortStatus.totalCases.active = true;
      break;

      case 'New Cases':
        this.sortStatus.newCases.asc ?
          this.stats = tableStats.sort((a, b) => b.new_cases - a.new_cases).slice(0, 10) :
          this.stats = tableStats.sort((a, b) => a.new_cases - b.new_cases).slice(0, 10)
        this.sortStatus.newCases.asc = !this.sortStatus.newCases.asc;
        this.sortStatus.newCases.active = true;
        break;
      
      case 'Total Deaths':
        this.sortStatus.totalDeaths.asc ?
          this.stats = tableStats.sort((a, b) => b.total_deaths - a.total_deaths).slice(0, 10) :
          this.stats = tableStats.sort((a, b) => a.total_deaths - b.total_deaths).slice(0, 10)
        this.sortStatus.totalDeaths.asc = !this.sortStatus.totalDeaths.asc;
        this.sortStatus.totalDeaths.active = true;
        break;
      
      case 'New Deaths':
        this.sortStatus.newDeaths.asc ?
          this.stats = tableStats.sort((a, b) => b.new_deaths - a.new_deaths).slice(0, 10) :
          this.stats = tableStats.sort((a, b) => a.new_deaths - b.new_deaths).slice(0, 10)
        this.sortStatus.newDeaths.asc = !this.sortStatus.newDeaths.asc;
        this.sortStatus.newDeaths.active = true;
        break;

      default:
        break;
    }
    if (this.stats[this.stats.length-1].country !== "World") {
      this.stats.push(this.getWorldRow());
    }

  }

}
