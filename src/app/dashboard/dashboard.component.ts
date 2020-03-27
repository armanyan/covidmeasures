import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js';

import * as casesData from '../data/cases_03_25.json';
import * as deathCases from '../data/deaths_03_25.json';
import * as totalDeaths from '../data/deaths_causes_03_26.json';

const addCommas = (number: number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const gradientBarChartConfiguration: any = {
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
        return addCommas(tooltipItem.yLabel);
      }
    }
  },
  responsive: true,
  scales: {
    yAxes: [{

      gridLines: {
        drawBorder: false,
        color: 'rgba(29,140,248,0.1)',
        zeroLineColor: "transparent",
      },
      ticks: {
        userCallback: function(value, index, values) {
          value = value.toString();
          value = value.split(/(?=(?:...)*$)/);
          value = value.join(',');
          return value;
        },
        suggestedMin: 60,
        suggestedMax: 120,
        padding: 20,
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
        padding: 20,
        fontColor: "#9e9e9e"
      }
    }]
  }
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  public chartCases: Chart;
  public chartDeaths: Chart;

  public casesLastUpdate: string;
  public deathsLastUpdate: string;
  public totalDeathCausesLastUpdate: string;

  constructor() { }

  ngOnInit() {
    const casesCTX = (document.getElementById("chartCases") as any).getContext("2d");
    this.chartCases = this.createLineChart(casesCTX, casesData.labels, casesData.data)
    this.casesLastUpdate = casesData.updatedOn;

    const deathsCTX = (document.getElementById("chartDeaths") as any).getContext("2d");
    this.chartDeaths = this.createLineChart(deathsCTX, deathCases.labels, deathCases.data)
    this.deathsLastUpdate = deathCases.updatedOn;

    const totalDeathsCTX = (document.getElementById("CountryChart") as any).getContext("2d");
    const gradientStroke = totalDeathsCTX.createLinearGradient(0, 230, 0, 50);
    this.createBarChart(totalDeathsCTX, gradientStroke, totalDeaths.labels, totalDeaths.data);
    this.totalDeathCausesLastUpdate = totalDeaths.updatedOn;
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

  private createBarChart(ctx: CanvasRenderingContext2D, gradientStroke: any, labels: string[], dataset: number[]) {
    return new Chart(ctx, {
      type: 'bar',
      responsive: true,
      legend: {
        display: false
      },
      data: {
        labels,
        datasets: [{
          fill: true,
          backgroundColor: gradientStroke,
          hoverBackgroundColor: gradientStroke,
          borderColor: '#1f8ef1',
          borderWidth: 2,
          borderDash: [],
          borderDashOffset: 0.0,
          data: dataset,
        }]
      },
      options: gradientBarChartConfiguration
    });
  }
}
