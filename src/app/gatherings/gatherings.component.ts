import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { mobileWidth } from 'app/utils';

@Component({
  selector: 'app-gatherings',
  templateUrl: './gatherings.component.html',
  styleUrls: ['./gatherings.component.css']
})
export class GatheringsComponent implements OnInit {
  public isMobile: boolean;

  constructor(
    private titleService: Title
  ) { }

  async ngOnInit() {
    this.titleService.setTitle('Mass Gatherings: Citizens Tracking Mass Gatherings Restrictions Worldwide');
    this.isMobile = window.innerWidth > mobileWidth ? false : true;
  }

}