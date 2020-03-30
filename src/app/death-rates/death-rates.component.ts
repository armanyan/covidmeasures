import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js';

import * as totalDeaths from '../data/deaths_causes.json';
import * as deathCases from '../data/latest_deaths.json';
import * as ageDeathRate from '../data/age_death_rage.json';

const composeTooltip = (input: any) => {
  if (typeof input.xLabel === 'string') {
    return input.yLabel+"%, "+Math.floor((deathCases.data[deathCases.data.length-1]*parseInt(input.yLabel))/100);
  }
  return input.xLabel.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const insertToArray = (arr, element, index) => {
  arr.splice(index, 0, element);
}

@Component({
  selector: 'app-death-rates',
  templateUrl: './death-rates.component.html',
  styleUrls: ['./death-rates.component.css']
})
export class DeathRatesComponent implements OnInit {

  private chart: Chart;
  public totalDeathCausesLastUpdate: string;
  public ageDeathRateLastUpdate: string;

  public since1stToggle = true;

  private since1st = {"labels": [], "data": [], "backgroundColor": []};
  private yesterday = {"labels": [], "data": [], "backgroundColor": []};

  private currentDeaths: number;

  constructor() { }

  ngOnInit() {
    this.since1st.backgroundColor = totalDeaths.data.map(() => { return '#1f8ef1'; })
    this.yesterday.backgroundColor = totalDeaths.data.map(() => { return '#1f8ef1'; })
    this.composeData();

    const totalDeathsCTX = (document.getElementById("CountryChart") as any).getContext("2d");
    this.chart = this.createBarChart(totalDeathsCTX, this.since1st.labels, this.since1st.data, this.since1st.backgroundColor, 'horizontalBar', this.callbackAverage);

    this.totalDeathCausesLastUpdate = totalDeaths.updatedOn;
    this.ageDeathRateLastUpdate = ageDeathRate.updatedOn;

    const backgroundColor = ageDeathRate.ages.map(() => { return '#1f8ef1'; })
    const ageDeathRateCTX = (document.getElementById("AgeDeathRateChart") as any).getContext("2d");
    this.createBarChart(ageDeathRateCTX, ageDeathRate.ages, ageDeathRate.rate, backgroundColor, 'bar', this.callbackRate);
  }

  private composeData() {
    const since1st = deathCases.data[deathCases.data.length-1];
    const yesterday = since1st - deathCases.data[deathCases.data.length-2];

    const today = new Date();
    const day1 = new Date("01/11/2020");
    const difference = Math.floor((today.getTime()-day1.getTime())/(1000*60*60*24));

    this.since1st.data = totalDeaths.data.map(value => Math.floor(value/(365/difference)));
    this.since1st.labels = [...totalDeaths.labels];
    this.sortDeathTolls(this.since1st, since1st);

    this.yesterday.data = totalDeaths.data.map(value => Math.floor(value/365));
    this.yesterday.labels = [...totalDeaths.labels];
    this.sortDeathTolls(this.yesterday, yesterday);
  }

  public toggle() {
    this.since1stToggle = !this.since1stToggle;
    if (this.since1stToggle) {
      this.chart.data.labels = this.since1st.labels;
      this.chart.data.datasets[0].data = this.since1st.data;
      this.chart.data.datasets[0].backgroundColor = this.since1st.backgroundColor;
    } else {
      this.chart.data.labels = this.yesterday.labels;
      this.chart.data.datasets[0].data = this.yesterday.data;
      this.chart.data.datasets[0].backgroundColor = this.yesterday.backgroundColor;
    }
    this.chart.update();
  }

  private sortDeathTolls(tolls: any, coronaDeaths: number) {
    let insertIndex = 0;
    for (const i of tolls.data) {
      if (i > coronaDeaths) {
        insertIndex++;
      }
    }

    insertToArray(tolls.data, coronaDeaths, insertIndex);
    insertToArray(tolls.labels, 'COVID-19', insertIndex);
    insertToArray(tolls.backgroundColor, 'red', insertIndex);
  }

  private createBarChart(
    ctx: CanvasRenderingContext2D,
    labels: string[], dataset: number[],
    backgroundColor,
    type: string,
    customCallback: any
  ) {
    return new Chart(ctx, {
      type,
      responsive: true,
      legend: {
        display: false
      },
      data: {
        labels,
        datasets: [{
          backgroundColor,
          data: dataset,
        }]
      },
      options: {
        maintainAspectRatio: false,
        legend: {
          display: false
        },
      
        tooltips: {
          backgroundColor: '#f5f5f5',
          titleFontColor: '#333',
          bodyFontColor: '#666',
          mode: "nearest",
          intersect: 0,
          position: "nearest",
          callbacks: {
            label: function(tooltipItem: any) {
              return composeTooltip(tooltipItem);
            }
          }
        },
        responsive: true,
        scales: {
          yAxes: [{
      
            gridLines: {
              color: 'rgba(29,140,248,0.1)',
            },
            ticks: {
              padding: 0,
              fontColor: "#9e9e9e"
            }
          }],
      
          xAxes: [{
      
            gridLines: {
              drawBorder: false,
              color: 'rgba(29,140,248,0.1)',
              zeroLineColor: "transparent",
            },
            ticks: {
              userCallback: function(value) {
                return customCallback(value);
              },
              padding: 0,
              fontColor: "#9e9e9e"
            }
          }]
        }
      }
    });
  }

  private callbackAverage (value) {
    value = value.toString();
    value = value.split(/(?=(?:...)*$)/);
    value = value.join(',');
    return value;
  }

  private callbackRate(value) {
    return value;
  }
}
