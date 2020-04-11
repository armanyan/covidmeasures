import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { getRegionByAlpha, getSchoolPopulationByAlpha3, getCountryNameByAlpha, getChildrenNoSchoolByAlpha3 } from '../utils';
import * as lockdownData from '../data/lockdown';

@Component({
  selector: 'app-school',
  templateUrl: './school.component.html',
  styleUrls: ['./school.component.css']
})
export class SchoolComponent implements OnInit {
  public numberChildrenImpacted: number;
  public averageDaysMissed: number;

  public schoolClosureRegion = 'World';
  public covidVSSchoolRegion = 'World';

  public impactedChildren: number;
  public impactedChildrenPerDeath: number;
  public schooldaysMissedPerDeath: number;
  public kidsNoSchoolPerActiveCase: number;

  public schoolClosureFull = [];
  public schoolClosure = [];
  public schoolClosureTableUpdatedOn = "April 9th, 2020";

  private covidByContinent = {
    "Europe": { "activeCases": 0, "deaths": 0 },
    "Asia": { "activeCases": 0, "deaths": 0 },
    "Africa": { "activeCases": 0, "deaths": 0 },
    "Northern America": { "activeCases": 0, "deaths": 0 },
    "Latin America and the Caribbean": { "activeCases": 0, "deaths": 0 },
    "Oceania": { "activeCases": 0, "deaths": 0 },
    "Antarctica": { "activeCases": 0, "deaths": 0 },
    "World": { "activeCases": 0, "deaths": 0 }
  }

  public statsHeaders = ["Country", "Impacted Children", "Start", "Expected End", "Duration", "Closure Status"];

  constructor(
    private http: HttpClient
  ) { }

  async ngOnInit() {
    await this.setCurrentDeathEvolution();
    this.numberChildrenImpacted = Math.floor(this.getContinentChildrenPopulation(this.schoolClosureRegion));
    this.averageDaysMissed = this.getAverageDaysMissedPerRegion('World');
    this.covidVSSchoolChangeRegion('World');
    this.setSchoolClosure();
  }

  private getAverageDaysMissedPerRegion(region = 'World') {
    let countries = this.getCountriesByRegion(region);
    const missedDays = countries.map(country => this.getMissedDaysPerCountry(country));
    const reducer = (acc: number, currVal: number) => {return currVal + acc};
    return Math.floor(missedDays.reduce(reducer)/missedDays.filter(
      days => { return days > 0 ? true: false }
    ).length);
  }

  private getMissedDaysPerCountry(country: any) {
    if (country.start === 'N/A') {
      return 0
    }
    const start = new Date(country.start);
    const today = new Date()
    const planedEnd = country.end === 'N/A' ? today : new Date(country.end);
    const end = today < planedEnd ? today : planedEnd;
    return Math.floor((end.getTime()-start.getTime())/(1000*60*60*24));
  }

  public schoolClosureChangeLocation(region: string) {
    this.schoolClosureRegion = region;
    this.numberChildrenImpacted = Math.floor(this.getContinentChildrenPopulation(region));
    this.averageDaysMissed = this.getAverageDaysMissedPerRegion(region)
  }

  /**
   * Returns current population in a specific age range and location
   * @param region which population are we interested in
   * @param ranges which age ranges are we interested in
   */
  private getContinentChildrenPopulation(region: string) {
    const countries = this.getCountriesByRegion(region);
    const schoolPopulation = countries.map(
      country => getChildrenNoSchoolByAlpha3(country.alpha3)*country.children_no_school
    );
    const reducer = (acc: number, currVal: number) => { return currVal + acc };
    return schoolPopulation.reduce(reducer);
  }

  private getCountriesByRegion(region: string) {
    let countries;
    if (region === "World") {
      countries = lockdownData.default.countries;
    } else {
      countries = lockdownData.default.countries.filter(country => {
        return getRegionByAlpha(country.alpha3) === region ? true : false;
      })
    }
    return countries;
  }

  public covidVSSchoolChangeRegion(region: string) {
    this.covidVSSchoolRegion = region;
    this.impactedChildren = this.getContinentChildrenPopulation(region);
    this.impactedChildrenPerDeath = Math.floor(
      this.impactedChildren/this.covidByContinent[region]["deaths"]
    );
    this.schooldaysMissedPerDeath = Math.floor(
      (this.getAverageDaysMissedPerRegion(region)*this.impactedChildren)/this.covidByContinent[region].deaths
    );
    this.kidsNoSchoolPerActiveCase = Math.floor(this.impactedChildren/this.covidByContinent[region].activeCases);
  }

  private async setCurrentDeathEvolution() {
    const data = await this.http.get('https://api.covid19api.com/summary').toPromise();
    let region: string;
    for (const row of data["Countries"]) {
      region = getRegionByAlpha(row["CountryCode"]);
      this.covidByContinent[region]["activeCases"] += row["TotalConfirmed"]-row["TotalRecovered"]-row["TotalDeaths"];
      this.covidByContinent[region]["deaths"] += row["TotalDeaths"];

      this.covidByContinent['World']["activeCases"] += row["TotalConfirmed"]-row["TotalRecovered"]-row["TotalDeaths"];
      this.covidByContinent['World']["deaths"] += row["TotalDeaths"];
    }
  }

  private getCountryChildrenByAlpha(alpha3: string) {
    return getSchoolPopulationByAlpha3(alpha3)*getChildrenNoSchoolByAlpha3(alpha3);
  }

  private setSchoolClosure() {
    let children;
    let duration;
    for (const country of lockdownData.default.countries) {
      children = this.getCountryChildrenByAlpha(country['alpha3']) 
      duration = this.getMissedDaysPerCountry(country);
      this.schoolClosureFull.push({
        "name": getCountryNameByAlpha(country['alpha3']),
        "children": children === 0 ? '' : Math.floor(children),
        "start": this.getDate(country['start']),
        "end": country['end'] !== 'N/A' ? this.getDate(country['end']) : this.getDate(country['expected_end']),
        "duration": duration === 0 ? '' : duration,
        "status": country['status'] === 'No Closure' ? 'No Closure' : this.getClosureStatus(country['start'], country['end'])
      })
    }
    this.schoolClosure = this.schoolClosureFull.slice(0, 10);
  }

  private getDate(date: string) {
    return date === 'N/A' ? '' : (new Date(date)).toDateString();
  }

  private getClosureStatus(start: string, end: string) {
    if (start === 'N/A') {
      return 'No Data';
    }
    const startDate = new Date(start)
    const today = new Date()
    if (today < startDate) {
      return 'Not Yet Started';
    }

    if (end === 'N/A') {
      return 'Ongoing';
    }
    
    return new Date(end) > today ? 'Ongoing' : 'Finished';
  }

  applyFilter(event: Event) {
    const search = (event.target as any).value.toLowerCase();
    this.schoolClosure = this.schoolClosureFull.filter(
      row => row.name.toLowerCase().includes(search)
    ).slice(0, 10);
  }

}

