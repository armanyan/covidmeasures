import { Component, OnInit, Input, ChangeDetectorRef, SimpleChanges, Output, EventEmitter, ViewChildren, ViewChild, ElementRef } from '@angular/core';
import { Chart } from 'chart.js';
import moment from 'moment'
import { FormBuilder, FormGroup } from '@angular/forms';

import { monthNames, getCountryNameByAlpha, getCountryPopulation, createEvolutionChart } from '../../../utils';

interface Country {
  value: string;
  viewValue: string;
}
  
interface EvolutionChart {
  cases: number[]; 
  deaths: number[]; 
  labels: string[];
  lockdown: any[]; 
  school: any[];
  business: any[];
  travel: any[];
  comparedCases: number[];
  comparedDeaths: number[];
  comparedLockdown: any[]; 
  comparedSchool: any[];
  comparedBusiness: any[];
  comparedTravel: any[];
}

enum ModalAction {
  compare = "compare",
  switch = "switch",
}
@Component({
  selector: 'app-evolution-country',
  templateUrl: './evolution-country.component.html',
  styleUrls: ['./evolution-country.component.css']
})
export class EvolutionCountryComponent implements OnInit {
  @ViewChild('closeModalbutton',{static: false}) private closeModalbutton: ElementRef;
  @ViewChild('modalInputField',{static: false}) private modalInputField: ElementRef;
  private currentCountryName: string;
  public calendarForm: FormGroup;
  public countryAllCasesCTX: Chart;

  public evolutionRange: {from:string, to:string} = {from: 'default', to: 'default'};

  public evolutionUpdatedOn: string;
  public comparedCountry: {
    alpha3: string;
    name: string;
    population?: number;
  } = {alpha3: "", name: "", population: 0}; // holds compared country

  private countryPopulation:number = 0;
  public searchedCountry: Array<any>;
  public isPerMillion: boolean = false;

  public modalConfig: {title: string; action: string;} = {
    title:"Compare Country", 
    action: ModalAction.compare
  };

  @Input() countryView: string;
  @Input() countryList: Country[];
  @Input() evolution: any;
  @Output() switchCountry = new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    private changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.calendarForm = this.formBuilder.group({
      dateRange: null
    });
    
    const labels = this.evolution.dates.map(date => this.changeDateFormat(date));
    const data = this.getDataSets(
      this.evolution.data[this.countryView].cases, 
      this.evolution.data[this.countryView].deaths, 
      labels,
      this.evolution.data[this.countryView].lockdown, 
      this.evolution.data[this.countryView].school_closure,
      this.evolution.data[this.countryView].business_closure, 
      this.evolution.data[this.countryView].international_travel
    );

    // we get start & end date for calendar range
    const startDate = moment(new Date(data.labels[0])).format('MM/DD/YYYY')
    const endDate = moment(new Date(data.labels[data.labels.length - 1])).format('MM/DD/YYYY')
    // we update the value of calendar range
    this.calendarForm.controls['dateRange'].setValue(`${startDate} - ${endDate}`)

    this.initEvolutionChart(data); // we initialize evolution charts
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.calendarForm = this.formBuilder.group({
      dateRange: null
    });

    if (changes['countryView'].currentValue) {
      const value = changes['countryView'].currentValue;
      
      this.countryView = value;
      this.countryPopulation = getCountryPopulation(value);
      this.isPerMillion = false;
      this.comparedCountry = { alpha3: "", name: "", population: 0 };
      this.countryView = value;
      // we make evolutionRange to default
      this.evolutionRange = {from: 'default', to: 'default'}; 
      this.currentCountryName = getCountryNameByAlpha(value);
      this.evolutionUpdatedOn = this.changeDateFormat(this.evolution.dates[this.evolution.dates.length - 1]);
      this.searchedCountry = this.countryList.slice(0, 5);

      const datasets = this.getDataSets(
        this.evolution.data[value].cases,
        this.evolution.data[value].deaths,
        this.evolution.dates.map(date => this.changeDateFormat(date)),
        this.evolution.data[value].lockdown,
        this.evolution.data[value].school_closure,
        this.evolution.data[value].business_closure,
        this.evolution.data[value].international_travel
      );
      // we get start & end date for calendar range
      const startDate = moment(new Date(datasets.labels[0])).format('MM/DD/YYYY')
      const endDate = moment(new Date(datasets.labels[datasets.labels.length - 1])).format('MM/DD/YYYY')
      // we update the value of calendar range
      this.calendarForm.controls['dateRange'].setValue(`${startDate} - ${endDate}`)

      for (const country of this.countryList) {
        if (country.value === value && this.countryAllCasesCTX) {
          this.countryAllCasesCTX.destroy();
          this.initEvolutionChart(datasets);
          return;
        }
      }
    }
  }

  private getDataSets(
    activeCases: number[], 
    deaths: number[], 
    labels: string[], 
    lockdown: number[], 
    school_closure: number[], 
    business_closure: number[], 
    international_travel: number[],
    toCompareCountry: boolean = false
    ) {
    let shortenCases = [...activeCases];
    let shortenDeaths = [...deaths];
    let shortenLabels = [...labels];
    let shortenLockdown = [...lockdown];
    let shortenSchool = [...school_closure];
    let shortenBusiness = [...business_closure];
    let shortenTravel = [...international_travel];

    let comparedCases = toCompareCountry ?  this.evolution.data[this.comparedCountry.alpha3].cases : [];
    let comparedDeaths = toCompareCountry ? this.evolution.data[this.comparedCountry.alpha3].deaths : [];
    let comparedLockdown = toCompareCountry ? this.evolution.data[this.comparedCountry.alpha3].lockdown : [];
    let comparedSchool = toCompareCountry ? this.evolution.data[this.comparedCountry.alpha3].school_closure : [];
    let comparedBusiness = toCompareCountry ? this.evolution.data[this.comparedCountry.alpha3].business_closure : [];
    let comparedTravel = toCompareCountry ? this.evolution.data[this.comparedCountry.alpha3].international_travel : [];

    if (this.evolutionRange.from === 'default' && this.evolutionRange.to === 'default') {
      // get the index of the first death.
      // the graph will start at the first death
      const firstDeathIndex = shortenDeaths.findIndex(x => x)
      shortenCases = shortenCases.slice(firstDeathIndex, shortenCases.length);
      shortenDeaths = shortenDeaths.slice(firstDeathIndex, shortenDeaths.length);
      shortenLabels = shortenLabels.slice(firstDeathIndex, shortenLabels.length);
      shortenLockdown = shortenLockdown.slice(firstDeathIndex, shortenLockdown.length);
      shortenSchool = shortenSchool.slice(firstDeathIndex, shortenSchool.length);
      shortenBusiness = shortenBusiness.slice(firstDeathIndex, shortenBusiness.length);
      shortenTravel = shortenTravel.slice(firstDeathIndex, shortenTravel.length);
      if (toCompareCountry) {
        comparedCases = comparedCases.slice(firstDeathIndex, comparedCases.length);
        comparedDeaths = comparedDeaths.slice(firstDeathIndex, comparedDeaths.length);
        comparedLockdown = comparedLockdown.slice(firstDeathIndex, comparedLockdown.length);
        comparedSchool = comparedSchool.slice(firstDeathIndex, comparedSchool.length);
        comparedBusiness = comparedBusiness.slice(firstDeathIndex, comparedBusiness.length);
        comparedTravel = comparedTravel.slice(firstDeathIndex, comparedTravel.length);
      }
    } else {
      // if evolutionRange has date. we get the first and last index of labels
      const findStart = shortenLabels.findIndex(date => date == this.evolutionRange.from);
      const findEnd = shortenLabels.findIndex(date => date == this.evolutionRange.to);
      // we check if the index actually exists
      const startIndex = findStart > -1 ? findStart : 0;
      const endIndex = findEnd > -1 ? findEnd : shortenLabels.length;

      shortenCases = shortenCases.slice(startIndex, endIndex+1);
      shortenDeaths = shortenDeaths.slice(startIndex, endIndex+1);
      shortenLabels = shortenLabels.slice(startIndex, endIndex+1);
      shortenLockdown = shortenLockdown.slice(startIndex, endIndex+1);
      shortenSchool = shortenSchool.slice(startIndex, endIndex+1);
      shortenBusiness = shortenBusiness.slice(startIndex, endIndex+1);
      shortenTravel = shortenTravel.slice(startIndex, endIndex+1);
      if (toCompareCountry) {
        comparedCases = comparedCases.slice(startIndex, endIndex+1);
        comparedDeaths = comparedDeaths.slice(startIndex, endIndex+1);
        comparedLockdown = comparedLockdown.slice(startIndex, endIndex+1);
        comparedSchool = comparedSchool.slice(startIndex, endIndex+1);
        comparedBusiness = comparedBusiness.slice(startIndex, endIndex+1);
        comparedTravel = comparedTravel.slice(startIndex, endIndex+1);
      }

    }
    // this.currentDeathRatio = shortenDeaths.reduce((a,b) => a + b)/shortenCases.reduce((a,b) => a + b);
    return {
      'cases': shortenCases, 
      'deaths': shortenDeaths, 
      'labels': shortenLabels,
      'lockdown': shortenLockdown, 
      'school': shortenSchool,
      'business': shortenBusiness,
      'travel': shortenTravel,
      'comparedCases': comparedCases,
      'comparedDeaths': comparedDeaths,
      'comparedLockdown': comparedLockdown, 
      'comparedSchool': comparedSchool,
      'comparedBusiness': comparedBusiness,
      'comparedTravel': comparedTravel,
    }
  }

  public evolutionRangeChanged() { // if date range picker value is changed
    if (Array.isArray(this.calendarForm.controls.dateRange.value)) {
      const start = moment(this.calendarForm.controls.dateRange.value[0]).format('DD/MM/YYYY')
      const end = moment(this.calendarForm.controls.dateRange.value[1]).format('DD/MM/YYYY')
      
      this.evolutionRange.from = this.changeDateFormat(start)
      this.evolutionRange.to = this.changeDateFormat(end)

      const datasets = this.getDataSets(
        this.evolution.data[this.countryView].cases,
        this.evolution.data[this.countryView].deaths,
        this.evolution.dates.map(date => this.changeDateFormat(date)),
        this.evolution.data[this.countryView].lockdown,
        this.evolution.data[this.countryView].school_closure,
        this.evolution.data[this.countryView].business_closure,
        this.evolution.data[this.countryView].international_travel,
        this.comparedCountry.alpha3 ? true : false
      )

      this.countryAllCasesCTX.data.datasets[0].data  = datasets['cases'];
      this.countryAllCasesCTX.data.datasets[1].data = datasets['deaths'];
      this.countryAllCasesCTX.data.datasets[2].data = datasets['lockdown'];
      this.countryAllCasesCTX.data.datasets[3].data = datasets['school'];
      if (this.comparedCountry.alpha3) {
        this.countryAllCasesCTX.data.datasets[4].data = datasets['comparedCases'];
        this.countryAllCasesCTX.data.datasets[5].data = datasets['comparedDeaths'];
      }
      this.countryAllCasesCTX.data.labels = datasets['labels'];
      this.countryAllCasesCTX.update();
      if (this.isPerMillion) {
        this.isPerMillion=false;
        this.toPerMillion(true);
      }
    }
  }
   /**
   * we set countries cases and deaths value to per million or number of people
   * Ex: (cases / population) * 1,000,000)
   */
  public toPerMillion(value:boolean): void{
    this.isPerMillion = value;
    const IS_COMPARED = this.comparedCountry.alpha3 ? true : false;
    const allCases: EvolutionChart = {
      labels: this.countryAllCasesCTX.data.labels,

      cases: this.countryAllCasesCTX.data.datasets[0].data.map((x:number)=> {
        return this.isPerMillion ? (x / this.countryPopulation) * 1000000 : (x / 1000000) * this.countryPopulation
      }),

      deaths: this.countryAllCasesCTX.data.datasets[1].data.map((x:number)=> {
        return this.isPerMillion ? (x / this.countryPopulation) * 1000000 : (x / 1000000) * this.countryPopulation
      }),

      lockdown: this.countryAllCasesCTX.data.datasets[2].data,
      school: this.countryAllCasesCTX.data.datasets[3].data,
      business: this.countryAllCasesCTX.data.datasets[4].data,
      travel: this.countryAllCasesCTX.data.datasets[5].data,

      comparedCases: IS_COMPARED ? this.countryAllCasesCTX.data.datasets[6].data.map((x:number)=> {
          return this.isPerMillion ? (x / this.comparedCountry.population) * 1000000 : (x / 1000000) * this.comparedCountry.population
        }) : [],

      comparedDeaths: IS_COMPARED ? this.countryAllCasesCTX.data.datasets[7].data.map((x:number)=> {
          return this.isPerMillion ? (x / this.comparedCountry.population) * 1000000 : (x / 1000000) * this.comparedCountry.population
        }) : [],
      
      comparedLockdown: IS_COMPARED ? this.countryAllCasesCTX.data.datasets[8].data : [],
      comparedSchool: IS_COMPARED ? this.countryAllCasesCTX.data.datasets[9].data : [],
      comparedBusiness: IS_COMPARED ? this.countryAllCasesCTX.data.datasets[10].data : [],
      comparedTravel: IS_COMPARED ? this.countryAllCasesCTX.data.datasets[11].data : [],
    };
    this.countryAllCasesCTX.destroy();
    this.initEvolutionChart(allCases, this.isPerMillion ? "Number Per Million" : "Number of People");
  }
   /**
   * Initialize EvolutionCharts
   * Ex: cases, deaths
   * @param data to bind on the chart
   */
  private initEvolutionChart(data:EvolutionChart, yAxisLabel?: string){

    const IS_COMPARED = this.comparedCountry.alpha3 ? true : false;

    let dataSets: Array<{
      label: string;
      backgroundColor: string;
      borderColor: string;
      fill: boolean;
      data: number[];
      yAxisID: string;
      pointRadius?: number;
      pointHoverRadius?:number;
      borderDash?: number[];
      borderWidth?: number;
      hidden?:boolean;
    }> = [
      {
        label: IS_COMPARED ? `${this.currentCountryName} Cases` : "Cases", 
        backgroundColor: "rgba(52,107,186,0.3)", borderColor: "#346bb6",
        fill: !IS_COMPARED, 
        data: data.cases, yAxisID: 'people'
      },
      {
        label: IS_COMPARED ? `${this.currentCountryName} Deaths` : "Deaths", 
        backgroundColor: "rgba(206,43,51,0.3)", borderColor: "#ce2b33",
        fill: !IS_COMPARED, 
        data: data.deaths, yAxisID: 'people'
      },
      {
        label: IS_COMPARED ? `${this.currentCountryName} Lockdown`: "Lockdown", 
        backgroundColor: "rgba(174, 113, 240, 0.4)", borderColor: "rgba(174, 113, 240, 0)",
        fill: true, data: data.lockdown, yAxisID: 'severity', pointRadius: 0, pointHoverRadius: 0, 
        hidden : IS_COMPARED,
      },
      {
        label: IS_COMPARED ? `${this.currentCountryName} School Closure`: "School Closure", 
        backgroundColor: "rgba(166, 230, 154, 0.2)", borderColor: "rgba(166, 230, 154, 0)",
        fill: true, data: data.school, yAxisID: 'severity', pointRadius: 0, pointHoverRadius: 0, 
        hidden : IS_COMPARED,
      },
      {
        label: IS_COMPARED ? `${this.currentCountryName} Business Closure`: "Business Closure", 
        backgroundColor: "rgba(255, 214, 153, 0.53)", borderColor: "rgba(255, 214, 153, 0.53)",
        fill: true, data: data.business, yAxisID: 'severity', pointRadius: 0, pointHoverRadius: 0, 
        hidden : IS_COMPARED,
      },
      {
        label: IS_COMPARED ? `${this.currentCountryName} International Travel`: "International Travel", 
        backgroundColor: "rgba(245, 214, 235, 0.39)", borderColor: "rgba(245, 214, 235, 0.39)",
        fill: true, data: data.travel, yAxisID: 'severity', pointRadius: 0, pointHoverRadius: 0, 
        hidden : IS_COMPARED,
      }
    ];
    if (IS_COMPARED) {
      dataSets = [
        ...dataSets, 
        ...
        [
          {
            label: `${this.comparedCountry.name} Cases`, backgroundColor: "aliceblue", borderColor: "#7FFFD4",
            fill: false, data: data.comparedCases, yAxisID: 'people', borderDash: [10,5], borderWidth: 4
          },
          {
            label: `${this.comparedCountry.name} Deaths`, backgroundColor: "aliceblue", borderColor: "#FF1493",
            fill: false, data: data.comparedDeaths, yAxisID: 'people', borderDash: [10,5], borderWidth: 4
          },
          {
            label: `${this.comparedCountry.name} Lockdown`, 
            backgroundColor: "rgb(240,240,240)", borderColor: "#DCDCDC",
            fill: true, data: data.comparedLockdown, yAxisID: 'severity', borderDash: [10,5], pointRadius: 0, pointHoverRadius: 0, 
            hidden : IS_COMPARED,
          },
          {
            label: `${this.comparedCountry.name} School`, 
            backgroundColor: "#fbfbd09e", borderColor: "#ffffb29e",
            fill: true, data: data.comparedSchool, yAxisID: 'severity',  borderDash: [10,5], pointRadius: 0, pointHoverRadius: 0, 
            hidden : IS_COMPARED,
          },
          {
            label: `${this.comparedCountry.name} Business`, 
            backgroundColor: "rgba(255, 179, 255, 0.52)", borderColor: "#ffccff",
            fill: true, data: data.comparedBusiness, yAxisID: 'severity',  borderDash: [10,5], pointRadius: 0, pointHoverRadius: 0, 
            hidden : IS_COMPARED,
          },
          {
            label: `${this.comparedCountry.name} Travel`, 
            backgroundColor: "rgba(153, 255, 153, 0.53)", borderColor: "#99ff99",
            fill: true, data: data.comparedTravel, yAxisID: 'severity',  borderDash: [10,5], pointRadius: 0, pointHoverRadius: 0, 
            hidden : IS_COMPARED,
          }
        ]
      ];
    }
    // One country cases evolution chart
    this.countryAllCasesCTX = createEvolutionChart(
      (document.getElementById("countryChartCases") as any).getContext("2d"),
      data.labels,
      dataSets,
      true,
      true,
      false, // we make aspect ratio to false this prevents the chart from growing too much
      yAxisLabel
    );
    this.changeDetector.detectChanges();
  }
  /**
 * 
 * @param date to modified into particular format 
 */
  private changeDateFormat(date: string) {
    const data = date.split('/');
    return `${data[0]} ${monthNames[parseInt(data[1])-1]} ${data[2]}` 
  }
  /**
 * @param alpha3 to get the population of the country
 * @param name to get the name of the country
 */
  public setComparedCountry(alpha3: string, name: string){
    this.isPerMillion = false;
    this.comparedCountry = {
      alpha3: alpha3,
      name: name,
    };

    this.comparedCountry.population = getCountryPopulation(alpha3);

    const data = this.getDataSets(
      this.evolution.data[this.countryView].cases,
      this.evolution.data[this.countryView].deaths,
      this.evolution.dates.map(date => this.changeDateFormat(date)),
      this.evolution.data[this.countryView].lockdown,
      this.evolution.data[this.countryView].school_closure,
      this.evolution.data[this.countryView].business_closure,
      this.evolution.data[this.countryView].international_travel,
      true // we enable to Compare Country
    );
    this.countryAllCasesCTX.destroy();
    this.initEvolutionChart(data);
  }
  /**
   * 
   * @param event to Match country name
   * filter out country name similar to input
   */
  public filterCompared(event: Event){
    const search = (event.target as any).value.toLowerCase();
    this.searchedCountry = this.countryList.filter(row => {
      if(row.value.toLowerCase().includes(search)) return row;
      if(row.viewValue.toLowerCase().includes(search)) return row;
    }).slice(0,5);
  }
  /**
   * @param 'title' a string to display when modal is opened
   * @param 'action' holds info on what functionality to execute
   */ 
  public setModalConfig(title:string, action:string){
    this.modalConfig.title = title;
    this.modalConfig.action = action;
  }
    /**
   * @param alpha3 to get the population of the country
   * @param name to get the name of the country
   * @param 'action' to determin what functionality to execute
   */
  public countrySelected(action:string, alpha3:string, name:string= '') {
    // we submit click event to the close btn at the dom
    this.closeModalbutton.nativeElement.click()
    switch (action) {
      case ModalAction.compare:
        this.setComparedCountry(alpha3, name);
        break;
      case ModalAction.switch:
        this.switchCountry.emit(alpha3);
        break;
      default:
        break;
    }
    // after selecting we clear the input field
    this.modalInputField.nativeElement.value = '';
  }
}
