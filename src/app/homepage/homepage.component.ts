import { Component, OnInit } from '@angular/core';

import { mobileWidth } from '../utils';

@Component({
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomeComponent implements OnInit {
  public isMobile: boolean;

  ngOnInit() {
    this.isMobile = window.innerWidth > mobileWidth ? false : true;
  }

}
