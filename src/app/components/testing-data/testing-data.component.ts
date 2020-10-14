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
    'cases': 'Daily Cases Variation'
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

    let data: number[], labels: string[], backgroundColor: string[];
    labels = indicator === 'cases' ?
      dataSets.evolution.dates :
      dataSets.testing.data[alpha3].map(array => array[0]);
    
    const index = indicator === 'positive_rate' ? 7 : 1;
    data = indicator === 'cases' ?
      dataSets.evolution.data[alpha3].cases :
      dataSets.testing.data[alpha3].map(array => array[index]);

    backgroundColor = labels.map(x => '#6A5ACD	');
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
      }
  });
  }

}
