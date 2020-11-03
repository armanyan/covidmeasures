import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from "@angular/router";
import { Location } from '@angular/common'; 
import { FormBuilder, FormGroup } from '@angular/forms';
import * as typeformEmbed from '@typeform/embed';

import { mobileWidth, getCountryNameByAlpha, getAlpha3FromAlpha2,
         getChildrenNoSchool, getCountryPopulation, aws } from '../utils';
import * as world_gdp_rate from '../data/world_gdp_rate';
import * as world_imports from '../data/world_imports';
import * as world_exports from '../data/world_exports';
import * as world_unemployment_rate from '../data/world_unemployment_rate';

interface Country {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.css'],
})
export class CountryComponent implements OnInit {
  public readMore = false;
  public calendarForm: FormGroup;
  
  public isMobile: boolean;
  public countryView = "USA";
  public currentCountryName = "United States of America";

  public countryList: Country[];

  public schoolClosure = {
    status: 'No Data',
    date: '',
    impacted_children: 0,
    years: 0,
    message: 'Educational Facilities Closed On',
    current_coverage: '',
    start_reopening: '',
    end: '',
    comment: ''
  };
  public lockdown = {
    status: 'No Data',
    date: '',
    current_coverage: '',
    restriction_type: '',
    start_reopening: '',
    end: '',
    comment: '',
    lockdown_counter: 0
  };
  public businessClosure = {
    status: 'No Data',
    date: '',
    days: 0,
    start_reopening_business: '', 
    end_business: ''
  };
  public travel = {
    start: '',
    end: '',
    status: 'No Data',
  };
  public countryImpactedPeople: number;
  public countryCumulatedYears: number;

  public currentDeathRatio: number;
  public totalDeathRatio: number;

  public statsDivider = 1;

  public options = ['In Total', 'Per COVID-19 Death', 'Per COVID-19 Case'];
  public currentOption = this.options[0];

  public evolutionUpdatedOn: string;

  public impactHeaders = ['Measure', 'Impact', 'Description', 'Source'];
  public impactTable = [];

  public lockdownData: any;
  public isClientReady: boolean = false;

  public testingPositiveRatio: number;
  public testingDaily: number;

  public import: number;
  public export: number;

  public economic_data = {
    'Country': this.currentCountryName,
    'GDP': { last: '', avg: 0 },
    'Unemployment Rate': { last: '', avg: 0 },
    'Imports': { last: '', avg: 0 },
    'Exports': { last: '', avg: 0 },
  };

  private impactData: any;

  public evolution: any;
  private schoolClosureData: any;
  private travelData: any;
  private testingData: any;

  private countryPopulation:number = 0;

  constructor(
    public titleService: Title,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private formBuilder: FormBuilder,
    private changeDetector: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    this.calendarForm = this.formBuilder.group({
      dateRange: null
    });

    this.titleService.setTitle('Country Overview: COVID-19 Statistics and Government Measures');
    this.isMobile = window.innerWidth > mobileWidth ? false : true;

    this.evolution = (await this.http.get(`${aws}/evolution.json`).toPromise() as any);
    this.schoolClosureData = (await this.http.get(`${aws}/school_closure.json`).toPromise() as any);
    this.lockdownData = (await this.http.get(`${aws}/lockdown.json`).toPromise() as any);
    this.impactData = (await this.http.get(`${aws}/community_impacts.json`).toPromise() as any);
    this.travelData = (await this.http.get(`${aws}/international_flights.json`).toPromise() as any);
    this.testingData = (await this.http.get(`${aws}/ourworldindata_testing.json`).toPromise() as any);
    this.setImpactTable();

    this.countryList = [];
    for (const alpha of Object.keys(this.evolution.data)) {
      this.countryList.push({
        "value": alpha,
        "viewValue": this.evolution.data[alpha].name.split('_').join(' ')
      });
    }
    this.isClientReady = true;
    this.changeDetector.detectChanges();
    const alpha3 = this.activatedRoute.snapshot.paramMap.get('alpha3');
    if (alpha3) {
      this.countryChangeView(alpha3);
    } else {
      this.countryView = await this.getUserCountry();
      this.location.go('/country/'+this.countryView)
    }

    this.currentCountryName = getCountryNameByAlpha(this.countryView);
    this.setStatsAndStatuses(this.countryView);
    this.setEconomicData();

    this.setTotalDeathRatio();
  }

  private async getUserCountry() {
    try {
      const ip = await this.http.get(`https://ipinfo.io?token=999cc9c2d29155`).toPromise();
      return getAlpha3FromAlpha2((ip as any).country);
    } catch (_err) {
      return 'USA';
    }
  }

  private setEconomicData() {
    let dates;
    let value;
    this.economic_data.Country = this.currentCountryName;
    const datasets = { 
      "GDP": world_gdp_rate.default,
      "Unemployment Rate": world_unemployment_rate.default, 
      "Imports": world_imports.default,
      "Exports": world_exports.default
    };
    for (const key of Object.keys(datasets)) {
      const alpha = this.getAlpha3FromName(this.currentCountryName, this.evolution);
      dates = Object.keys(datasets[key][this.currentCountryName]).filter(date => date.startsWith('2020'));
      const dates2019 = Object.keys(datasets[key][this.currentCountryName]).filter(date => date.startsWith('2019'));
      const average2019 = key === "GDP" ? 0 : 
        !dates2019.length ? 0 :
        dates2019.map(date => datasets[key][this.currentCountryName][date]).reduce((a, b) => a+b)/dates2019.length;

      value = 0;
      for (const date of dates) {
        value += datasets[key][this.currentCountryName][date] - average2019;
      }
      if (value !== 0) {
        value = ['Imports', 'Exports'].includes(key) ? ((value / dates.length) / average2019)*100 : value / dates.length;
        this.economic_data[key].avg = value;
        this.economic_data[key].last = dates[dates.length-1];
      } else {
        this.economic_data[key].avg = undefined;
        this.economic_data[key].last = undefined;
      }
    }
  }

  private setStatsAndStatuses(alpha3: string) {
    const schoolCountry = this.getCountry(this.schoolClosureData.countries, alpha3);
    this.schoolClosure.status = schoolCountry.status;
    this.schoolClosure.message = schoolCountry.status === 'Re-opened' ? 'Educational Facilities Re-opened Since' : 'Educational Facilities Closed On';
    this.schoolClosure.date = schoolCountry.status === 'Re-opened' ? schoolCountry.end : schoolCountry.start;
    this.schoolClosure.current_coverage = schoolCountry.current_coverage
    this.schoolClosure.start_reopening = schoolCountry.start_reopening
    this.schoolClosure.end = schoolCountry.end
    this.schoolClosure.comment = schoolCountry.comment

    const affectedChildren = getChildrenNoSchool(alpha3)*schoolCountry.current_children_no_school;
    this.schoolClosure.impacted_children =
      Math.floor((affectedChildren)/this.statsDivider);
    this.schoolClosure.years = (
      this.getMissedDays(schoolCountry.start, schoolCountry.end)*affectedChildren) / (365*this.statsDivider
    );

    const lockdownCountry = this.getCountry(this.lockdownData.countries, alpha3);
    this.lockdown.status = lockdownCountry.status;
    const length = lockdownCountry['dates'].length - 1;
    this.lockdown.date = lockdownCountry['dates'][length].start;
    this.lockdown.current_coverage = lockdownCountry.current_coverage;
    this.lockdown.restriction_type = lockdownCountry.restriction_type;
    this.lockdown.start_reopening = lockdownCountry['dates'][length].start_reopening;
    this.lockdown.end = lockdownCountry['dates'][length].end;
    this.lockdown.comment = lockdownCountry.comments;
    this.lockdown.lockdown_counter = length + 1;

    this.businessClosure.status = lockdownCountry.status_business;
    this.businessClosure.date = lockdownCountry.start_business_closure;
    this.businessClosure.days =
      this.getMissedDays(lockdownCountry.start_business_closure, lockdownCountry.end_business_closure);
    this.businessClosure.start_reopening_business = lockdownCountry.start_reopening_business
    this.businessClosure.end_business = lockdownCountry.end_business

    const travelCountry = this.getCountry(this.travelData.countries, alpha3);
    this.travel.start = travelCountry.start;
    this.travel.end = travelCountry.end;
    this.travel.status = travelCountry.status;

    this.countryPopulation = getCountryPopulation(alpha3);
    const affectedPopulation = this.countryPopulation * lockdownCountry.current_population_impacted;
    this.countryImpactedPeople = Math.floor(affectedPopulation/this.statsDivider);
    this.countryCumulatedYears =
      (this.getMissedDays(this.lockdown.date, this.lockdown.end)*affectedPopulation) / (365*this.statsDivider);

    this.setImpactTable();
  }

  /**
   * computes days missed
   * @param start start of the restrictions
   * @param end end of the restrictions
   */
  private getMissedDays(start: string, end: string) {
    if (start === '') {
      return 0
    }
    const start_data = new Date(start);
    const today = new Date()
    // TODO replace by a regex
    const planedEnd = end === '' || end === undefined ? today : new Date(end);
    const end_date = today < planedEnd ? today : planedEnd;
    return Math.floor((end_date.getTime()-start_data.getTime())/(1000*60*60*24));
  }

  private getCountry(countries, alpha3) {
    for (const country of countries) {
      if (country.alpha3 === alpha3) {
        return country;
      }
    }
  }

  public countryChangeView(value: string) {
    this.countryView = value;
    this.setTotalDeathRatio();
    this.location.go('/country/'+value) // we change the url: /country/value:
    this.currentCountryName = getCountryNameByAlpha(value);
    this.setEconomicData();
    this.setStatsAndStatuses(value);
    this.setTestingData(value);
  }

  private setTestingData(alpha3: string) {
    if (alpha3) {
      if (Object.keys(this.testingData.data).includes(alpha3)) {
        const index = this.testingData.data[alpha3].length - 1;
        this.testingPositiveRatio = this.testingData.data[alpha3][index][7]*100;
        this.testingDaily = this.testingData.data[alpha3][index][1];
      }
    }
  }

  public changeViewOption(value: string) {
    this.currentOption = value;
    if (value === 'In Total') {
      this.statsDivider = 1.0;
    } else if (value === 'Per COVID-19 Death') {
      this.statsDivider = this.evolution.data[this.countryView].deaths.reduce((a, b) => a+b);
    } else {
      this.statsDivider = this.evolution.data[this.countryView].cases.reduce((a, b) => a+b);
    }
    this.setStatsAndStatuses(this.countryView);
  }

  private async setImpactTable() {
    this.impactTable = [];
    for (const impact of this.impactData) {
      if (impact.alpha3 === undefined) {
        continue;
      }

      if (impact.alpha3[0] === 'WRD' || impact.alpha3[0] === this.countryView) {
        this.impactTable.push(impact);
      }
    }
  }

  private getAlpha3FromName(name: string, evolution: any) {
    for (const country of Object.keys(evolution.data)) {
      if (
        evolution.data[country].name === name ||
        evolution.data[country].name.replace(/_/g, ' ') === name ||
        evolution.data[country].name.split(' ').slice(0,2).join(' ').toLowerCase() === name.toLocaleLowerCase() || 
        evolution.data[country].name.split('_').slice(0,2).join(' ').toLowerCase() === name.toLocaleLowerCase()
        ) {
        return country;
      }
    }
    return undefined;
  }

  private setTotalDeathRatio() {
    this.totalDeathRatio = this.evolution.data[this.countryView].deaths.reduce((a,b) => a + b) /
      this.evolution.data[this.countryView].cases.reduce((a,b) => a + b);
  }

  public openPopUp() {
    typeformEmbed.makePopup('https://admin114574.typeform.com/to/uTHShl', {
      hideFooter: true,
      hideHeaders: true,
      opacity: 0
    }).open();
  }
}
