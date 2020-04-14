import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Chart from 'chart.js';

import { createBarChart, createStackedBarChart, ageRanges, getRegionByAlpha, getAlpha3FromAlpha2, insertToArray } from '../utils';

import * as totalDeaths from '../data/deaths_causes';
import * as continents_data from '../data/continents_data';
import * as countriesData from '../data/countries';

interface Location {
  value: string;
  viewValue: string;
}

interface DateIntervale {
  value: string;
}

@Component({
  selector: 'app-death-rates',
  templateUrl: './death-rates.component.html',
  styleUrls: ['./death-rates.component.css']
})
export class DeathRatesComponent implements OnInit {
  public isMobile: boolean;

  public locations: Location[] = [
    {value: 'World', viewValue: 'World'},
    {value: 'Northern America', viewValue: 'North America'},
    {value: 'Europe', viewValue: 'Europe'},
    {value: 'Asia', viewValue: 'Asia'},
    {value: 'Africa', viewValue: 'Africa'},
    {value: 'Oceania', viewValue: 'Oceania'},
    {value: 'Latin America and the Caribbean', viewValue: 'Latin America and the Caribbean'},
  ]

  public dates: DateIntervale[] = [
    {value: 'Since 1st COVID-19 death (on 11 January 2020)'},
    {value: 'Last 24h'}
  ]

  private chart: Chart;
  private deathEstimationChart: Chart;
  private deathCausesChart: Chart;

  public today = Date();
  private daysSinceCovid: number;

  public deathStatsPeriod = 'Since 1st COVID-19 death (on 11 January 2020)';
  public estimationStatsPeriod = 'Since 1st COVID-19 death (on 11 January 2020)';
  public deathCausesPeriod = 'Since 1st COVID-19 death (on 11 January 2020)';
  public ageDeathContinent = "World";
  public deathEstimationLocation = "World";
  public deathCausesLocation = "World";

  private since1st = {"labels": [], "data": [], "backgroundColor": []};
  private yesterday = {"labels": [], "data": [], "backgroundColor": []};
 
  private deathsSince1st: number;
  private deathsYesterday: number;

  private covidByContinent = {
    "Europe": { "cases": 0, "deaths": 0 },
    "Asia": { "cases": 0, "deaths": 0 },
    "Africa": { "cases": 0, "deaths": 0 },
    "Northern America": { "cases": 0, "deaths": 0 },
    "Latin America and the Caribbean": { "cases": 0, "deaths": 0 },
    "Oceania": { "cases": 0, "deaths": 0 },
    "Antarctica": { "cases": 0, "deaths": 0 }
  }

  private deathsPerCountry = [];

  constructor(
    private http: HttpClient
  ) { }

  async ngOnInit() {
    this.isMobile = window.innerWidth > 991 ? false : true;
    await this.setCurrentDeathEvolution()
    this.since1st.backgroundColor = totalDeaths.default.data.map(() => { return '#1f8ef1'; })
    this.yesterday.backgroundColor = totalDeaths.default.data.map(() => { return '#1f8ef1'; })
    this.composeData();

    const totalDeathsCTX = (document.getElementById("DeathCausesChart") as any).getContext("2d");
    this.chart = createBarChart(totalDeathsCTX, this.since1st.labels, this.since1st.data, this.since1st.backgroundColor);

    // covid death estimation covidDeathEstimationChart
    const backgroundColor = ageRanges.map(() => '#1f8ef1')
    const backgroundColorCovid = ageRanges.map(() => 'red')
    const estimatedDeaths = this.estimateCovidDeaths('World', true);
    const deathsEstimationCTX = (document.getElementById("covidDeathEstimationChart") as any).getContext("2d");
    this.deathEstimationChart = createBarChart(
      deathsEstimationCTX, ageRanges, estimatedDeaths, backgroundColorCovid, this.covidEstimationTooltip
    );

    // covid-19 deaths vs other death causes
    const covidBackgroundColor = ageRanges.map(() => 'red')
    const deathsCausesCTX = (document.getElementById("deathCausesChart") as any).getContext("2d");
    this.deathCausesChart = createStackedBarChart(
      deathsCausesCTX, ageRanges, this.getAllCausesDeaths(), backgroundColor, "other causes",
      estimatedDeaths, covidBackgroundColor, "COVID-19"
    );
  }

  private covidEstimationTooltip(tooltipItem: any, values: any) {
    const sum = values.datasets[0].data.reduce((a, b) => a + b, 0);
    const percent = Math.floor((tooltipItem.xLabel*100)/sum);
    return Math.floor(tooltipItem.xLabel).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ` (${percent}%)`;
  }

  private getCountryDeathRates(alpha3: string, ageRange: string) {
    for (const country of countriesData.default) {
      if (country['alpha3'] === alpha3) {
        return [country['covid_death_rate'][ageRange], country['covid_death_rate_total']];
      }
    }
    return [0, 1];
  }

  /**
   * Returns the estimation of deaths
   * @param ageRange age range of population for which it estimates
   * @param countries list of countries
   * @param since1sr total deaths or only last 24 hours
   */
  private getDeaths(ageRange: string, countries: any[], since1sr: boolean) {
    let res = 0;
    const index = since1sr ? 1 : 2;
    for (const country of countries) {
      const alpha3 = getAlpha3FromAlpha2(country[0]);
      const rates = this.getCountryDeathRates(alpha3, ageRange);
      res += (country[index]*rates[0])/rates[1];
    }
    return Math.floor(res);
  }

  private estimateCovidDeaths(location: string, since11Jan: boolean) {
    const countries = location === 'World' ? this.deathsPerCountry : this.deathsPerCountry.filter(country => {
      return getRegionByAlpha(country[0]) === location ? true : false
    });
    return ageRanges.map(age => this.getDeaths(age, countries, since11Jan));
  }

  private updateEstimationChart() {
    const since1stDeath = this.estimationStatsPeriod === 'Last 24h' ? false : true;
    this.deathEstimationChart.data.datasets[0].data = this.estimateCovidDeaths(this.deathEstimationLocation, since1stDeath);
    this.deathEstimationChart.update();
  }

  public deathEstimationPeriodSwitch(datePeriod: string){
    this.estimationStatsPeriod = datePeriod;
    this.updateEstimationChart();
  }

  public deathEstimationSwitch(location: string) {
    this.deathEstimationLocation = location;
    this.updateEstimationChart();
  }

  private getAllCausesDeaths() {
    const continent = continents_data.default[this.deathCausesLocation];
    const today = new Date();
    const day1 = new Date("01/11/2020"); // the day of the first official death recorder from COVID-19
    const difference = Math.floor((today.getTime()-day1.getTime())/(1000*60*60*24));
    const multiplier = this.deathCausesPeriod === 'Last 24h' ? 1 : difference;
    return ageRanges.map(age => Math.floor((continent.deaths[age]/365))*multiplier);
  }

  private updateDeathCausesChart() {
    this.deathCausesChart.data.datasets[0].data = this.getAllCausesDeaths();
    const since1stDeath = this.deathCausesPeriod === 'Last 24h' ? false : true;
    this.deathCausesChart.data.datasets[1].data = this.estimateCovidDeaths(this.deathCausesLocation, since1stDeath);
    this.deathCausesChart.update();
  }

  public deathCausesLocationSwitch(location: string) {
    this.deathCausesLocation = location;
    this.updateDeathCausesChart();
  }

  public deathCausesPeriodSwitch(datePeriod: string){
    this.deathCausesPeriod = datePeriod;
    this.updateDeathCausesChart();
  }

  private async setCurrentDeathEvolution() {
    const data = await this.http.get('https://api.covid19api.com/summary').toPromise();
    this.deathsSince1st = data["Global"]["TotalDeaths"];
    this.deathsYesterday = data["Global"]["NewDeaths"];
    for (const row of data["Countries"]) {
      this.covidByContinent[getRegionByAlpha(row["CountryCode"])]["cases"] += row["TotalConfirmed"];
      this.covidByContinent[getRegionByAlpha(row["CountryCode"])]["deaths"] += row["TotalDeaths"];
      this.deathsPerCountry.push([row["CountryCode"], row["TotalDeaths"], row["NewDeaths"]]);
    }
  }

  private async composeData() {
    const today = new Date();
    const day1 = new Date("01/11/2020"); // the day of the first official death recorded from COVID-19
    this.daysSinceCovid = Math.floor((today.getTime()-day1.getTime())/(1000*60*60*24));

    this.since1st.data = totalDeaths.default.data.map(value => Math.floor((value/(365))*this.daysSinceCovid));
    this.since1st.labels = [...totalDeaths.default.labels];
    this.sortDeathTolls(this.since1st, this.deathsSince1st);

    this.yesterday.data = totalDeaths.default.data.map(value => Math.floor(value/365));
    this.yesterday.labels = [...totalDeaths.default.labels];
    this.sortDeathTolls(this.yesterday, this.deathsYesterday);
  }

  public changeDeathStatPeriod(datePeriod: string) {
    this.deathStatsPeriod = datePeriod;
    const dataset = datePeriod === 'Last 24h' ? this.yesterday : this.since1st;
    this.chart.data.labels = dataset.labels;
    this.chart.data.datasets[0].data = dataset.data;
    this.chart.data.datasets[0].backgroundColor = dataset.backgroundColor;
    this.chart.update();
  }

  private sortDeathTolls(tolls: any, coronaDeaths: number) {
    let insertIndex = 0;
    for (const i of tolls.data) {
      if (i > coronaDeaths) {
        insertIndex++;
      }
    }

    insertToArray(tolls.data, coronaDeaths, insertIndex);
    insertToArray(tolls.labels, 'COVID-19', insertIndex);
    insertToArray(tolls.backgroundColor, 'red', insertIndex);
  }

}
