import { Component, OnInit } from '@angular/core';

import * as text from '../data/texts/aboutus';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.css']
})
export class AboutUsComponent implements OnInit {
  public isMobile: boolean;

  public aboutus_intro_1_p1 = text.default.aboutus_intro_1_p1;
  public aboutus_intro_1_p2 = text.default.aboutus_intro_1_p2;
  public disclaimer_1 = text.default.disclaimer_1;

  constructor() { }

  ngOnInit() {
    this.isMobile = window.innerWidth > 991 ? false : true;
  }

}
