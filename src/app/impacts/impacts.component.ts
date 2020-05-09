import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Title } from "@angular/platform-browser";

import { mobileWidth } from '../utils';

export interface Impact {
  impact: string,
  description: string,
  location: string,
  measure: string,
  source: string,
  link: string
}

@Component({
  selector: 'app-impacts',
  templateUrl: './impacts.component.html',
  styleUrls: ['./impacts.component.css']
})
export class ImpactsComponent implements OnInit {
  public isMobile: boolean;
  public impactHeaders = ['Impact', 'Description', 'Location', 'Measure', 'Source'];
  public impacts: Impact[] = [];

  constructor(
    private titleService: Title,
    private http: HttpClient
  ) { }

  async ngOnInit() {
    this.titleService.setTitle('Impacts: COVID-19 Impacts Worldwide');
    this.isMobile = window.innerWidth > mobileWidth ? false : true;

    const url = 'https://covidmeasures-data.s3.amazonaws.com/new_impacts.json';
    const data = (await this.http.get(url).toPromise() as any);
    for (const entry of data) {
      const impact = (entry as any);
      this.impacts.push({
        "impact": impact.impact,
        "description": impact.description,
        "location": impact.location,
        "measure": impact.measure,
        "source": impact.source,
        "link": impact.link
      });
    }
  }

}
