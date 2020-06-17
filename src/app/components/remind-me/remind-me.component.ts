import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';

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

  public remindMeForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")
    ]),
    condition: new FormControl('', Validators.required)
  });

  constructor(
    public dialogRef: MatDialogRef<RemindMeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RemindMeData) {}

  public onNoClick() {
    this.dialogRef.close();
  }

  public get email(){
    return this.remindMeForm.get('email');
  }

}
