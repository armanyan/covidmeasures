import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import Chart from 'chart.js';
import { HttpClient } from '@angular/common/http';

import { mobileWidth, monthNames, createLineChart, getCountryNameByAlpha, getAlpha3FromAlpha2,
         getChildrenNoSchool, getCountryPopulation } from '../utils';

interface Country {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.css']
})
export class CountryComponent implements OnInit {
  public isMobile: boolean;
  public countryView = "USA";
  public currentCountryName = "United States of America";
  public countryAllCasesCTX: Chart;
  public countryList: Country[];
  
  public schoolClosure = {status: 'No Data', date: '', impacted_children: 0, years: 0};
  public lockdown = {status: 'No Data', date: ''};
  public businessClosure = {status: 'No Data', date: '', days: 0};
  public countryImpactedPeople: number;
  public countryCumulatedYears: number;

  public statsDivider = 1;

  public options = ['In Total', 'Per COVID-19 Death', 'Per COVID-19 Active Case'];
  public currentOption = this.options[0];

  public evolutionUpdatedOn: string;

  public impactHeaders = [];
  public impactTable = [];

  private evolution: any;
  private schoolClosureData: any;
  private lockdownData: any;

  constructor(
    private titleService: Title,
    private http: HttpClient
  ) { }

  async ngOnInit() {
    this.titleService.setTitle('Country Overview: COVID-19 Statistics and Government Measures');
    this.isMobile = window.innerWidth > mobileWidth ? false : true;

    this.evolution = (await this.http.get('https://covidmeasures-data.s3.amazonaws.com/evolution.json').toPromise() as any);
    this.schoolClosureData = (await this.http.get('https://covidmeasures-data.s3.amazonaws.com/school_closure.json').toPromise() as any);
    this.lockdownData = (await this.http.get('https://covidmeasures-data.s3.amazonaws.com/lockdown.json').toPromise() as any);

    this.evolutionUpdatedOn = this.evolution.dates[this.evolution.dates.length - 1];

    try {
      const ip = await this.http.get('https://json.geoiplookup.io/api').toPromise();
      this.countryView = getAlpha3FromAlpha2((ip as any).country_code);
    } catch (_err) {
      this.countryView = 'USA';
    }
    this.currentCountryName = getCountryNameByAlpha(this.countryView);

    this.setStatsAndStatuses(this.countryView);

    const alphas = Object.keys(this.evolution.data);
    this.countryList = [];
    for (const alpha of alphas) {
      this.countryList.push({
        "value": alpha,
        "viewValue": this.evolution.data[alpha].name.split('_').join(' ')
      });
    }

    const labels = this.evolution.dates.map(date => this.changeDateFormat(date));

    const data = this.getDataSets(this.evolution.data.USA.cases, this.evolution.data.USA.deaths, labels);
    const dataSets = [
      {
        label: "Infection Cases",
        backgroundColor: "#3f51b552",
        borderColor: "#3399FF",
        fill: true,
        data: data.cases
      },
      {
        label: "Deaths",
        backgroundColor: "#f443365c",
        borderColor: "#f44336",
        fill: true,
        data: data.deaths
      }
    ]
     // One country cases evolution chart
     const countryAllCasesCTX = (document.getElementById("countryChartAllCases") as any).getContext("2d");
     this.countryAllCasesCTX = createLineChart(
        countryAllCasesCTX, 
        data.labels,
        dataSets,
        true,
        true,
        false // we make aspect ratio to false this prevents the chart from growing too much
       );
  }

  private getDataSets(activeCases: number[], deaths: number[], labels: string[]) {
    const shortenCases = [...activeCases];
    const shortenDeaths = [...deaths];
    const shortenLabels = [...labels];
    // remove today's data since in the other parts we use data from different sources,
    // and incoherence would be obvious
    shortenCases.pop(); shortenDeaths.pop(); shortenLabels.pop();
    for (const cases of activeCases) {
      // TODO try cutting out first 5 percent
      if (cases === 0) {
        shortenCases.shift(); shortenDeaths.shift(); shortenLabels.shift();
      } else {
        break;
      }
    }
    return { "cases": shortenCases, "deaths": shortenDeaths, "labels": shortenLabels }
  }

  private setStatsAndStatuses(alpha3: string) {
    const schoolCountry = this.getCountry(this.schoolClosureData.countries, alpha3);
    this.schoolClosure.status = schoolCountry.status;
    this.schoolClosure.date = schoolCountry.status === "Finished" ? schoolCountry.end : schoolCountry.start;
    this.schoolClosure.impacted_children =
      Math.floor((getChildrenNoSchool(alpha3)*schoolCountry.current_children_no_school)/this.statsDivider);
    this.schoolClosure.years =
      ((this.getMissedDaysPerCountry(schoolCountry) / 365) * this.schoolClosure.impacted_children) / this.statsDivider;

    const lockdownCountry = this.getCountry(this.lockdownData.countries, alpha3);
    this.lockdown.status = lockdownCountry.status;
    this.lockdown.date = lockdownCountry.status === "Finished" ? lockdownCountry.end : lockdownCountry.start;

    this.businessClosure.status = lockdownCountry.status_business;
    this.businessClosure.date = lockdownCountry.start_business_closure;
    this.businessClosure.days = this.getBusinessClosureDays(lockdownCountry)/this.statsDivider;

    this.countryImpactedPeople = Math.floor((getCountryPopulation(alpha3)*lockdownCountry.current_population_impacted)/this.statsDivider);
    this.countryCumulatedYears =
      ((this.getMissedDaysPerCountry(lockdownCountry) / 365) * this.countryImpactedPeople)/this.statsDivider;
  }

  /**
   * computes the school days missed in a specific country
   * @param country country data
   */
  private getMissedDaysPerCountry(country: any) {
    if (country.start === '') {
      return 0
    }
    const start = new Date(country.start);
    const today = new Date()
    const planedEnd = country.end === '' ? today : new Date(country.end);
    const end = today < planedEnd ? today : planedEnd;
    return Math.floor((end.getTime()-start.getTime())/(1000*60*60*24));
  }

  private getBusinessClosureDays(country: any) {
    if (country.start_business_closure === '') {
      return 0
    }
    const start = new Date(country.start_business_closure);
    const today = new Date()
    const planedEnd = country.end_business_closure === '' ? today : new Date(country.end_business_closure);
    const end = today < planedEnd ? today : planedEnd;
    return Math.floor((end.getTime()-start.getTime())/(1000*60*60*24));
  }

  private getCountry(countries, alpha3) {
    for (const country of countries) {
      if (country.alpha3 === alpha3 || country["alpha-3"] === alpha3) {
        return country;
      }
    }
  }

  public countryChangeView(value: string) {
    this.countryView = value;
    this.currentCountryName = getCountryNameByAlpha(value);
    this.setStatsAndStatuses(value);
    const datasets = this.getDataSets(
      this.evolution.data[value].cases,
      this.evolution.data[value].deaths,
      this.evolution.dates.map(date => this.changeDateFormat(date))
    )
    for (const country of this.countryList) {
      if (country.value === value) {

        this.countryAllCasesCTX.data.datasets[0].data  = datasets['cases'];
        this.countryAllCasesCTX.data.datasets[1].data = datasets['deaths'];
        this.countryAllCasesCTX.data.labels = datasets['labels'];
        this.countryAllCasesCTX.update();
        return;
      }
    }
  }

  /**
   * Transforms a european format date to universal
   * Ex: 15/01/2020 to 15 January 2020
   * @param date to change
   */
  private changeDateFormat(date: string) {
    const data = date.split('/');
    return `${data[0]} ${monthNames[parseInt(data[1])-1]} ${data[2]}` 
   }

   public changeViewOption(value: string) {
    this.currentOption = value;
    const reducer = (acc: number, currVal: number) => { return currVal + acc };
    if (value === 'In Total') {
      this.statsDivider = 1.0;
    } else if (value === 'Per COVID-19 Death') {
      this.statsDivider = this.evolution.data[this.countryView].deaths.reduce(reducer);
    } else {
      this.statsDivider = this.evolution.data[this.countryView].cases.reduce(reducer)
    }
    this.setStatsAndStatuses(this.countryView);
   }

}
