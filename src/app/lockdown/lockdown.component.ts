import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js';

import { ageRanges, getCountryNameByAlpha, getRegionByAlpha, createPieChart } from '../utils';
import * as lockdownData from '../data/lockdown';
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
    'Name', 'Population Impacted', 'Lockdown', 'Curfew', 'Business Closure', 'Other Measures', 'Start', 'End', 'Duration', 'Status'
  ];

  public lockdownTable = [];
  public lockdownTableFull = [];

  public lockdownRegion = "World";
  public lockdownPieChartCountriesRegion = "World";
  public lockdownPieChartPopulationRegion = "World";
  public lockdownImpactedPeople: number;
  public curfewImpactedPeople: number;
  public averageDaysMissed: number;

  public lockdownTableUpdatedOn = 'April 11th, 2020';

  private lockdownCountriesPieChart: Chart;
  private lockdownPopulationPieChart: Chart;

  constructor() { }

  ngOnInit() {
    this.isMobile = window.innerWidth > 991 ? false : true;
    this.setLockdownStatistics();
    this.lockdownChangeRegion('World');

    const labels = ['Lockdown', 'Curfew', 'Removed Restrictions', 'No Or Light Restrictions', 'No Data']
    const backgroundColor = ['#ffa600', '#ff6361', '#bc5090', '#58508d', '#003f5c'];
    const countries = this.getCountriesByRegion('World');

    const data1 = this.getCountriesData(countries);
    const countriesCTX = (document.getElementById("lockdownCountriesPieChart") as any).getContext("2d");
    this.lockdownCountriesPieChart = createPieChart(countriesCTX, labels, data1, backgroundColor);

    const data2 = this.getPopulationData(countries);
    const populationCTX = (document.getElementById("lockdownPopulationPieChart") as any).getContext("2d");
    this.lockdownPopulationPieChart = createPieChart(populationCTX, labels, data2, backgroundColor);
  }

  private getCountriesData(countries) {
    let lockdown = 0;
    let curfew = 0;
    let removedRestrictions = 0;
    let lightRestrictions = 0;
    let noData = 0;
    for (const country of countries) {
      if (country.end !== "N/A") {
        removedRestrictions++;
      } else if (country.restriction_type === "Lockdown") {
        lockdown++;
      } else if (country.restriction_type === "Curfew") {
        curfew++;
      } else if (country.restriction_type === "Businesses Shutdown") {
        lightRestrictions++;
      } else {
        noData++;
      }
    }
    return [lockdown, curfew, removedRestrictions, lightRestrictions, noData];
  }

  private getCountryPopulation(alpha3: string) {
    const reducer = (acc: number, currVal: number) => { return currVal + acc };
    for (const country of countriesData.default) {
      if (country.alpha3 === alpha3) {
        const population = ageRanges.map((ageRange) => country.population[ageRange]);
        return Math.floor(population.reduce(reducer));
      }
    }
  }

  private getPopulationData(countries) {
    let lockdown = 0;
    let curfew = 0;
    let removedRestrictions = 0;
    let lightRestrictions = 0;
    let noData = 0;
    for (const country of countries) {
      const population = this.getCountryPopulation(country["alpha-3"]);
      if (country.end !== "N/A") {
        removedRestrictions += Math.floor(population*country.population_affected);
        lightRestrictions += Math.floor(population*(1-country.population_affected));
      } else if (country.restriction_type === "Lockdown") {
        lockdown += Math.floor(population*country.population_affected);
        lightRestrictions += Math.floor(population*(1-country.population_affected));
      } else if (country.restriction_type === "Curfew") {
        curfew += Math.floor(population*country.population_affected);
        lightRestrictions += Math.floor(population*(1-country.population_affected));
      } else if (country.restriction_type === "Businesses Shutdown") {
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
    this.lockdownImpactedPeople = Math.floor(this.getLockdownImpactedPopulation(countries));
    this.curfewImpactedPeople = this.getCurfewImpactedPopulation(countries);
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
      this.lockdownTableFull.push({
        "name": getCountryNameByAlpha(country['alpha-3']),
        "population": this.getImpactedPeople(country['alpha-3'], country.population_affected),
        "duration": duration === 0 ? '' : duration,
        "lockdown": country.lockdown === 'N/A' ? '' : country.lockdown,
        "curfew": country.curfew === 'N/A' ? '' : country.curfew,
        "business": country.business === "N/A" ? '' : country.business,
        "other": this.getOtherMeasures(country),
        "start": this.getDate(country['start']),
        "end": this.getEndDate(country['end'], country['expected_end']),
        "status": country['status']
      });
    }
    this.lockdownTable = this.lockdownTableFull.slice(0, 10);
  }

  private getEndDate(end: string, expectedEnd: string) {
    if (end !== 'N/A') {
      return new Date(end).toDateString();
    }
    return expectedEnd === 'N/A' ? '' : new Date(expectedEnd).toDateString();
  }

  private getOtherMeasures(country) {
    const measures = [];
    if (country.public_closed === true) {
      measures.push('Public Places Closed');
    }
    if (country.movement_enforcement === "Yes") {
      measures.push('Movement Enforcement');
    }
    if (country.army === true) {
      measures.push('Army Intervention');
    }
    // if (country.business === "Yes") {
    //   measures.push('Business Shutdown');
    // }
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
