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
    "Country", "Name", "Description", "Device", "Target",
    "Geo-Tracking", "Big Data", "User App", "Status"
  ];

  public tableFull = [];
  public table = [];
  public pageIndicator = 1;
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
      this.tableFull.push({
        "country": row.country,
        "name": row.name,
        "desc": row.description,
        "device": row.device,
        "target": row.target,
        "geo": row.geo_tracking,
        "big_data": row.big_data,
        "app": row.app,
        "status": row.status
      });
    }
    this.table = this.tableFull;
  }

  public scroll(el: HTMLElement) {
    el.scrollIntoView();
  }

  /**
   * Search filter for the impacts table
   * @param event object that contains the search word entered by the user.
   */
  applyImpactFilter(event: Event) {
    const search = (event.target as any).value.toLowerCase();
    this.table = this.tableFull.filter(row => {
      if(row.country ? row.country.toLowerCase().includes(search) : false) return row;
      if(row.name ? row.name.toLowerCase().includes(search) : false) return row;
      if(row.desc ? row.desc.toLowerCase().includes(search) : false) return row;
      if(row.device ? row.device.toLowerCase().includes(search) : false) return row;
      if(row.status ? row.status.toLowerCase().includes(search) : false) return row;
    });
    this.pageIndicator = 1;
  }

}
