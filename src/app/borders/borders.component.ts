import { Component, OnInit } from '@angular/core';

import * as border_control from '../data/border_control';

@Component({
  selector: 'app-borders',
  templateUrl: './borders.component.html',
  styleUrls: ['./borders.component.css']
})
export class BordersComponent implements OnInit {
  public isMobile: boolean;

  public headers = [
    "Country", "Foreigners Ban", "Home Quarantine", "COVID-19 Testing", "Closed Borders", "Other Measures",
    "Exceptions", "Start", "End", "Status"
  ];

  public table = [];

  constructor() { }

  ngOnInit() {
    this.isMobile = window.innerWidth > 991 ? false : true;

    this.setTable();
  }

  private setTable() {
    for (const row of border_control.default) {
      this.table.push({
        "country": row.country,
        "ban": row.ban,
        "quarantine": row.quarantine,
        "testing": row.testing,
        "borders": row.closed_borders,
        "other": row.other,
        "except": row.exceptions,
        "start": row.start,
        "end": row.end,
        "status": row.status
      });
    }
  } 

}
