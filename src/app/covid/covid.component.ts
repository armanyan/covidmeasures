import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Title } from "@angular/platform-browser";
import Chart from 'chart.js';

import { createLineChart, getCountryNameByAlpha, monthNames } from '../utils';
import * as evolution from '../data/ecdc';

export interface Stats {
  country: string;
  total_cases: number;
  new_cases: number;
  total_deaths: number;
  new_deaths: number;
  recovered: number;
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
  public statsHeaders = ['Country', 'Total Cases', 'New Cases', 'Total Deaths', 'New Deaths', 'Recovered'];
  public stats: Stats[];
  public worldStats: Stats[];
  public worldDataUpdatedOn: string;
  public views = ['Day by Day', 'Total'];
  public casesView = 'Day by Day';
  public deathsView = 'Day by Day';
  public countryCasesView = "US";
  public countryDeathsView = "US";

  public casesLastUpdate: string;
  public deathsLastUpdate: string;
  public totalDeathCausesLastUpdate: string;

  public casesChart: Chart;
  public deathsChart: Chart;

  public countryCasesChart: Chart;
  public countryDeathsChart: Chart;

  public countryList: Country[];

  private casesEvolutionData: number[];
  private deathsEvolutionData: number[];

  constructor(
    private titleService: Title,
    private http: HttpClient
  ) { }

  async ngOnInit() {
    this.titleService.setTitle('COVID-19 Statistics');
    this.isMobile = window.innerWidth > 991 ? false : true;
    const casesCTX = (document.getElementById("chartCases") as any).getContext("2d");
    const labels = evolution.default.dates.map(date => this.changeDateFormat(date));
    // remove today's data since in the other parts we use data from different sources,
    // and incoherence would be obvious
    labels.pop()
    this.casesEvolutionData = this.getEvolutionData('cases');
    this.deathsEvolutionData = this.getEvolutionData('deaths');

    this.casesChart = createLineChart(casesCTX, labels, this.casesEvolutionData);
    this.casesLastUpdate = labels[labels.length-1];

    const deathsCTX = (document.getElementById("chartDeaths") as any).getContext("2d");
    this.deathsChart = createLineChart(deathsCTX, labels, this.deathsEvolutionData);
    this.deathsLastUpdate = labels[labels.length-1];


    const alphas = Object.keys(evolution.default.data);
    this.countryList = [];
    for (const alpha of alphas) {
      this.countryList.push({
        "value": alpha,
        "viewValue": evolution.default.data[alpha].name.split('_').join(' ')
      });
    }

    const countryCasesCTX = (document.getElementById("countryChartCases") as any).getContext("2d");
    this.countryCasesChart = createLineChart(countryCasesCTX, labels, evolution.default.data.US.cases);

    const countryDeathsCTX = (document.getElementById("countryChartDeaths") as any).getContext("2d");
    this.countryDeathsChart = createLineChart(countryDeathsCTX, labels, evolution.default.data.US.deaths);


    // world table
    try {
      await this.fetchWorldData();
      this.stats = JSON.parse(JSON.stringify(this.worldStats)).slice(0, 10);
    } catch (e) {
      throw new Error(`Covid19API Error: ${e.message}`)
    }
    if (this.stats[this.stats.length-1].country === 'World') {
      return;
    }
    this.stats.push(this.getWorldRow());
  }

  private getEvolutionData(dataKey: string) {
    const data = []
    for (const index in evolution.default.dates) {
      let current = 0;
      for(const country in evolution.default.data) {
        current += evolution.default.data[country][dataKey][index]
      }
      data.push(current);
    }
    // remove today's data since in the other parts we use data from different sources,
    // and incoherence would be obvious
    data.pop();
    return data;
  }

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


  // world table part
  private getCountries(data: any) {
    return data.map(row => {
      return {
        "country": getCountryNameByAlpha(row["CountryCode"]), "total_cases": row['TotalConfirmed'],
        "new_cases": row['NewConfirmed'], "total_deaths": row["TotalDeaths"],
        "new_deaths": row["NewDeaths"], "recovered": row["TotalRecovered"]
      }
    })
  }

  private async fetchWorldData() {
    let data = await this.http.get('https://api.covid19api.com/summary').toPromise();
    this.worldStats = this.getCountries(data['Countries']);
    const date = new Date(data['Date']);
    this.worldDataUpdatedOn = monthNames[date.getMonth()]+" "+date.getDate()+"th, "+date.getFullYear();
  }

  applyFilter(event: Event) {
    const search = (event.target as any).value.toLowerCase();
    this.stats = this.worldStats.filter(
      row => row.country.toLowerCase().includes(search)
    ).slice(0, 10);
    if (this.stats[this.stats.length-1].country !== "World") {
      this.stats.push(this.getWorldRow());
    }
  }

  private getWorldRow() {
    const row = {
      "country": "World", "total_cases": 0, "new_cases": 0, "total_deaths": 0, "new_deaths": 0, "recovered": 0
    };
    const reducer = (acc, currVal) => {return currVal + acc};
    row.total_cases = this.worldStats.map(row => row.total_cases).reduce(reducer);
    row.new_cases = (this.worldStats.map(row => row.new_cases).reduce(reducer) as any);
    row.total_deaths = this.worldStats.map(row => row.total_deaths).reduce(reducer);
    row.new_deaths = (this.worldStats.map(row => row.new_deaths).reduce(reducer) as any);
    row.recovered = this.worldStats.map(row => row.recovered).reduce(reducer);
    return row;
  }

  public countryCasesChangeView(value: string) {
    this.countryCasesView = value;
    for (const country of this.countryList) {
      if (country.value === value) {
        this.countryCasesChart.data.datasets[0].data = evolution.default.data[value].cases;
        this.countryCasesChart.update();
        return;
      }
    }
  }

  public countryDeathsChangeView(value: string) {
    this.countryDeathsView = value;
    for (const country of this.countryList) {
      if (country.value === value) {
        this.countryDeathsChart.data.datasets[0].data = evolution.default.data[value].deaths;
        this.countryDeathsChart.update();
        return;
      }
    }
  }

}
