import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { createLineChart, getCountryNameByAlpha, monthNames } from '../utils';
import * as covid from '../data/covid_evolution.json';

@Component({
  selector: 'app-covid',
  templateUrl: './covid.component.html',
  styleUrls: ['./covid.component.css']
})
export class CovidComponent implements OnInit {
  public statsHeaders = ['Country', 'Total Cases', 'New Cases', 'Total Deaths', 'New Deaths', 'Recovered'];
  public stats: any;
  public worldStats: any;
  public worldDataUpdatedOn: string;

  public casesLastUpdate: string;
  public deathsLastUpdate: string;
  public totalDeathCausesLastUpdate: string;

  constructor(
    private http: HttpClient
  ) { }

  async ngOnInit() {
    const casesCTX = (document.getElementById("chartCases") as any).getContext("2d");
    const labels = covid.dates.slice(32);
    const cases = covid.cases.slice(32);
    const deaths = covid.deaths.slice(32);
    createLineChart(casesCTX, labels, cases)
    this.casesLastUpdate = labels[labels.length-1];

    const deathsCTX = (document.getElementById("chartDeaths") as any).getContext("2d");
    createLineChart(deathsCTX, labels, deaths)
    this.deathsLastUpdate = labels[labels.length-1];

    // world table
    try {
      await this.fetchWorldData();
      this.stats = JSON.parse(JSON.stringify(this.worldStats)).slice(0, 10);
    } catch {
      // this.stats = lockdown_stats.values;
    }
    if (this.stats[this.stats.length-1].country === 'World') {
      return;
    }
    this.stats.push(this.getWorldRow());
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

}
