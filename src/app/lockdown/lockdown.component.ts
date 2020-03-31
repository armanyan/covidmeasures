import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as lockdown_stats from '../data/lockdown_countries_status.json';

const getWorldRow = () => {
  const row = {
    "country": "World", "total_cases": 0, "new_cases": 0, "total_deaths": 0, "new_deaths": 0, "recovered": 0
  };
  const reducer = (acc, currVal) => {return currVal === 'N/A' ? acc : currVal + acc};
  row.total_cases = lockdown_stats.values.map(row => row.total_cases).reduce(reducer);
  row.new_cases = (lockdown_stats.values.map(row => row.new_cases).reduce(reducer) as any);
  row.total_deaths = lockdown_stats.values.map(row => row.total_deaths).reduce(reducer);
  row.new_deaths = (lockdown_stats.values.map(row => row.new_deaths).reduce(reducer) as any);
  row.recovered = lockdown_stats.values.map(row => row.recovered).reduce(reducer);
  return row;
}

@Component({
  selector: 'app-lockdown',
  templateUrl: './lockdown.component.html',
  styleUrls: ['./lockdown.component.css']
})
export class LockdownComponent implements OnInit {
  public tableData1: any;
  public statsHeaders = [ 'Country', 'Total Cases', 'New Cases', 'Total Deaths', 'New Deaths', 'Recovered'];
  public stats: any;

  constructor(
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.stats = lockdown_stats.values;
    if (this.stats[this.stats.length-1].country === 'World') {
      return;
    }
    this.stats.push(getWorldRow());
  }

  applyFilter(event: Event) {
    const search = (event.target as any).value.toLowerCase();
    this.stats = lockdown_stats.values.filter(
      row => row.country.toLowerCase().includes(search)
    );
    if (this.stats[this.stats.length-1].country !== "World") {
      this.stats.push(getWorldRow());
    }
  }

}
