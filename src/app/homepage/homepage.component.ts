import { Component, OnInit } from '@angular/core';

@Component({
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomeComponent implements OnInit {
  public isMobile: boolean;

  ngOnInit() {
    this.isMobile = window.innerWidth > 991 ? false : true;
  }

}
