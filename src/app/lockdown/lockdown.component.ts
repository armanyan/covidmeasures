import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js';
import { Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

import { getCountryNameByAlpha, getCountryPopulation, getRegionByAlpha, createPieChart } from '../utils';
import * as lockdownImpactData from '../data/lockdown_impacts';
import * as text from '../data/texts/lockdown';

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
  
  public lockdown_intro_1: string;
  public lockdown_tab_1_below: string;
  public lockdown_tab_2_below: string;

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
    'Name', 'Population Impacted', 'Lockdown', 'Curfew', 'Business Closure', 'Other Measures', 'Start', 'End', 'Duration', 'Status'
  ];
  public lockdownTable = [];
  public lockdownTableFull = [];

  public impactHeaders = ['Impact', 'Description', 'Link to Lockdown', 'Countries Impacted', 'Source'];
  public impactTable = [];

  public lockdownRegion = "World";
  public lockdownPieChartCountriesRegion = "World";
  public lockdownPieChartPopulationRegion = "World";
  public lockdownImpactedPeople: number;
  public curfewImpactedPeople: number;
  public averageDaysMissed: number;

  public lockdownTableUpdatedOn = 'April 11th, 2020';

  private lockdownData: any;

  private lockdownCountriesPieChart: Chart;
  private lockdownPopulationPieChart: Chart;

  constructor(
    private titleService: Title,
    private http: HttpClient
  ) { }

  async ngOnInit() {
    this.titleService.setTitle('Lockdown Statistics: Citizens Tracking Lockdown Measures');
    this.isMobile = window.innerWidth > 767 ? false : true;
    this.lockdownData = await this.http.get('https://covidmeasures-data.s3.amazonaws.com/lockdown.json').toPromise();
    this.setTexts();
    this.setLockdownStatistics();
    this.setLockdownImpactStatistics();
    this.lockdownChangeRegion('World');

    const labels = ['Lockdown', 'Curfew', 'Removed Restrictions', 'No Or Light Restrictions', 'No Data']
    const backgroundColor = ['#ffa600', '#ff6361', '#bc5090', '#58508d', '#003f5c'];
    const countries = this.getCountriesByRegion('World');

    const countriesDatasets = this.getCountriesData(countries);
    const countriesCTX = (document.getElementById("lockdownCountriesPieChart") as any).getContext("2d");
    this.lockdownCountriesPieChart = createPieChart(countriesCTX, labels, countriesDatasets, backgroundColor, 'Countries');

    const populationDatasets = this.getPopulationData(countries);
    const populationCTX = (document.getElementById("lockdownPopulationPieChart") as any).getContext("2d");
    this.lockdownPopulationPieChart = createPieChart(populationCTX, labels, populationDatasets, backgroundColor, 'People');
  }

  private setTexts() {
    this.lockdown_intro_1 = text.default.lockdown_intro_1;
    this.lockdown_tab_1_below = text.default.lockdown_tab_1_below;
    this.lockdown_tab_2_below = text.default.lockdown_tab_2_below;
  }

  /**
   * Returns the number of countries under lockdown, curfew etc.
   * @param countries an array of country data.
   */
  private getCountriesData(countries) {
    let lockdown = 0;
    let curfew = 0;
    let removedRestrictions = 0;
    let lightRestrictions = 0;
    let noData = 0;
    for (const country of countries) {
      if (country.end !== "") {
        removedRestrictions++;
      } else if (country.movement_restrictions === true) {
        lockdown++;
      } else if (country.curfew === true) {
        curfew++;
      } else if (country.status === "No Data") {
        noData++;
      } else {
        lightRestrictions++;
      }
    }
    return [lockdown, curfew, removedRestrictions, lightRestrictions, noData];
  }

  /**
   * Returns the number of people under restrictions for a set of countries
   * @param countries an array of country data
   */
  private getPopulationData(countries) {
    let lockdown = 0;
    let curfew = 0;
    let removedRestrictions = 0;
    let lightRestrictions = 0;
    let noData = 0;
    for (const country of countries) {
      const population = getCountryPopulation(country["alpha3"]);
      if (country.end !== "") {
        removedRestrictions += Math.floor(population*country.current_population_impacted);
        lightRestrictions += Math.floor(population*(1-country.current_population_impacted));
      } else if (country.movement_restrictions === true) {
        lockdown += Math.floor(population*country.current_population_impacted);
        lightRestrictions += Math.floor(population*(1-country.current_population_impacted));
      } else if (country.curfew === true) {
        curfew += Math.floor(population*country.current_population_impacted);
        lightRestrictions += Math.floor(population*(1-country.current_population_impacted));
      } else if (country.status === "Businesses Shutdown") { // TODO redefine "Business Shutdown"
        lightRestrictions += population;
      } else {
        noData += population;
      }
    }
    return [lockdown, curfew, removedRestrictions, lightRestrictions, noData];
  }

  public lockdownChangeRegion(region: string) {
    this.lockdownRegion = region;
    const countries = this.getCountriesByRegion(region);
    const restrictionData = this.getPopulationData(countries);
    // 0 - lockdown, 2 - restrictions removed
    this.lockdownImpactedPeople = Math.floor(restrictionData[0]+restrictionData[2]);
    // 1 - curfew
    
    this.curfewImpactedPeople = Math.floor(restrictionData[1]);
    this.averageDaysMissed = this.getAverageDaysMissedPerRegion(countries);
  }

  public lockdownChangePieChartCountriesRegion(region: string) {
    this.lockdownPieChartCountriesRegion = region;
    const countries = this.getCountriesByRegion(region);
    this.lockdownCountriesPieChart.data.datasets[0].data = this.getCountriesData(countries);
    this.lockdownCountriesPieChart.update();
  }

  public lockdownChangePieChartPopulationRegion(region: string) {
    this.lockdownPieChartPopulationRegion = region;
    const countries = this.getCountriesByRegion(region);
    this.lockdownPopulationPieChart.data.datasets[0].data = this.getPopulationData(countries);
    this.lockdownPopulationPieChart.update();
  }

  /**
   * Returns the average number of days under restrictions for a set of countries
   * @param countries an array of country data
   */
  private getAverageDaysMissedPerRegion(countries) {
    const missedDays = countries.map(country => this.getMissedDaysPerCountry(country));
    const reducer = (acc: number, currVal: number) => {return currVal + acc};
    return Math.floor(missedDays.reduce(reducer)/missedDays.filter(
      days => { return days > 0 ? true: false }
    ).length);
  }

  /**
   * Returns an array of country data for a region
   * @param region continent name or 'World'
   */
  private getCountriesByRegion(region: string) {
    let countries;
    if (region === "World") {
      countries = this.lockdownData.countries;
    } else {
      countries = this.lockdownData.countries.filter(country => {
        return getRegionByAlpha(country["alpha3"]) === region ? true : false;
      })
    }
    return countries;
  }

  /**
   * Set restriction statistics.
   */
  private setLockdownStatistics() {
    let duration;
    let population;
    for (const country of this.lockdownData.countries) {
      duration = this.getMissedDaysPerCountry(country);
      population = getCountryPopulation(country['alpha3'])*country.current_population_impacted;
      this.lockdownTableFull.push({
        "name": country.name,
        "population": population,
        "duration": duration === 0 ? 0 : duration,
        "lockdown": country.movement_restrictions ? 'Yes' : 'No',
        "curfew": country.curfew ? 'Yes' : 'No',
        "business": country.status_business === 'No Data' ? '' : country.status_business,
        "other": this.getOtherMeasures(country),
        "start": this.getDate(country['start']),
        "end": this.getEndDate(country['end'], country['expected_end']),
        "status": country['status']
      });
    }
    this.lockdownTable = this.lockdownTableFull.slice(0, 10);
  }

  private formatRestriction(lockdown: string | boolean) {
    if (lockdown === 'N/A') {
      return '';
    }
    return lockdown ? 'Yes' : 'No';
  }

  private setLockdownImpactStatistics() {
    for (const row of lockdownImpactData.default) {
      this.impactTable.push({
        "impact": row.impact,
        "desc": row.desc,
        "link": row.link,
        "countries": row.countries,
        "source_name": row.source_name,
        "source": row.source
      });
    }
  }

  private getEndDate(end: string, expectedEnd: string) {
    if (end !== '') {
      return new Date(end).toDateString();
    }
    return expectedEnd === '' ? '' : new Date(expectedEnd).toDateString();
  }

  /**
   * 
   * @param country Regroups secondary restrictions for the lockdown table.
   */
  private getOtherMeasures(country) {
    const measures = [];
    // should always check for true explicitly because it could be 'N/A'
    if (country.public_closed === true) {
      measures.push('Public Places Closed');
    }
    if (country.movement_enforcement === true) {
      measures.push('Movement Enforcement');
    }
    if (country.army === true) {
      measures.push('Army Intervention');
    }
    return measures;
  }

  /**
   * Returns the number of days under restrictions for a country
   * @param country a country data
   */
  private getMissedDaysPerCountry(country: any) {
    if (country.start === '' || country.start === "null") { // no data or no closure
      return 0
    }
    const start = new Date(country.start);
    const today = new Date()
    const planedEnd = country.end === '' ? today : new Date(country.end);
    const end = today < planedEnd ? today : planedEnd;
    return Math.floor((end.getTime()-start.getTime())/(1000*60*60*24));
  }

  private getDate(date: string) {
    return date === '' ? '' : (new Date(date)).toDateString();
  }

  /**
   * Search filter for the lockdown table
   * @param event object that contains the search word entered by the user.
   */
  applyFilter(event: Event) {
    const search = (event.target as any).value.toLowerCase();
    this.lockdownTable = this.lockdownTableFull.filter(
      row => row.name.toLowerCase().includes(search)
    ).slice(0, 10);
  }
}
