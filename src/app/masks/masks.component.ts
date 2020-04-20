import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { mobileWidth } from '../utils';

@Component({
  selector: 'app-masks',
  templateUrl: './masks.component.html',
  styleUrls: ['./masks.component.css']
})
export class MasksComponent implements OnInit {
  public isMobile: boolean;

  constructor(
    private titleService: Title
  ) { }

  ngOnInit(): void {
    this.isMobile = window.innerWidth > mobileWidth ? false : true;
    this.titleService.setTitle('Masks: Citizens Tracking Masks Issues Related to COVID-19');
  }

}
