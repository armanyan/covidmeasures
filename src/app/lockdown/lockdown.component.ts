import { Component, OnInit } from '@angular/core';

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

  constructor() { }

  ngOnInit() {
    this.stats = lockdown_stats.values;
  }

  applyFilter(event: Event) {
    const search = (event.target as any).value.toLowerCase();
    this.stats = lockdown_stats.values.filter(
      row => row.country.toLowerCase().includes(search)
    );
  }

}
