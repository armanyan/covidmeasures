import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Chart from 'chart.js';

import { createBarChart, createStackedBarChart, ageRanges, getRegionByAlpha } from '../utils';

import * as totalDeaths from '../data/deaths_causes.json';
import * as continents_data from '../data/continents_data';

const insertToArray = (arr, element, index) => {
  arr.splice(index, 0, element);
}

@Component({
  selector: 'app-death-rates',
  templateUrl: './death-rates.component.html',
  styleUrls: ['./death-rates.component.css']
})
export class DeathRatesComponent implements OnInit {

  private chart: Chart;
  private deathEstimationChart: Chart;
  private deathCausesChart: Chart;

  public today = Date();
  private daysSinceCovid: number;

  public deathStatsSince1st = true;
  public estimationSince1st = true;
  public deathCausesSince1st = true;
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

  constructor(
    private http: HttpClient
  ) { }

  async ngOnInit() {
    await this.setCurrentDeathEvolution()
    this.since1st.backgroundColor = totalDeaths.data.map(() => { return '#1f8ef1'; })
    this.yesterday.backgroundColor = totalDeaths.data.map(() => { return '#1f8ef1'; })
    this.composeData();

    const totalDeathsCTX = (document.getElementById("DeathCausesChart") as any).getContext("2d");
    this.chart = createBarChart(totalDeathsCTX, this.since1st.labels, this.since1st.data, this.since1st.backgroundColor);

    // covid death estimation covidDeathEstimationChart
    const backgroundColor = ageRanges.map(() => '#1f8ef1')
    const estimatedDeaths = this.estimateCovidDeaths(true, 'World');
    const deathsEstimationCTX = (document.getElementById("covidDeathEstimationChart") as any).getContext("2d");
    this.deathEstimationChart = createBarChart(deathsEstimationCTX, ageRanges, estimatedDeaths, backgroundColor);

    // covid-19 deaths vs other death causes
    const covidBackgroundColor = ageRanges.map(() => 'red')
    const deathsCausesCTX = (document.getElementById("deathCausesChart") as any).getContext("2d");
    this.deathCausesChart = createStackedBarChart(
      deathsCausesCTX, ageRanges, this.getAllCausesDeaths(), backgroundColor, "other causes",
      estimatedDeaths, covidBackgroundColor, "covid"
    );
  }

  private getCurrentDeath(since1sr: boolean, location: string) {
    if (location === 'World') {
      return since1sr ? this.deathsSince1st : this.deathsYesterday;
    }
    return since1sr ?
      this.covidByContinent[location].deaths : Math.floor(this.covidByContinent[location].deaths/this.daysSinceCovid);
  }

  private estimateCovidDeaths(since1sr: boolean, location: string) {
    const continent = continents_data.default[location];
    const currentDeaths = this.getCurrentDeath(since1sr, location);
    return ageRanges.map(
      age => Math.floor(
        currentDeaths*(parseFloat(continent.covid_death_rate[age])/continent.covid_death_rate_total)
      )
    );
  }

  private updateEstimationChart() {
    this.deathEstimationChart.data.datasets[0].data = this.estimateCovidDeaths(
      this.estimationSince1st, this.deathEstimationLocation
    );
    this.deathEstimationChart.update();
  }

  public deathEstimationPeriodSwitch(){
    this.estimationSince1st = !this.estimationSince1st;
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
    const multiplier = this.deathCausesSince1st ? difference : 1;
    return ageRanges.map(age => Math.floor((continent.deaths[age]/365))*multiplier);
  }

  private updateDeathCausesChart() {
    this.deathCausesChart.data.datasets[0].data = this.getAllCausesDeaths();
    this.deathCausesChart.data.datasets[1].data = this.estimateCovidDeaths(
      this.deathCausesSince1st, this.deathCausesLocation
    );
    this.deathCausesChart.update();
  }

  public deathCausesLocationSwitch(location: string) {
    this.deathCausesLocation = location;
    this.updateDeathCausesChart();
  }

  public deathCausesPeriodSwitch(){
    this.deathCausesSince1st = !this.deathCausesSince1st;
    this.updateDeathCausesChart();
  }

  private async setCurrentDeathEvolution() {
    const data = await this.http.get('https://api.covid19api.com/summary').toPromise();
    this.deathsSince1st = data["Global"]["TotalDeaths"];
    this.deathsYesterday = data["Global"]["NewDeaths"];
    for (const row of data["Countries"]) {
      this.covidByContinent[getRegionByAlpha(row["CountryCode"])]["cases"] += row["TotalConfirmed"];
      this.covidByContinent[getRegionByAlpha(row["CountryCode"])]["deaths"] += row["TotalDeaths"];
    }
  }

  private async composeData() {
    const today = new Date();
    const day1 = new Date("01/11/2020"); // the day of the first official death recorded from COVID-19
    this.daysSinceCovid = Math.floor((today.getTime()-day1.getTime())/(1000*60*60*24));

    this.since1st.data = totalDeaths.data.map(value => Math.floor((value/(365))*this.daysSinceCovid));
    this.since1st.labels = [...totalDeaths.labels];
    this.sortDeathTolls(this.since1st, this.deathsSince1st);

    this.yesterday.data = totalDeaths.data.map(value => Math.floor(value/365));
    this.yesterday.labels = [...totalDeaths.labels];
    this.sortDeathTolls(this.yesterday, this.deathsYesterday);
  }

  public changeDeathStatPeriod() {
    this.deathStatsSince1st = !this.deathStatsSince1st;
    const dataset = this.deathStatsSince1st ? this.since1st : this.yesterday;
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
