import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Chart from 'chart.js';

export interface TestingData {
  indicator: string;
  country: string;
  alpha3: string;
  dataSets: any;
}

@Component({
  selector: 'app-testing-data',
  templateUrl: './testing-data.component.html',
  styleUrls: ['./testing-data.component.css']
})
export class TestingDataComponent implements OnInit {
  public indicatorName = {
    'positive_rate': 'Positive Rates Variation',
    'daily_test': 'Daily Tests Variation',
    'cases': 'Daily Cases Variation',
    '7-day': '7-Day Death-Cases Ratio '
  };
  public drawChart = true;

  constructor(
    public dialogRef: MatDialogRef<TestingDataComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TestingData,
  ) {}

  ngOnInit() {
    this.composeChart();
  }

  public onNoClick() {
    this.dialogRef.close();
  }

  private composeChart() {
    const { indicator, country, alpha3, dataSets } = this.data;

    let data: number[], labels: string[], backgroundColor: string[], index: number, datasets: any[];

    switch(indicator) {
      case 'positive_rate':
        labels = dataSets.testing.data[alpha3].map(array => array[0]);
        datasets = [{
          backgroundColor: labels.map(x => '#6A5ACD	'),
          data: dataSets.testing.data[alpha3].map(array => array[7])
        }]
        break;
      
      case 'daily_test':
        labels = dataSets.testing.data[alpha3].map(array => array[0]);
        datasets = [{
          backgroundColor: labels.map(x => '#6A5ACD	'),
          data: dataSets.testing.data[alpha3].map(array => array[1])
        }]
        break;

      case 'cases':
        labels = dataSets.evolution.dates;
        datasets = [{
          backgroundColor: labels.map(x => '#6A5ACD	'),
          data: dataSets.evolution.data[alpha3].cases
        }]
        break;
      
      case '7-day':
        const length = dataSets.testing.data[alpha3].length
        labels = dataSets.testing.data[alpha3].map(array => array[0]).slice(length-7, length);
        datasets = [{
          label: 'Cases',
          backgroundColor: labels.map(x => '#6A5ACD	'),
          data: dataSets.evolution.data[alpha3].cases.slice(length-7, length)
        },
        {
          label: 'Death',
          backgroundColor: labels.map(x => '#FF0000	'),
          data: dataSets.evolution.data[alpha3].deaths.slice(length-7, length)
        }]
        break;
    }

    backgroundColor = labels.map(x => '#6A5ACD	');
    new Chart(document.getElementById("indicator-chart"), {
      type: 'bar',
      data: {
        labels,
        datasets
      },
      options: {
        legend: { display: false },
      }
  });
  }

}
