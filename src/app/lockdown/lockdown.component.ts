import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ageRanges, getCountryNameByAlpha, getRegionByAlpha } from '../utils';
import * as lockdownData from '../data/full_lockdown';
import * as countriesData from '../data/countries';

interface Location {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-lockdown',
  templateUrl: './lockdown.component.html',
  styleUrls: ['./lockdown.component.css']
})
export class LockdownComponent implements OnInit {
  public isMobile: boolean;

  public locations: Location[] = [
    {value: 'World', viewValue: 'World'},
    {value: 'Northern America', viewValue: 'North America'},
    {value: 'Europe', viewValue: 'Europe'},
    {value: 'Asia', viewValue: 'Asia'},
    {value: 'Africa', viewValue: 'Africa'},
    {value: 'Oceania', viewValue: 'Oceania'},
    {value: 'Latin America and the Caribbean', viewValue: 'Latin America and the Caribbean'},
  ]

  public statsHeaders = [
    'Name', 'Start', 'End', 'Duration', 'Lockdown', 'Curfew', 'Other Measures', 'Population Impacted', 'Status'
  ];

  public lockdownTable = [];
  public lockdownTableFull = [];

  public lockdownRegion = "World";
  public lockdownImpactedPeople: number;
  public curfewImpactedPeople: number;
  public averageDaysMissed: number;

  public lockdownTableUpdatedOn = 'April 11th, 2020';

  constructor() { }

  ngOnInit() {
    this.isMobile = window.innerWidth > 600 ? false : true;
    this.setLockdownStatistics();
    this.lockdownChangeRegion('World');
  }

  public lockdownChangeRegion(region: string) {
    this.lockdownRegion = region;
    const countries = this.getCountriesByRegion(region);
    this.lockdownImpactedPeople = Math.floor(this.getLockdownImpactedPopulation(countries));
    this.curfewImpactedPeople = this.getCurfewImpactedPopulation(countries);
    this.averageDaysMissed = this.getAverageDaysMissedPerRegion(countries);
  }

  private getLockdownImpactedPopulation(countries) {
    const population = countries.map(
      country => this.getImpactedPeople(country["alpha-3"], country.population_affected)
    );
    const reducer = (acc: number, currVal: number) => { return currVal + acc };
    return population.length === 0 ? 0 : population.reduce(reducer);
  }

  private getCurfewImpactedPopulation(region_countries) {
    const countries = region_countries.filter(country => {
      return country.curfew === "Yes" ? true : false;
    });
    const population = countries.map(
      country => this.getImpactedPeople(country["alpha-3"], 1)
    );
    const reducer = (acc: number, currVal: number) => { return currVal + acc };
    return population.length === 0 ? 0 : population.reduce(reducer);
  }

  private getAverageDaysMissedPerRegion(countries) {
    const missedDays = countries.map(country => this.getMissedDaysPerCountry(country));
    const reducer = (acc: number, currVal: number) => {return currVal + acc};
    return Math.floor(missedDays.reduce(reducer)/missedDays.filter(
      days => { return days > 0 ? true: false }
    ).length);
  }

  private getCountriesByRegion(region: string) {
    let countries;
    if (region === "World") {
      countries = lockdownData.default;
    } else {
      countries = lockdownData.default.filter(country => {
        return getRegionByAlpha(country["alpha-3"]) === region ? true : false;
      })
    }
    return countries;
  }

  private setLockdownStatistics() {
    let duration;
    for (const country of lockdownData.default) {
      duration = this.getMissedDaysPerCountry(country);
      if (country.public_closed)
      this.lockdownTableFull.push({
        "name": getCountryNameByAlpha(country['alpha-3']),
        "start": this.getDate(country['start']),
        "end": country['end'] !== '' ? this.getDate(country['end']) : this.getDate(country['expected_end']),
        "duration": duration === 0 ? '' : duration,
        "lockdown": country.lockdown,
        "curfew": country.curfew === 'N/A' ? 'No Data' : country.curfew,
        "other": this.getOtherMeasures(country),
        "population": this.getImpactedPeople(country['alpha-3'], country.population_affected),
        "status": country['status']
      });
    }
    this.lockdownTable = this.lockdownTableFull.slice(0, 10);
  }

  private getOtherMeasures(country) {
    const measures = [];
    if (country.public_closed) {
      measures.push('Public Places Closed');
    }
    if (country.movement_enforcement) {
      measures.push('Movement Enforcement');
    }
    if (country.army === true) {
      measures.push('Army Intervention');
    }
    if (country.business === "Yes") {
      measures.push('Business Shutdown');
    }
    return measures;
  }

  private getImpactedPeople(alpha3: string, affected_population_percent: number) {
    const reducer = (acc: number, currVal: number) => { return currVal + acc };
    for (const country of countriesData.default) {
      if (country.alpha3 === alpha3) {
        const population = ageRanges.map((ageRange) => country.population[ageRange]);
        return Math.floor(population.reduce(reducer)*affected_population_percent);
      }
    }
  }

  private getMissedDaysPerCountry(country: any) {
    if (country.start === '') {
      return 0
    }
    const start = new Date(country.start);
    const today = new Date()
    const planedEnd = country.end === 'N/A' ? today : new Date(country.end);
    const end = today < planedEnd ? today : planedEnd;
    return Math.floor((end.getTime()-start.getTime())/(1000*60*60*24));
  }

  private getDate(date: string) {
    return date === '' ? '' : (new Date(date)).toDateString();
  }

  applyFilter(event: Event) {
    const search = (event.target as any).value.toLowerCase();
    this.lockdownTable = this.lockdownTableFull.filter(
      row => row.name.toLowerCase().includes(search)
    ).slice(0, 10);
  }
}
