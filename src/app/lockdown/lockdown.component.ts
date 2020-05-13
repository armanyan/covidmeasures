import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js';
import { Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

import { mobileWidth, getCountryPopulation, getRegionByAlpha, createPieChart, aws } from '../utils';
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

  public lockdownTableUpdatedOn: string;

  private lockdownData: any;

  private lockdownCountriesPieChart: Chart;
  private lockdownPopulationPieChart: Chart;

  public statsHeaders = [
    {title:'Name', sortable: true}, {title:'Population Impacted', sortable: true}, 
    {title:'Lockdown', sortable: false}, {title:'Curfew', sortable: false}, 
    {title:'Business Status', sortable: false}, {title:'Other Measures', sortable: false}, 
    {title:'Start', sortable: true}, {title:'End', sortable: true}, 
    {title:'Duration', sortable: true}, {title:'Status', sortable: false}
  ];

  public filterCountry: string;
  // 'Name', 'Population Impacted ', 'start', 'end', 'duration'
  public sortStatus = {
    name: {
      active:true,
      asc: true
    },
    population : {
      active:false,
      asc: false
    },
    start : {
      active:false,
      asc: false
    },
    end : {
      active:false,
      asc: false
    },
    duration : {
      active:false,
      asc: false
    }
  };

  constructor(
    private titleService: Title,
    private http: HttpClient
  ) { }

  async ngOnInit() {
    this.titleService.setTitle('Lockdown Statistics: Citizens Tracking Lockdown Measures');
    this.isMobile = window.innerWidth > mobileWidth ? false : true;
    this.lockdownData = await this.http.get(`${aws}/lockdown.json`).toPromise();
    this.lockdownTableUpdatedOn = this.lockdownData.updatedOn;
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
      if (country.curfew === true) {
        curfew++;
      } else if (country.end !== "") {
        removedRestrictions++;
      } else if (country.movement_restrictions === true) {
        lockdown++;
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
      if (country.curfew === true) {
        curfew += Math.floor(population*country.current_population_impacted);
        lightRestrictions += Math.floor(population*(1-country.current_population_impacted));
      } else if (country.end !== "") {
        removedRestrictions += Math.floor(population*country.current_population_impacted);
        lightRestrictions += Math.floor(population*(1-country.current_population_impacted));
      } else if (country.movement_restrictions === true) {
        lockdown += Math.floor(population*country.current_population_impacted);
        lightRestrictions += Math.floor(population*(1-country.current_population_impacted));
      } else if (country.start_business_closure !== "") { // TODO add null case
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
        "population": population > 0 ? population : '',
        "duration": duration === 0 ? "" : duration+" days",
        "lockdown": this.format_restriction(country.movement_restrictions),
        "curfew": this.format_restriction(country.curfew),
        "business": country.status_business === 'No data' ? '' : country.status_business,
        "other": this.getOtherMeasures(country),
        "start": this.getDate(country['start']),
        "end": this.getEndDate(country['end'], country['expected_end']),
        "status": country['status']
      });
    }
    this.lockdownTable = this.lockdownTableFull.slice(0, 10);
  }

  private format_restriction(restriction: boolean|string) {
    if (restriction === '' || restriction === 'No Data') {
      return ''
    }
    return restriction ? 'Yes' : 'No';
  }

  private async setLockdownImpactStatistics() {
    const data = (await this.http.get(`${aws}/impacts.json`).toPromise() as any);
    const impactData = data.filter(impact => impact.measure === 'Movement restrictions');
    for (const row of impactData) {
      this.impactTable.push({
        "impact": row.impact,
        "desc": row.description,
        "link": row.link,
        "countries": row.location,
        "source": row.source
      });
    }
  }

  private getEndDate(end: string, expectedEnd: string) {
    // end and expected_end could be equal only to '' or a date
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
    // TODO fix the issue of null and "null"
    if (country.start === '' || country.start === "null" || country.start === null) { // no data or no closure
      return 0
    }
    const start = new Date(country.start);
    const today = new Date()
    const planedEnd = country.end === '' ? today : new Date(country.end);
    const end = today < planedEnd ? today : planedEnd;
    return Math.floor((end.getTime()-start.getTime())/(1000*60*60*24));
  }

  private getDate(date: string) {
    if (date === '') {
      return '';
    }
    return date === null ? '' : (new Date(date)).toDateString();
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

  /***
   * Sort Table columns
   * @param string contains value in which column to sort the data by
   */
  public sortTable(sortBy:string) {
    
    const tableStats = this.filterCountry ? 
      this.lockdownTable.length ? this.lockdownTable : JSON.parse(JSON.stringify( this.lockdownTableFull))
      : JSON.parse(JSON.stringify( this.lockdownTableFull));

    for (const key in this.sortStatus) {
      if (this.sortStatus.hasOwnProperty(key)) {
        this.sortStatus[key].active = false;
      }
    } 
    // 'Name', 'Population Impacted ', 'start', 'end', 'duration'
    switch (sortBy) {
      case 'Name':
        this.sortStatus.name.asc ?
          this.lockdownTable = tableStats.sort((a, b) => b.name.localeCompare(a.name)).slice(0, 10) :
          this.lockdownTable = tableStats.sort((a, b) => a.name.localeCompare(b.name)).slice(0, 10)
        this.sortStatus.name.asc = !this.sortStatus.name.asc;
        this.sortStatus.name.active = true;
        break;

      case 'Population Impacted':
        if (this.sortStatus.population.asc ) {
          this.lockdownTable = tableStats.sort((a, b) => b.population - a.population).slice(0, 10);
        }else{
          this.lockdownTable = tableStats.sort((a, b) => {
            if(a.population === "" || a.population === null) return 1;
            if(b.population === "" || b.population === null) return -1;
            if(a.population === b.population) return 0;
            return a.population - b.population;
          }).slice(0, 10);
        }
        this.sortStatus.population.asc = !this.sortStatus.population.asc;
        this.sortStatus.population.active = true;
      break;

      case 'Start':
        if (this.sortStatus.start.asc) { // if Date is already in ascending
          // we sort it to descending
          this.lockdownTable = tableStats.sort((a, b) => {
            const dateA =  a.start ? new Date(a.start).getTime() : 0
            const dateB = b.start ? new Date(b.start).getTime() : 0
            return dateB - dateA;
          }).slice(0,10);
        } else{
          // if date is not ascending? we sort to ascending
          this.lockdownTable = tableStats.sort((a, b) => {
            const dateA =  a.start ? new Date(a.start).getTime() : 0
            const dateB = b.start ? new Date(b.start).getTime() : 0
            if(dateA === 0 || dateA === null) return 1;
            if(dateB === 0 || dateB === null) return -1;
            if(dateA === dateB) return 0;
            return dateA - dateB;
          }).slice(0, 10);
        }

        this.sortStatus.start.asc = !this.sortStatus.start.asc;
        this.sortStatus.start.active = true;
        break;
      
      case 'End':
        if (this.sortStatus.end.asc) { // if Date is already in ascending
          // we sort it to descending
          this.lockdownTable = tableStats.sort((a, b) => {
            const dateA =  a.end ? new Date(a.end).getTime() : 0
            const dateB = b.end ? new Date(b.end).getTime() : 0
            return dateB - dateA;
          }).slice(0,10);
        } else{
          // if date is not ascending? we sort to ascending
          this.lockdownTable = tableStats.sort((a, b) => {
            const dateA =  a.end ? new Date(a.end).getTime() : 0
            const dateB = b.end ? new Date(b.end).getTime() : 0
            if(dateA === 0 || dateA === null) return 1;
            if(dateB === 0 || dateB === null) return -1;
            if(dateA === dateB) return 0;
            return dateA - dateB;
          }).slice(0, 10);
        }
        this.sortStatus.end.asc = !this.sortStatus.end.asc;
        this.sortStatus.end.active = true;
        break;
      
      case 'Duration':
        if (this.sortStatus.duration.asc) {
          this.lockdownTable = tableStats.sort((a, b) => {
            const durationA = a.duration.split(' ')[0]
            const durationB = b.duration.split(' ')[0]
            return durationB - durationA;
          }).slice(0, 10); 
        }else{
          this.lockdownTable = tableStats.sort((a, b) => {
            const durationA = a.duration.split(' ')[0]
            const durationB = b.duration.split(' ')[0]
            if(durationA === "" || durationA === null) return 1;
            if(durationB === "" || durationB === null) return -1;
            if(durationA === durationB) return 0;
            return durationA - durationB;
          }).slice(0, 10);
        }
        this.sortStatus.duration.asc = !this.sortStatus.duration.asc;
        this.sortStatus.duration.active = true;
        break;

      default:
        break;
    }
  }
}
