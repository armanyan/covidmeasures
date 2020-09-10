import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { mobileWidth } from '../utils';

@Component({
  selector: 'app-testing',
  templateUrl: './testing.component.html',
  styleUrls: ['./testing.component.css']
})
export class TestingComponent implements OnInit {
  public isMobile: boolean;
 
  constructor(
    private titleService: Title
  ) { }

  ngOnInit(): void {
    this.isMobile = window.innerWidth > mobileWidth ? false : true;
    this.titleService.setTitle('Tests and Vaccines: Citizens Tracking COVID-19 Testing');
  }

}
