import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js';

import * as casesData from '../data/latest_cases.json';
import * as deathCases from '../data/latest_deaths.json';

const addCommas = (number: number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

@Component({
  selector: 'app-covid',
  templateUrl: './covid.component.html',
  styleUrls: ['./covid.component.css']
})
export class CovidComponent implements OnInit {
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

}
