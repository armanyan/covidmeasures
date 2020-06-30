import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Title } from "@angular/platform-browser";
import * as typeformEmbed from '@typeform/embed';

import { aws, mobileWidth, getCountryNameByAlpha } from '../utils';
import * as gdp from '../data/gdp';
import * as unemployement from '../data/unemployement';
import * as import_impacts from '../data/imports';
import * as export_impacts from '../data/exports';

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
  public readMore = false;
  public impactHeaders = ['Location', 'Impact', 'Description', 'Measure', 'Source'];
  public impacts: Impact[] = [];
  public countriesData = {};
  public countries = [];

  p: number = 1;
  collection: any[];

  constructor(
    private titleService: Title,
    private http: HttpClient
  ) { }

  async ngOnInit() {
    this.titleService.setTitle('Impacts: COVID-19 Impacts Worldwide');
    this.isMobile = window.innerWidth > mobileWidth ? false : true;

    const url = `${aws}/community_impacts.json`;
    const rawData = (await this.http.get(url).toPromise() as any);
    this.impacts = this.formatImpactsData(rawData);
    this.collection = this.impacts;
    this.setWidget();

    const evolution = (await this.http.get(`${aws}/evolution.json`).toPromise() as any);
    this.processData(evolution);
  }

  private async processData(evolution: any) {
    this.countries = Object.keys(gdp.default);
    this.countries.sort();
    let dates;
    for (const country of this.countries) {
      this.countriesData[country] = {
        stringency: {},
        gdp: {},
        unemployement: {},
        imports: {},
        exports: {}
      };

      const stringencies = this.getStringency(country, evolution);
      if (stringencies.length > 1) {
        this.countriesData[country].stringency.score = stringencies.reduce((a, b) => a+b);
        this.countriesData[country].stringency.last = stringencies[stringencies.length-1];
      } else {
        this.countriesData[country].stringency.score = 'No data';
        this.countriesData[country].stringency.last = 'No data';
      }

      dates = Object.keys(gdp.default[country]);
      this.countriesData[country].gdp.last = gdp.default[country][dates[dates.length-1]];
      this.countriesData[country].gdp.average = dates.map(date => gdp.default[country][date]).reduce((a, b) => a+b)/dates.length;

      const datasets = { "unemployement": unemployement, "imports": import_impacts, "exports": export_impacts };
      for (const key of Object.keys(datasets)) {
        dates = Object.keys(datasets[key].default[country]);
        const dates2019 = dates.filter(date => date.startsWith('2019'));
        const average2019 = dates2019.map(date => datasets[key].default[country][date]).reduce((a, b) => a+b)/dates2019.length;
        this.countriesData[country][key].last = datasets[key].default[country][dates[dates.length-1]]
        this.countriesData[country][key].average = dates.map(date => datasets[key].default[country][date] - average2019).reduce((a, b) => a+b)/dates.length;
      }
    }
  }

  /**
   * Returns an array containing the stringency index for each day
   * since 1st January 2020 to the last day of the previous month.
   * @param country the name of the country of interest. 
   * @param evolution the evolution matrix for all countries.
   */
  private getStringency (country: string, evolution: any) {
    const alpha3 = this.getAlpha3FromName(country, evolution);
    if (!alpha3) {
      return [0];
    }

    // since we want the days between 1 Jan to last day of the previous month
    // we just need to look on the month of the date string.
    const months = [];
    for (let i = 1; i <= new Date().getMonth(); i++) {
      months.push(i < 10 ? `0${i}` : i.toString());
    }

    const stringencies = [];
    for (const i in evolution.dates) {
      // dates are in euro format - month is at position 1
      if (months.includes(evolution.dates[i].split('/')[1])) {
        const data = evolution.data[alpha3];
        stringencies.push(data.school_closure[i] - data.international_travel[i] + data.public_information[i]);
      }
    }
    return stringencies;
  }

  private getAlpha3FromName(name: string, evolution: any) {
    for (const country of Object.keys(evolution.data)) {
      if (evolution.data[country].name === name || evolution.data[country].name.replace(/_/g, ' ') === name) {
        return country;
      }
    }
    return undefined;
  }

  private formatImpactsData(impactData: any[]) {
    const impacts = [];
    for (const row of impactData) {
      if (row.alpha3 === undefined) {
        continue
      }
      impacts.push({
        location: row.alpha3[0] === 'WRD' ? 'World' : getCountryNameByAlpha(row.alpha3[0]),
        impact: row.impact,
        description: row.description,
        measure: row.measure,
        source: row.source
      });
    }
    return impacts;
  }

  /**
   * Search filter for the impacts table
   * @param event object that contains the search word entered by the user.
   */
  applyFilter(event: Event) {
    const search = (event.target as any).value.toLowerCase();
    this.collection = this.impacts.filter(row => {
      if(row.location.toLowerCase().includes(search)) return row;
      if(row.impact.toLowerCase().includes(search)) return row;
      if(row.description.toLowerCase().includes(search)) return row;
      if(row.measure.toLowerCase().includes(search)) return row;
    });
  }

  private setWidget() {
    document.getElementById('addImpact').addEventListener('click', function () {
      typeformEmbed.makePopup('https://admin114574.typeform.com/to/uTHShl', {
        hideFooter: true,
        hideHeaders: true,
        opacity: 0
      }).open();
    })
  }

}
