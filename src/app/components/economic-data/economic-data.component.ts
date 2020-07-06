import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface EconomicData {
  indicator: string;
  country: string;
  value: number;
  updated: string;
}

@Component({
  selector: 'app-economic-data',
  templateUrl: './economic-data.component.html',
  styleUrls: ['./economic-data.component.css']
})
export class EconomicDataComponent {
  public descriptions = {
    'Stringency Score': 'Computes the total of measures taken by country to fight the COVID-19 crisis.',
    'GDP': 'The variation of Gross Domestic Product.',
    'Unemployment Rate': 'The variation of unemployed population of a country.',
    'Imports': 'The amount of imported good in the country, in billion dollars.',
    'Exports': 'The amount of exported good to other countries, in billion dollars.'
  };

  constructor(
    public dialogRef: MatDialogRef<EconomicDataComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EconomicData
  ) {}

  public onNoClick() {
    this.dialogRef.close();
  }

}
