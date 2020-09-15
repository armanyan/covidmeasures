import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from "@angular/router";
import { Location } from '@angular/common'; 

import { FormBuilder, FormGroup } from '@angular/forms';
import * as typeformEmbed from '@typeform/embed';

import { mobileWidth, monthNames, getCountryNameByAlpha, getAlpha3FromAlpha2,
         getChildrenNoSchool, getCountryPopulation, aws } from '../utils';

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
    comment: ''
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
  private impactData: any;

  private evolution: any;
  private schoolClosureData: any;
  public lockdownData: any;
  private travelData: any;

  private countryPopulation:number = 0;
  public isClientReady: boolean = false;

  constructor(
    private titleService: Title,
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
    this.setImpactTable();
    this.setStatsAndStatuses(this.countryView);

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
    
    this.setTotalDeathRatio();
    this.setWidget();
  }

  private async getUserCountry() {
    try {
      const ip = await this.http.get(`https://ipinfo.io?token=999cc9c2d29155`).toPromise();
      return getAlpha3FromAlpha2((ip as any).country);
    } catch (_err) {
      return 'USA';
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
    this.lockdown.date = lockdownCountry.start;
    this.lockdown.current_coverage = lockdownCountry.current_coverage
    this.lockdown.restriction_type = lockdownCountry.restriction_type
    this.lockdown.start_reopening = lockdownCountry.start_reopening
    this.lockdown.end = lockdownCountry.end
    this.lockdown.comment = lockdownCountry.comments

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
      (this.getMissedDays(lockdownCountry.start, lockdownCountry.end)*affectedPopulation) / (365*this.statsDivider);

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
    const planedEnd = end === '' ? today : new Date(end);
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
    this.setStatsAndStatuses(value);
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

  private setTotalDeathRatio() {
    this.totalDeathRatio = this.evolution.data[this.countryView].deaths.reduce((a,b) => a + b) /
      this.evolution.data[this.countryView].cases.reduce((a,b) => a + b);
  }

  private setWidget() {
    document.getElementById('addImpact').addEventListener('click', function () {
      typeformEmbed.makePopup('https://admin114574.typeform.com/to/uTHShl', {
        hideFooter: true,
        hideHeaders: true,
        opacity: 0
      }).open();
    })
  }
}
