import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import * as border_control from '../data/border_control';
import { mobileWidth } from 'app/utils';
import {aws } from '../utils';
import { HttpClient } from '@angular/common/http';

import { Router } from '@angular/router';
import alpha3 from "../data/alpha3";
import { getAlpha3FromAlpha2 } from '../utils';
import { Location } from '@angular/common'; 

interface Country {
  value: string;
  viewValue: string;
  "sub-region": string;
}

@Component({
  selector: 'app-borders',
  templateUrl: './borders.component.html',
  styleUrls: ['./borders.component.css']
})
export class BordersComponent implements OnInit {
  public isMobile: boolean;
  public travelData: any;
  public headers = [
    "Country", "Foreigners Ban", "Home Quarantine", "COVID-19 Testing", "Closed Borders", "Other Measures",
    "Exceptions", "Start", "End", "Status"
  ];

  public table = [];

  public countryView: string;
  public countriesList: Country[] = [];

  public topic = {
    start: "",
    end: "",
    status: "No Data",
  };

  constructor(
    private http: HttpClient,
    private titleService: Title,
    private router: Router,
    private location: Location
  ) { }

  async ngOnInit() {
    this.titleService.setTitle('International Travel: Citizens Tracking Travel Restrictions Worldwide');
    this.isMobile = window.innerWidth > mobileWidth ? false : true;
    this.travelData = (await this.http.get(`${aws}/international_flights.json`).toPromise() as any);

    // this.setTable();

    this.countryView = await this.getUserCountry();
    this.getCountryView(this.countryView);

    for (const key in alpha3) {
      if (alpha3.hasOwnProperty(key)) {
        const element = alpha3[key];
        this.countriesList.push({
          value: element["alpha-3"],
          viewValue: element.name,
          "sub-region": element["sub-region"],
        });
      }``
    }
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
  public async getCountryView(alpha3: string) {

      await this.router.navigateByUrl(`borders/${alpha3}`);
      const countries = this.getCountry(this.travelData.countries, alpha3);

      this.topic.start = countries.start;
      this.topic.end = countries.end;
      this.topic.status = countries.status;
      this.countryView = alpha3; 
  }

  private async getUserCountry() {
    try {
      const ip = await this.http.get('http://ip-api.com/json/?fields=countryCode').toPromise();
      return getAlpha3FromAlpha2((ip as any).countryCode);
    } catch (_err) {
      return 'USA';
    }
  }

  public changeCountryView(alpha3){
    this.location.replaceState(`borders/${alpha3}`);
    const countries = this.getCountry(this.travelData.countries, alpha3);

    this.topic.start = countries.start;
    this.topic.end = countries.end;
    this.topic.status = countries.status;
    this.countryView = alpha3;
  }

  private getCountry(countries, alpha3) {
    for (const country of countries) {
      if (country.alpha3 === alpha3) {
        return country;
      }
    }
  }

}
