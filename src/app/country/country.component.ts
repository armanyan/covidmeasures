import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import Chart from 'chart.js';
import { HttpClient } from '@angular/common/http';

import { mobileWidth, monthNames, createLineChart } from '../utils';

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

  public countryView = "US";

  public countryAllCasesCTX: Chart;
  public countryCasesChart: Chart;
  public countryDeathsChart: Chart;

  public countryList: Country[];

  private evolution: any;

  constructor(
    private titleService: Title,
    private http: HttpClient
  ) { }

  async ngOnInit() {
    this.titleService.setTitle('Country Overview: COVID-19 Statistics and Government Measures');
    this.isMobile = window.innerWidth > mobileWidth ? false : true;

    const url = 'https://covidmeasures-data.s3.amazonaws.com/evolution.json';
    this.evolution = (await this.http.get(url).toPromise() as any);

    const alphas = Object.keys(this.evolution.data);
    this.countryList = [];
    for (const alpha of alphas) {
      this.countryList.push({
        "value": alpha,
        "viewValue": this.evolution.data[alpha].name.split('_').join(' ')
      });
    }

    const labels = this.evolution.dates.map(date => this.changeDateFormat(date));
    // remove today's data since in the other parts we use data from different sources,
    // and incoherence would be obvious
    labels.pop()

    const dataSets = [
      {
        label: "Infection Cases",
        backgroundColor: "#3f51b552",
        borderColor: "#3399FF",
        fill: true,
        data: this.evolution.data.US.cases
      },
      {
        label: "Deaths",
        backgroundColor: "#f443365c",
        borderColor: "#f44336",
        fill: true,
        data: this.evolution.data.US.deaths
      }
    ]
     // One country cases evolution chart
     const countryAllCasesCTX = (document.getElementById("countryChartAllCases") as any).getContext("2d");
     this.countryAllCasesCTX = createLineChart(
        countryAllCasesCTX, 
        labels, 
        dataSets, 
        true,
        true,
        false // we make aspect ratio to false this prevents the chart from growing too much
       );

    // One country cases evolution chart
    const countryCasesCTX = (document.getElementById("countryChartCases") as any).getContext("2d");
    this.countryCasesChart = createLineChart(countryCasesCTX, labels, this.evolution.data.US.cases);

    // One country deaths evolution chart
    const countryDeathsCTX = (document.getElementById("countryChartDeaths") as any).getContext("2d");
    this.countryDeathsChart = createLineChart(countryDeathsCTX, labels, this.evolution.data.US.deaths);
  }

  public countryChangeView(value: string) {
    this.countryView = value;
    for (const country of this.countryList) {
      if (country.value === value) {

        this.countryAllCasesCTX.data.datasets[0].data  = this.evolution.data[value].cases;
        this.countryAllCasesCTX.data.datasets[1].data = this.evolution.data[value].deaths;
        this.countryAllCasesCTX.update();
        
        this.countryCasesChart.data.datasets[0].data = this.evolution.data[value].cases;
        this.countryCasesChart.update();

        this.countryDeathsChart.data.datasets[0].data = this.evolution.data[value].deaths;
        this.countryDeathsChart.update();
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

}
