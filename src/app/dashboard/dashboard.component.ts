import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js';

import * as casesData from '../data/latest_cases.json';
import * as deathCases from '../data/latest_deaths.json';
import * as totalDeaths from '../data/deaths_causes.json';

const addCommas = (number: number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const insertToArray = (arr, element, index) => {
  arr.splice(index, 0, element);
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  public casesLastUpdate: string;
  public deathsLastUpdate: string;
  public totalDeathCausesLastUpdate: string;

  private chartCases: Chart;
  private chartDeaths: Chart;

  private backgroundColors: string[];

  constructor() { }

  ngOnInit() {
    const casesCTX = (document.getElementById("chartCases") as any).getContext("2d");
    this.chartCases = this.createLineChart(casesCTX, casesData.labels, casesData.data)
    this.casesLastUpdate = casesData.updatedOn;

    const deathsCTX = (document.getElementById("chartDeaths") as any).getContext("2d");
    this.chartDeaths = this.createLineChart(deathsCTX, deathCases.labels, deathCases.data)
    this.deathsLastUpdate = deathCases.updatedOn;

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
    // const totalCorona = Math.max(...deathCases.data);
    // const firstDeath = new Date("01/11/2020");
    // const daysOfCorona = Math.floor(((new Date()).getTime()-firstDeath.getTime())/(60*60*24*1000));
    // const deathPerDay = totalCorona/daysOfCorona;
    const deathPerDay = deathCases.data[deathCases.data.length-1] - deathCases.data[deathCases.data.length-2];
    return deathPerDay*356;
  }

  private createLineChart(ctx: CanvasRenderingContext2D, labels: string[], dataset: number[]) {
    const data = {
      labels,
      datasets: [{
          borderColor: "#3399FF",
          pointRadius: 3,
          pointHoverRadius: 6,
          borderWidth: 3,
          data: dataset
        },
      ]
    };

    const options = {
      legend: {
        display: false
      },

      tooltips: {
        callbacks: {
          label: function(tooltipItem: any) {
            return addCommas(tooltipItem.yLabel);
          }
        }
      },

      scales: {
        yAxes: [{

          ticks: {
            userCallback: function(value, index, values) {
              value = value.toString();
              value = value.split(/(?=(?:...)*$)/);
              value = value.join(',');
              return value;
            },
            fontColor: "#9f9f9f",
            beginAtZero: false,
            maxTicksLimit: 5,
            // padding: 20
          },
          gridLines: {
            drawBorder: false,
            zeroLineColor: "#ccc",
            color: 'rgba(0,0,0,0.05)'
          }

        }],

        xAxes: [{
          barPercentage: 1.6,
          gridLines: {
            drawBorder: false,
            color: 'rgba(255,255,255,0.1)',
            zeroLineColor: "transparent",
            display: true,
          },
          // label format
          ticks: {
            padding: 20,
            fontColor: "#9f9f9f"
          }
        }]
      },
    }

    return new Chart(ctx, { type: 'line', data, options});
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
          // fill: true,
          // fillColor: "rgba(220,220,220,0.1)",
          // strokeColor : "rgba(220,220,220,1)",
          // backgroundColor: gradientStroke,
          // hoverBackgroundColor: gradientStroke,
          // borderColor: '#1f8ef1',
          // borderWidth: 1,
          // borderDash: [],
          // borderDashOffset: 0.0,
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
              // drawBorder: false,
              color: 'rgba(29,140,248,0.1)',
              // zeroLineColor: "transparent",
            },
            ticks: {
              // suggestedMin: 0,
              // suggestedMax: 120,
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
