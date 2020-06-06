import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface RemindMeData {
  email: string;
  country: string;
  condition: string;
}

@Component({
  selector: 'app-remind-me',
  templateUrl: './remind-me.component.html',
  styleUrls: ['./remind-me.component.css']
})
export class RemindMeComponent {

  public conditions = [
    'Screening', 'Quarantine from high-risk regions', 'Ban on high-risk regions', 'Total border closure'
  ];

  constructor(
    public dialogRef: MatDialogRef<RemindMeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RemindMeData) {}

  public onNoClick() {
    this.dialogRef.close();
  }

}
