import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';

import { TestingDataComponent } from 'app/components/testing-data/testing-data.component';
import { mobileWidth, aws, getCountryNameByAlpha } from '../utils';
import allCountries from '../data/countries';
import alpha3s from '../data/alpha3';
import country_codes from '../data/country_codes';

interface Location {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-testing',
  templateUrl: './testing.component.html',
  styleUrls: ['./testing.component.css']
})
export class TestingComponent implements OnInit {
  public isMobile: boolean;
  public rawTestingData;
  public testingData = [];
  public testingTableHeaders = ['Country', 'Positive Rate', 'Daily Tests', 'Total Cases'];
  public pageIndicator = 1;

  public locations: Location[] = [
    {value: 'World', viewValue: 'World'},
    {value: 'Northern America', viewValue: 'North America'},
    {value: 'Europe', viewValue: 'Europe'},
    {value: 'Asia', viewValue: 'Asia'},
    {value: 'Africa', viewValue: 'Africa'},
    {value: 'Oceania', viewValue: 'Oceania'},
    {value: 'Latin America and the Caribbean', viewValue: 'Latin America and the Caribbean'},
  ]

  public testingLocation = 'World';

  private evolution: any;
 
  constructor(
    private titleService: Title,
    private http: HttpClient,
    private dialog: MatDialog
  ) { }

  async ngOnInit() {
    this.isMobile = window.innerWidth > mobileWidth ? false : true;
    this.titleService.setTitle('Tests and Vaccines: Citizens Tracking COVID-19 Testing');

    this.rawTestingData = (await this.http.get(`${aws}/ourworldindata_testing.json`).toPromise() as any);
    this.evolution = (await this.http.get(`${aws}/evolution.json`).toPromise() as any);

    this.processTestingData(this.evolution, Object.keys(this.rawTestingData.data));
  }

  private async processTestingData(evolution, countries) {
    for (const alpha of countries) {
      if (!Object.keys(evolution.data).includes(alpha) || !Object.keys(this.rawTestingData.data).includes(alpha)) {
        continue;
      }
      const lastIndex = this.rawTestingData.data[alpha].length - 1;
      this.testingData.push({
        "alpha3": alpha,
        "name": getCountryNameByAlpha(alpha),
        "positive_rate": this.rawTestingData.data[alpha][lastIndex][7]*100,
        "daily_test": this.rawTestingData.data[alpha][lastIndex][1],
        "cases": evolution.data[alpha].cases.reduce((a, b) => a+b, 0)
      })
    }
  }

  public openDetailedData(indicator: string, country: string, alpha3) {
    this.dialog.open(TestingDataComponent, {
      width: '500px',
      data: { 
        indicator,
        country,
        alpha3,
        dataSets: {
          'testing': this.rawTestingData,
          'evolution': this.evolution
        }
      },
    });
  };

  public changeLocation(value:string) {
    this.testingLocation = value;
    this.testingData = [];

    switch (value) {
      case 'World':
        this.processTestingData(this.evolution, Object.keys(this.rawTestingData.data));
        break;
      case 'Northern America': {
        const northAmerica = country_codes.filter(country => country["sub-region"] == 'Northern America')
          .map(country => country["alpha-3"]);
        this.processTestingData(this.evolution, northAmerica);
        break;
      }
      case 'Europe': {
        const europe = country_codes.filter(country => country.region == 'Europe')
          .map(country => country["alpha-3"]);
        this.processTestingData(this.evolution, europe);
        break;
      }
      case 'Asia': {
        const asia = country_codes.filter(country => country.region == 'Asia')
          .map(country => country["alpha-3"]);
        this.processTestingData(this.evolution, asia);
        break;
      }
      case 'Africa': {
        const africa = country_codes.filter(country => country.region == 'Africa')
          .map(country => country["alpha-3"]);
        this.processTestingData(this.evolution, africa);
        break;
      }
      case 'Oceania': {
        const oceania = country_codes.filter(country => country.region == 'Oceania')
          .map(country => country["alpha-3"]);
        this.processTestingData(this.evolution, oceania);
        break;
      }
      case 'Latin America and the Caribbean':{
        const latinAmericaCaribbean = country_codes.filter(country => country["sub-region"] == 'Latin America and the Caribbean')
          .map(country => country["alpha-3"]);
        this.processTestingData(this.evolution, latinAmericaCaribbean);
        break;
      }
      default:
        this.processTestingData(this.evolution, []);
        break;
    }
  };

}
