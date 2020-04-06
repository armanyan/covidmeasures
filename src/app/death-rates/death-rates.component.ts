import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Chart from 'chart.js';

import { createPieChart, createVerticalBarChart, createBarChart, createStackedBarChart } from '../utils';

import * as totalCases from '../data/latest_cases.json';
import * as totalDeaths from '../data/deaths_causes.json';
import * as deathCases from '../data/latest_deaths.json';
import * as ageDeathRate from '../data/age_death_rage.json';
import * as deathProbabilityByAge from '../data/death_stats.json';
import * as ageStructure from '../data/age_structure.json';
import * as continents from '../data/country_by_continent';
import * as worldStats from '../data/world_table';
import * as covidEvolution from '../data/covid_evolution.json';
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
  private deathProbabilityChart: Chart;
  private deathEstimationChart: Chart;
  public totalDeathCausesLastUpdate: string;
  public ageDeathRateLastUpdate: string;

  public since1stToggle = true;
  public estimationSince1st = true;
  public deathProbLocation = "Northern America";
  public ageDeathContinent = "World";
  public deathEstimationLocation = "World"

  private since1st = {"labels": [], "data": [], "backgroundColor": []};
  private yesterday = {"labels": [], "data": [], "backgroundColor": []};
 
  private deathsSince1st: number;
  private deathsYesterday: number;

  private continentsRates;

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
    const ageRangeLabels = Object.keys(continents_data.default.World.population);
    const backgroundColor = ageRangeLabels.map(() => { return '#1f8ef1'; })
    const estimatedDeaths = this.estimateCovidDeaths();
    const deathsEstimationCTX = (document.getElementById("covidDeathEstimationChart") as any).getContext("2d");
    this.deathEstimationChart = createBarChart(deathsEstimationCTX, ageRangeLabels, estimatedDeaths, backgroundColor);

    this.totalDeathCausesLastUpdate = totalDeaths.updatedOn;
    this.ageDeathRateLastUpdate = ageDeathRate.updatedOn;

    // const rates = Object.keys(ageDeathRate.ageRate).map(age => ageDeathRate.ageRate[age])
    // const ageDeathRateCTX = (document.getElementById("AgeDeathRateChart") as any).getContext("2d");
    // createVerticalBarChart(ageDeathRateCTX, Object.keys(ageDeathRate.ageRate), rates, backgroundColor);

    // // death probability bar chart
    // const deathsProbabilityCTX = (document.getElementById("DeathProbabilityChart") as any).getContext("2d");
    // const deathProbabilityLabels = Object.keys(deathProbabilityByAge.World);

    // // the number of ill people per continent
    // this.continentsRates = this.getContinentsRates();
    // const worldToll = this.getDeathRates('Northern America', covidEvolution.cases[covidEvolution.cases.length-1])
    // this.deathProbabilityChart = createBarChart(deathsProbabilityCTX, deathProbabilityLabels, worldToll, worldToll.map(() => { return '#1f8ef1'; })) 
  }

  private estimateCovidDeaths() {
    const ageRanges = Object.keys(continents_data.default.World.population);
    const continent = continents_data.default[this.deathEstimationLocation];
    const currentDeaths = this.estimationSince1st ? this.deathsSince1st : this.deathsYesterday;
    return ageRanges.map(
      age => Math.floor(
        currentDeaths*(parseFloat(continent.covid_death_rate[age])/continent.covid_death_rate_total)
      )
    )
  }

  public deathEstimationPeriodSwitch(){
    this.estimationSince1st = !this.estimationSince1st;
    this.deathEstimationChart.data.datasets[0].data = this.estimateCovidDeaths();
    // this.chart.data.datasets[0].backgroundColor = dataset.backgroundColor;
    this.deathEstimationChart.update();
  }

  private getDeathRates(continent: string, count: number){
    let counts;
    let res = [];
    // the number of people that are ill in different age ranges
    counts = this.getPopulationRate(continent).map(population => population*count);
    let i = 0;
    for (const age of Object.keys(ageDeathRate.ageRate)){
      res.push(counts[i]*(ageDeathRate.ageRate[age]/100));
      i++;
    }
    // return the estimation of death people in different age ranges
    return res;
  }

  private getContinentsRates() {
    const continents_count = {...continents.default};
    for (const continent of Object.keys(continents_count)) {
      continents_count[continent] = 0;
    }
    for (const country in worldStats.default.Countries) {
      continents_count[
        this.getContinentByCountry(worldStats.default.Countries[country].Country)
      ] += worldStats.default.Countries[country].TotalConfirmed;
    }
    delete continents_count['undefined'];
    return continents_count;
  }

  private getContinentByCountry(country: string) {
    for (const continent of Object.keys(continents.default)) {
      if (continents.default[continent].indexOf(country) > -1) {
        return continent;
      }
    }
  }

  private async setCurrentDeathEvolution() {
    const data = await this.http.get('https://api.covid19api.com/summary').toPromise();
    this.deathsSince1st = data["Global"]["TotalDeaths"];
    this.deathsYesterday = data["Global"]["NewDeaths"];
  }

  private async composeData() {
    const today = new Date();
    const day1 = new Date("01/11/2020"); // the day of the first official death recorder from COVID-19
    const difference = Math.floor((today.getTime()-day1.getTime())/(1000*60*60*24));

    this.since1st.data = totalDeaths.data.map(value => Math.floor((value/(365))*difference));
    this.since1st.labels = [...totalDeaths.labels];
    this.sortDeathTolls(this.since1st, this.deathsSince1st);

    this.yesterday.data = totalDeaths.data.map(value => Math.floor(value/365));
    this.yesterday.labels = [...totalDeaths.labels];
    this.sortDeathTolls(this.yesterday, this.deathsYesterday);
  }

  public toggle() {
    this.since1stToggle = !this.since1stToggle;
    const dataset = this.since1stToggle ? this.since1st : this.yesterday;
    this.chart.data.labels = dataset.labels; // TODO is it ever going to change?
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

  private getData(location: string, list: any) {
    if (location === 'World') {
      return list === deathProbabilityByAge ? deathProbabilityByAge["World"] : ageStructure["World"].short;
    }
    else if (location === 'Northern America') {
      return list === deathProbabilityByAge ?
        deathProbabilityByAge["Northern America"] : ageStructure["Northern America"].short;
    }
    else if (location === 'Europe') {
      return list === deathProbabilityByAge ? deathProbabilityByAge["Europe"] : ageStructure["Europe"].short;
    }
    else if (location === 'Asia') {
      return list === deathProbabilityByAge ? deathProbabilityByAge["Asia"] : ageStructure["Asia"].short;
    }
    else if (location === 'Africa') {
      return list === deathProbabilityByAge ? deathProbabilityByAge["Africa"] : ageStructure["Africa"].short;
    }
    else if (location === 'Oceania') {
      return list === deathProbabilityByAge ? deathProbabilityByAge["Oceania"] : ageStructure["Oceania"].short;
    }
    else if (location === 'Latin America and the Caribbean') {
      return list === deathProbabilityByAge ?
        deathProbabilityByAge["Latin America and the Caribbean"] :
        ageStructure["Latin America and the Caribbean"].short;
    }
  }

  public deathProbStatsSwitch(location: string) {
    this.deathProbLocation = location;
    const toll = this.getDeathRates(location, this.continentsRates[location])
    this.deathProbabilityChart.data.datasets[0].data = toll;
    this.deathProbabilityChart.update();
  }

  public deathEstimationSwitch(location: string) {
    this.deathEstimationLocation = location;
    const toll = this.estimateCovidDeaths();
    this.deathEstimationChart.data.datasets[0].data = toll;
    this.deathEstimationChart.update();
  }

  private getCovidProbabilityByAge(ageRange: string) {
    const reducer = (acc, curr) => acc + curr;
    const ages = Object.keys(ageStructure.World.short);
    const population =  ages.map(age => ageStructure.World.short[age].both);
    const totalPopulationCount = population.reduce(reducer);
    const ageRangeCount = ageStructure.World.short[ageRange].both;

    // percentage of people current age range
    const ageRangePercentage = ageRangeCount/totalPopulationCount;
    // count of covid ill people in current age range
    // TODO totalCases is bad
    const illPeopleCount = ageRangePercentage*totalCases.data[totalCases.data.length-1];
    // estimation of lethal cases in current age range
    const estimationLethalCases = illPeopleCount*ageDeathRate.ageRate[ageRange];
    return (estimationLethalCases*100)/ageRangeCount;
  }

  private getPopulationRate(continent: string) {
    const reducer = (acc, curr) => acc + curr;
    const ages = Object.keys(this.getData(continent, ageStructure));
    const population =  ages.map(age => ageStructure.World.short[age].both);
    const totalPopulationCount = population.reduce(reducer);
    return population.map(count => count/totalPopulationCount);
  }

}
