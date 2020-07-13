import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Title } from "@angular/platform-browser";
import * as typeformEmbed from '@typeform/embed';
import { MatDialog } from '@angular/material/dialog';

import { EconomicDataComponent } from 'app/components/economic-data/economic-data.component';
import { aws, mobileWidth, getCountryNameByAlpha } from '../utils';
import * as gdp from '../data/gdp';
import * as unemployment from '../data/unemployment';
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
  public economicImpactHeaders = ['Country', 'Stringency Score', 'GDP', 'Unemployment Rate', 'Imports', 'Exports'];
  public impacts: Impact[] = [];
  public countriesData = [];
  public countries = [];
  public sortingOrder = true; // true for des
  public indicators = ['GDP', 'Unemployment Rate', 'Imports', 'Exports'];

  p: number = 1;
  collection: any[];

  constructor(
    private titleService: Title,
    private http: HttpClient,
    private dialog: MatDialog
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
    this.processEconomicData(evolution);
  }

  private async processEconomicData(evolution: any) {
    this.countries = Object.keys(gdp.default);
    this.countries.sort();
    let dates;
    let value;
    for (const country of this.countries) {
      const current = {
        'Country': { name: country, alpha3: '' },
        'Stringency Score': { last: '', avg: '' }, // use avg instead of score for convenience
        'GDP': { last: '', avg: '' },
        'Unemployment Rate': { last: '', avg: '' },
        'Imports': { last: '', avg: '' },
        'Exports': { last: '', avg: '' },
      };

      const stringencies = this.getStringency(country, evolution);
      if (stringencies.length > 1) {
        current['Country'].alpha3 = this.getAlpha3FromName(country, evolution);
        current['Stringency Score'].last = evolution.dates[evolution.dates.length-1];
        current['Stringency Score'].avg = stringencies.reduce((a, b) => a+b);
      } else {
        current['Stringency Score'].last = undefined;
        current['Stringency Score'].avg = undefined;
      }

      const datasets = { "GDP": gdp, "Unemployment Rate": unemployment, "Imports": import_impacts, "Exports": export_impacts };
      for (const key of Object.keys(datasets)) {
        value = 0;
        dates = Object.keys(datasets[key].default[country]).filter(date => date.startsWith('2020'));
        const dates2019 = Object.keys(datasets[key].default[country]).filter(date => date.startsWith('2019'));
        const average2019 = key === "GDP" ? 0 : dates2019.map(date => datasets[key].default[country][date]).reduce((a, b) => a+b)/dates2019.length;

        value = 0;
        for (const date of dates) {
          value += datasets[key].default[country][date] - average2019;
        }
        if (value !== 0) {
          value = ['Imports', 'Exports'].includes(key) ? ((value / dates.length) / average2019)*100 : value / dates.length;
          current[key].last = dates[dates.length-1];
          current[key].avg = value;
        } else {
          current[key].last = undefined;
          current[key].avg = undefined;
        }
      }
      this.countriesData.push(current);
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
    let c1: number, c2: number, c6: number, c7: number, c8: number;
    for (const i in evolution.dates) {
      // dates are in euro format - month is at position 1
      if (months.includes(evolution.dates[i].split('/')[1])) {
        const data = evolution.data[alpha3];
        c1 = data.school_closure[i] === 0 ? 0 : (100*(data.school_closure[i]-0.5*(1-data.school_closure_flag[i])))/3;
        c2 = data.business_closure[i] === 0 ? 0 : (100*(data.business_closure[i]-0.5*(1-data.business_closure_flag[i])))/3;
        c6 = data.lockdown[i] === 0 ? 0 : (100*(data.lockdown[i]-0.5*(1-data.lockdown_flag[i])))/3;
        c7 = data.domestic_travel[i] === 0 ? 0 : (100*(data.domestic_travel[i]-0.5*(1-data.domestic_travel_flag[i])))/2;
        c8 = data.international_travel[i] === 0 ? 0 : (100*data.international_travel[i])/4;
        stringencies.push(Math.round((c1+c2+c6+c7+c8)/5));
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

  public sortTable(header: string) {
    const subheader = header === 'Country' ? 'name' : 'avg';
    this.sortingOrder ?
      this.countriesData.sort((a, b) => (a[header][subheader] === undefined) ? 1 :(a[header][subheader] > b[header][subheader]) ? -1 : 1) :
      this.countriesData.sort((a, b) => (a[header][subheader] === undefined) ? 1 :(a[header][subheader] > b[header][subheader]) ? 1 : -1);
    this.sortingOrder = !this.sortingOrder;
  }

  public openEconomicData(indicator: string, country: string, value: number, updated: string) {
    const scores = {'countries': [], 'scores': []};
    if (indicator === 'Stringency Score') {
      for (const country of this.countriesData) {
        if (country['Country'].name === 'Euro Area') {
          continue;
        }
        scores['countries'].push(country['Country'].name);
        scores['scores'].push(country['Stringency Score'].avg);
      }
    }
    const d = updated.split('/');
    this.dialog.open(EconomicDataComponent, {
      width: '500px',
      data: { indicator, country, value, updated: new Date(`${d[2]}-${d[1]}-${d[0]}`), scores }
    });
  }

}
