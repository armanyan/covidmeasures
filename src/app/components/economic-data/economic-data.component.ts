import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Chart from 'chart.js';

// import * as gdp from '../../data/gdp';
// import * as unemployment from '../../data/unemployment';
// import * as import_impacts from '../../data/imports';
// import * as export_impacts from '../../data/exports';

export interface EconomicData {
  indicator: string;
  country: string;
  value: number;
  updated: string;
  scores?: any;
  dataSets: any;
}

@Component({
  selector: 'app-economic-data',
  templateUrl: './economic-data.component.html',
  styleUrls: ['./economic-data.component.css']
})
export class EconomicDataComponent implements OnInit {
  public descriptions = {
    'Stringency Score': 'Computes the total of measures taken by country to fight the COVID-19 crisis.',
    'GDP': 'The variation of Gross Domestic Product.',
    'Unemployment Rate': 'The variation of unemployed population of a country.',
    'Imports': 'The amount of imported goods in the country, in billion dollars.',
    'Exports': 'The amount of exported goods to other countries, in billion dollars.'
  };

  // public datasets = {
  //   'GDP': gdp,
  //   'Unemployment Rate': unemployment,
  //   'Imports': import_impacts,
  //   'Exports': export_impacts
  // }

  public drawChart = true;

  constructor(
    public dialogRef: MatDialogRef<EconomicDataComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EconomicData,
  ) {}

  ngOnInit() {
    this.composeChart();
  }

  public onNoClick() {
    this.dialogRef.close();
  }

  private composeChart() {
    const { indicator, country } = this.data;

    let data: number[], labels: string[], dates2019: string[], dates2020: string[], backgroundColor: string[], text: string;
    if (indicator !== 'Stringency Score') {
      dates2019 = Object.keys(this.data.dataSets[indicator][country]).filter(date => date.startsWith('2019'));
      dates2020 = Object.keys(this.data.dataSets[indicator][country]).filter(date => date.startsWith('2020'));
      labels = dates2019.concat(dates2020);
      data = labels.map(date => this.data.dataSets[indicator][country][date]);
      backgroundColor = dates2019.map(x => "#3e95cd").concat(dates2020.map(x => "#8e5ea2"));
      text = 'Variation in 2019-2020';
    } else {
      labels = this.data.scores.countries
      data = this.data.scores.scores;
      text = 'Variation of Stringency Scores in the world';
      backgroundColor = [];
      for (const name of labels) {
        name !== country ? backgroundColor.push('#3e95cd') : backgroundColor.push('#8e5ea2');
      }
    }

    new Chart(document.getElementById("indicator-chart"), {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            backgroundColor,
            data
          }
        ]
      },
      options: {
        legend: { display: false },
        title: {
          display: true,
          text
        }
      }
  });
  }

}
