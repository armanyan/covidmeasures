import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { mobileWidth } from '../utils';
import * as surveillance from '../data/surveillance';

@Component({
  selector: 'app-surveillance',
  templateUrl: './surveillance.component.html',
  styleUrls: ['./surveillance.component.css']
})
export class SurveillanceComponent implements OnInit {
  public isMobile: boolean;
  public readMore = false;

  public headers = [
    "Country", "Name", "Description", "Release Date", "Device", "Target",
    "Geo-Tracking", "Big Data", "User App", "Other Features", "Status"
  ];

  public table = [];
  public isClientReady: boolean = false;
  constructor(
    public titleService: Title
  ) { }

  ngOnInit() {
    this.titleService.setTitle('Surveillance: Citizens Tracking Surveillance Measures');
    this.isMobile = window.innerWidth > mobileWidth ? false : true;

    this.setTable();
    setTimeout(()=> this.isClientReady = true, 500);
  }

  private setTable() {
    for (const row of surveillance.default) {
      this.table.push({
        "country": row.country,
        "name": row.name,
        "desc": row.description,
        "release": row.release,
        "device": row.device,
        "target": row.target,
        "geo": row.geo_tracking,
        "big_data": row.big_data,
        "app": row.app,
        "other": row.other,
        "status": row.status
      });
    }
  }

}
