import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { HttpClient } from '@angular/common/http';
import { mobileWidth, aws } from '../utils';

@Component({
  selector: 'app-masks',
  templateUrl: './masks.component.html',
  styleUrls: ['./masks.component.css']
})
export class MasksComponent implements OnInit {
  public isMobile: boolean;
  public countryMasksData: any;

  constructor(
    private titleService: Title,
    private http: HttpClient
  ) { }

  async ngOnInit() {
    this.isMobile = window.innerWidth > mobileWidth ? false : true;
    this.titleService.setTitle('Masks: Citizens Tracking Masks Issues Related to COVID-19');
    this.countryMasksData = await this.http.get(`${aws}/masks_survey.json`).toPromise();
  }

}
