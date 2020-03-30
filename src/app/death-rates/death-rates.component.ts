import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js';

import * as totalDeaths from '../data/deaths_causes.json';
import * as deathCases from '../data/latest_deaths.json';

const addCommas = (number: number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

  public totalDeathCausesLastUpdate: string;

  private backgroundColors: string[];

  constructor() { }

  ngOnInit() {
    this.backgroundColors = Array.apply(null, Array(totalDeaths.data.length)).map(() => { return '#1f8ef1'; })
    this.sortDeathTolls();

    const totalDeathsCTX = (document.getElementById("CountryChart") as any).getContext("2d");
    this.createBarChart(totalDeathsCTX, totalDeaths.labels, totalDeaths.data);
    this.totalDeathCausesLastUpdate = totalDeaths.updatedOn;
  }

  private sortDeathTolls() {
    const coronaDeaths = this.getCorona();
    let insertIndex = 0;
    for (const i of totalDeaths.data) {
      if (i > coronaDeaths) {
        insertIndex++;
      }
    }
    insertToArray(totalDeaths.data, coronaDeaths, insertIndex);
    insertToArray(totalDeaths.labels, 'COVID-19', insertIndex);
    insertToArray(this.backgroundColors, 'red', insertIndex);
  }

  private getCorona() {
    const deathPerDay = deathCases.data[deathCases.data.length-1] - deathCases.data[deathCases.data.length-2];
    return deathPerDay*356;
  }

  private createBarChart(ctx: CanvasRenderingContext2D, labels: string[], dataset: number[]) {
    return new Chart(ctx, {
      type: 'horizontalBar',
      responsive: true,
      legend: {
        display: false
      },
      data: {
        labels,
        datasets: [{
          backgroundColor: this.backgroundColors,
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
              return addCommas(tooltipItem.xLabel);
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
                value = value.toString();
                value = value.split(/(?=(?:...)*$)/);
                value = value.join(',');
                return value;
              },
              padding: 0,
              fontColor: "#9e9e9e"
            }
          }]
        }
      }
    });
  }
}
