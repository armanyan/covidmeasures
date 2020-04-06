import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Chart from 'chart.js';

import * as covid from '../data/covid_evolution.json';

const addCommas = (number: number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

@Component({
  selector: 'app-covid',
  templateUrl: './covid.component.html',
  styleUrls: ['./covid.component.css']
})
export class CovidComponent implements OnInit {
  public tableData1: any;
  public statsHeaders = ['Country', 'Total Cases', 'New Cases', 'Total Deaths', 'New Deaths', 'Recovered'];
  public stats: any;
  public worldStats: any;
  public worldDataUpdatedOn: string;

  public casesLastUpdate: string;
  public deathsLastUpdate: string;
  public totalDeathCausesLastUpdate: string;

  private chartCases: Chart;
  private chartDeaths: Chart;

  // TODO handle others correctly later on
  private wrongNameCountries = [
    'US', ' Azerbaijan', 'Congo (Brazzaville)', 'Congo (Kinshasa)', '', 'Iran (Islamic Republic of)', 'Hong Kong SAR', 'Others',
    'Bahamas, The', 'Macao SAR', 'Russian Federation', 'Taiwan*', 'Holy See', 'Viet Nam', 'occupied Palestinian territory'
  ];

  constructor(
    private http: HttpClient
  ) { }

  async ngOnInit() {
    const casesCTX = (document.getElementById("chartCases") as any).getContext("2d");
    const labels = covid.dates;
    const cases = covid.cases;
    const deaths = covid.deaths;
    this.chartCases = this.createLineChart(casesCTX, labels, cases)
    this.casesLastUpdate = labels[labels.length-1];

    const deathsCTX = (document.getElementById("chartDeaths") as any).getContext("2d");
    this.chartDeaths = this.createLineChart(deathsCTX, labels, deaths)
    this.deathsLastUpdate = labels[labels.length-1];

    // world table
    try {
      await this.fetchWorldData();
      this.stats = JSON.parse(JSON.stringify(this.worldStats))
    } catch {
      // this.stats = lockdown_stats.values;
    }
    if (this.stats[this.stats.length-1].country === 'World') {
      return;
    }
    this.stats.push(this.getWorldRow());
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

  // world table part

  private getCountries(data: any) {
    const countries = [];
    for (const entry of data) {
      if (this.wrongNameCountries.indexOf(entry['Country']) < 0) {
        const row = {
          "country": entry['Country'], "total_cases": entry['TotalConfirmed'],
          "new_cases": entry['NewConfirmed'], "total_deaths": entry["TotalDeaths"],
          "new_deaths": entry["NewDeaths"], "recovered": entry["TotalRecovered"]
        }
        countries.push(row);
      } else if (this.wrongNameCountries.indexOf(entry['Country']) === 0) {
        const row = {
          "country": "USA", "total_cases": entry['TotalConfirmed'],
          "new_cases": entry['NewConfirmed'], "total_deaths": entry["TotalDeaths"],
          "new_deaths": entry["NewDeaths"], "recovered": entry["TotalRecovered"]
        }
        countries.push(row);
      } else if (this.wrongNameCountries.indexOf(entry['Country']) === 1) {
        const row = {
          "country": "Azerbaijan", "total_cases": entry['TotalConfirmed'],
          "new_cases": entry['NewConfirmed'], "total_deaths": entry["TotalDeaths"],
          "new_deaths": entry["NewDeaths"], "recovered": entry["TotalRecovered"]
        }
        countries.push(row);
      } else if (this.wrongNameCountries.indexOf(entry['Country']) === 2) {
        const row = {
          "country": "Republic of the Congo", "total_cases": entry['TotalConfirmed'],
          "new_cases": entry['NewConfirmed'], "total_deaths": entry["TotalDeaths"],
          "new_deaths": entry["NewDeaths"], "recovered": entry["TotalRecovered"]
        }
        countries.push(row);
      } else if (this.wrongNameCountries.indexOf(entry['Country']) === 3) {
        const row = {
          "country": "Democratic Republic of the Congo", "total_cases": entry['TotalConfirmed'],
          "new_cases": entry['NewConfirmed'], "total_deaths": entry["TotalDeaths"],
          "new_deaths": entry["NewDeaths"], "recovered": entry["TotalRecovered"]
        }
        countries.push(row);
      }
    }
    return countries
  }

  private async fetchWorldData() {
    let data = await this.http.get('https://api.covid19api.com/summary').toPromise();
    this.worldStats = this.getCountries(data['Countries']);
    const date = new Date(data['Date']);
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    this.worldDataUpdatedOn = monthNames[date.getMonth()]+" "+date.getDate()+"th, "+date.getFullYear();
  }

  applyFilter(event: Event) {
    const search = (event.target as any).value.toLowerCase();
    this.stats = this.worldStats.filter(
      row => row.country.toLowerCase().includes(search)
    );
    if (this.stats[this.stats.length-1].country !== "World") {
      this.stats.push(this.getWorldRow());
    }
  }

  private getWorldRow() {
    const row = {
      "country": "World", "total_cases": 0, "new_cases": 0, "total_deaths": 0, "new_deaths": 0, "recovered": 0
    };
    const reducer = (acc, currVal) => {return currVal + acc};
    row.total_cases = this.worldStats.map(row => row.total_cases).reduce(reducer);
    row.new_cases = (this.worldStats.map(row => row.new_cases).reduce(reducer) as any);
    row.total_deaths = this.worldStats.map(row => row.total_deaths).reduce(reducer);
    row.new_deaths = (this.worldStats.map(row => row.new_deaths).reduce(reducer) as any);
    row.recovered = this.worldStats.map(row => row.recovered).reduce(reducer);
    return row;
  }

}
