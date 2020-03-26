import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js';

import * as casesData from '../data/cases_03_25.json';
import * as deathCases from '../data/deaths_03_25.json';

const addCommas = (number: number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  public ctx: CanvasRenderingContext2D;
  public chartCases: Chart;
  public chartDeaths: Chart;

  constructor() { }

  ngOnInit() {
    this.ctx = (document.getElementById("chartCases") as any).getContext("2d");
    this.chartCases = this.createOldChart(casesData.labels, casesData.data)

    const deathsCTX = (document.getElementById("chartDeaths") as any).getContext("2d");
    this.chartDeaths = this.createChart(deathsCTX, deathCases.labels, deathCases.data)
  }

  private createChart(ctx: CanvasRenderingContext2D, labels: string[], dataset: number[]) {
    const data = {
      labels,
      datasets: [{
          borderColor: "#3399FF",
          pointRadius: 1,
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

  private createOldChart(labels: string[], dataset: number[]) {
    const data = {
      labels,
      datasets: [{
          borderColor: "#3399FF",
          pointRadius: 1,
          pointHoverRadius: 8,
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
        enabled: true
      },

      scales: {
        yAxes: [{

          ticks: {
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
            display: false,
          },
          ticks: {
            padding: 20,
            fontColor: "#9f9f9f"
          }
        }]
      },
    }

    return new Chart(this.ctx, {
      type: 'line',
      data,
      options
    });
  }
}
