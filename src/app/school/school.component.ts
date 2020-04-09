import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { getRegionByAlpha, getSchoolPopulationByAlpha3, getCountryNameByAlpha } from '../utils';
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

  public impactedChildrenPerDeath: number;
  public schooldaysMissedPerDeath: number;
  public kidsNoSchoolPerActiveCase: number;

  public lockdownTableFull = [];
  public lockdownTable = [];
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

  public statsHeaders = ["Country", "Start", "End", "School Closure Status"];

  constructor(
    private http: HttpClient
  ) { }

  async ngOnInit() {
    await this.setCurrentDeathEvolution();
    this.numberChildrenImpacted = this.getContinentChildrenPopulation(this.schoolClosureRegion);
    this.averageDaysMissed = this.getAverageDaysMissedPerRegion('World');
    this.covidVSSchoolChangeRegion('World');
    this.setLockdownTable();
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
    this.numberChildrenImpacted = this.getContinentChildrenPopulation(region);
    this.averageDaysMissed = this.getAverageDaysMissedPerRegion(region)
  }

  // TODO there is a problem with populations,
  // should review which country is in North/South America.
  // Solution don't have full continent populations, just country populations
  // current version uses data from population pyramid that uses UN data
  /**
   * Returns current population in a specific age range and location
   * @param region which population are we interested in
   * @param ranges which age ranges are we interested in
   */
  private getContinentChildrenPopulation(region: string) {
    const countries = this.getCountriesByRegion(region);
    const schoolPopulation = countries.map(
      country => getSchoolPopulationByAlpha3(country.alpha3)*country.children_no_school
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
    const impactedChildren = this.getContinentChildrenPopulation(region);
    this.impactedChildrenPerDeath = Math.floor(
      impactedChildren/this.covidByContinent[region]["deaths"]
    );
    this.schooldaysMissedPerDeath = Math.floor(
      (this.getAverageDaysMissedPerRegion(region)*impactedChildren)/this.covidByContinent[region].deaths
    );
    this.kidsNoSchoolPerActiveCase = impactedChildren/this.covidByContinent[region].activeCases
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

  private setLockdownTable() {
    for (const country of lockdownData.default.countries) {
      this.lockdownTableFull.push({
        "name": getCountryNameByAlpha(country['alpha3']),
        "start": this.getDate(country['start']),
        "end": this.getDate(country['end']),
        "status": this.getLockdownStatus(country['start'], country['end'])
      })
    }
    this.lockdownTable = [...this.lockdownTableFull]
  }

  private getDate(date: string) {
    return date === 'N/A' ? '' : (new Date(date)).toDateString();
  }

  private getLockdownStatus(start: string, end: string) {
    if (start === 'N/A') {
      return 'No Closure';
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
    this.lockdownTable = this.lockdownTableFull.filter(
      row => row.name.toLowerCase().includes(search)
    );
  }

}

