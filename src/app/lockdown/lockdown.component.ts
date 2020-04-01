import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as lockdown_stats from '../data/lockdown_countries_status.json';

@Component({
  selector: 'app-lockdown',
  templateUrl: './lockdown.component.html',
  styleUrls: ['./lockdown.component.css']
})
export class LockdownComponent implements OnInit {
  public tableData1: any;
  public statsHeaders = [ 'Country', 'Total Cases', 'New Cases', 'Total Deaths', 'New Deaths', 'Recovered'];
  public stats: any;
  public worldStats: any;
  public worldDataUpdatedOn: string;

  // TODO handle others correctly later on
  private wrongNameCountries = [
    'US', '', 'Iran (Islamic Republic of)', 'Hong Kong SAR', 'Others', 'Bahamas, The', 'Macao SAR', 'Russian Federation', 'Taiwan*',
    'Holy See', 'Viet Nam', 'occupied Palestinian territory'
  ];

  constructor(
    private http: HttpClient
  ) { }

  async ngOnInit() {
    try {
      await this.fetchWorldData();
      this.stats = JSON.parse(JSON.stringify(this.worldStats))
    } catch {
      this.stats = lockdown_stats.values;
    }
    if (this.stats[this.stats.length-1].country === 'World') {
      return;
    }
    this.stats.push(this.getWorldRow());
  }

  private getCountries(data: any) {
    const countries = [];
    for (const entry of data) {
      if (this.wrongNameCountries.indexOf(entry['Country']) < 0) {
        const row = {
          "country": entry['Country'], "total_cases": entry['TotalConfirmed'],
          "new_cases": entry['NewConfirmed'], "total_deaths": entry["TotalDeaths"],
          "new_deaths": entry["NewDeaths"], "recovered": entry["TotalRecovered"]
        }
        countries.push(row);
      } else if (this.wrongNameCountries.indexOf(entry['Country']) === 0) {
        const row = {
          "country": "USA", "total_cases": entry['TotalConfirmed'],
          "new_cases": entry['NewConfirmed'], "total_deaths": entry["TotalDeaths"],
          "new_deaths": entry["NewDeaths"], "recovered": entry["TotalRecovered"]
        }
        countries.push(row);
      }
    }
    return countries
  }

  private async fetchWorldData() {
    let data = await this.http.get('https://api.covid19api.com/summary').toPromise();
    this.worldStats = this.getCountries(data['Countries']);
    const date = new Date(data['Date']);
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    this.worldDataUpdatedOn = monthNames[date.getMonth()]+" "+date.getDate()+"th, "+date.getFullYear();
  }

  applyFilter(event: Event) {
    const search = (event.target as any).value.toLowerCase();
    this.stats = this.worldStats.filter(
      row => row.country.toLowerCase().includes(search)
    );
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
