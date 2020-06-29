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
      this.countriesData[country].stringency['score'] = stringencies.reduce((a, b) => a+b);
      this.countriesData[country].stringency['last'] = stringencies[stringencies.length-1];

      dates = Object.keys(gdp.default[country]);
      this.countriesData[country].gdp['last'] = gdp.default[country][dates[dates.length-1]];
      this.countriesData[country].gdp['average'] = dates.map(date => gdp.default[country][date]).reduce((a, b) => a+b)/dates.length;

      dates = Object.keys(unemployement.default[country]);
      const dates2019 = dates.filter(date => date.startsWith('2019'));
      const average2019 = dates2019.map(date => unemployement.default[country][date]).reduce((a, b) => a+b)/dates2019.length;
      this.countriesData[country].unemployement['last'] = unemployement.default[country][dates[dates.length-1]]
      this.countriesData[country].unemployement['average'] = dates.map(date => unemployement.default[country][date] - average2019).reduce((a, b) => a+b)/dates.length;
    
      dates = Object.keys(import_impacts.default[country]);
      const importaDates2019 = dates.filter(date => date.startsWith('2019'));
      const importsAverage2019 = importaDates2019.map(date => import_impacts.default[country][date]).reduce((a, b) => a+b)/importaDates2019.length;
      this.countriesData[country].imports['last'] = import_impacts.default[country][dates[dates.length-1]];
      this.countriesData[country].imports['average'] = dates.map(date => import_impacts.default[country][date] - importsAverage2019).reduce((a, b) => a+b)/dates.length;
      
      dates = Object.keys(export_impacts.default[country]);
      const exportDates2019 = dates.filter(date => date.startsWith('2019'));
      const exportAverage2019 = importaDates2019.map(date => export_impacts.default[country][date]).reduce((a, b) => a+b)/exportDates2019.length;
      this.countriesData[country].exports['last'] = export_impacts.default[country][dates[dates.length-1]];
      this.countriesData[country].exports['average'] = dates.map(date => export_impacts.default[country][date] - exportAverage2019).reduce((a, b) => a+b)/dates.length;
    }
  }

  private getStringency (country: string, evolution: any) {
    const alpha3 = this.getAlpha3FromName(country, evolution);
    if (!alpha3) {
      return [0];
    }

    const months = [];
    for (let i = 1; i <= new Date().getMonth(); i++) {
      months.push(i < 10 ? `0${i}` : i.toString());
    }

    const res = [];
    for (const i in evolution.dates) {
      if (months.includes(evolution.dates[i].split('/')[1])) {
        const datasets = evolution.data[alpha3];
        res.push(datasets.school_closure[i] - datasets.international_travel[i] + datasets.public_information[i]);
      }
    }

    return res;
  }

  private getAlpha3FromName(name: string, evolution: any) {
    for (const country of Object.keys(evolution.data)) {
      if (evolution.data[country].name === name) {
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
