import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js';

import { createPieChart, createVerticalBarChart, createBarChart, createStackedBarChart } from '../utils';

import * as totalCases from '../data/latest_cases.json';
import * as totalDeaths from '../data/deaths_causes.json';
import * as deathCases from '../data/latest_deaths.json';
import * as ageDeathRate from '../data/age_death_rage.json';
import * as deathProbabilityByAge from '../data/death_stats.json';
import * as ageStructure from '../data/age_structure.json';

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
  public totalDeathCausesLastUpdate: string;
  public ageDeathRateLastUpdate: string;

  public since1stToggle = true;
  public ageDeathLocation = "World";

  private since1st = {"labels": [], "data": [], "backgroundColor": []};
  private yesterday = {"labels": [], "data": [], "backgroundColor": []};

  private currentDeaths: number;

  constructor() { }

  ngOnInit() {
    this.since1st.backgroundColor = totalDeaths.data.map(() => { return '#1f8ef1'; })
    this.yesterday.backgroundColor = totalDeaths.data.map(() => { return '#1f8ef1'; })
    this.composeData();

    const totalDeathsCTX = (document.getElementById("CountryChart") as any).getContext("2d");
    this.chart = createBarChart(totalDeathsCTX, this.since1st.labels, this.since1st.data, this.since1st.backgroundColor);

    this.totalDeathCausesLastUpdate = totalDeaths.updatedOn;
    this.ageDeathRateLastUpdate = ageDeathRate.updatedOn;

    // const backgroundColor = ageDeathRate.ages.map(() => { return '#1f8ef1'; })
    // const ageDeathRateCTX = (document.getElementById("AgeDeathRateChart") as any).getContext("2d");
    // createVerticalBarChart(ageDeathRateCTX, ageDeathRate.ages, ageDeathRate.rate, backgroundColor);

    // const ageDeathPieCTX = (document.getElementById("AgeDeathPieChart") as any).getContext("2d");
    // const ageDeathData = ageDeathRate.rate.map(rate => Math.floor((deathCases.data[deathCases.data.length-1]*rate)/100));
    // const pieCharColors = ['#000000', '#F896B8', '#CEA5DB', '#8AB7E8', '#2FC5D7', '#02CAAB', '#63C872', '#A5BE3F', '#E1AB2D'];
    // createPieChart(ageDeathPieCTX, ageDeathRate.ages, ageDeathData, pieCharColors);

    // death probability bar chart
    const deathsProbabilityCTX = (document.getElementById("DeathProbabilityChart") as any).getContext("2d");
    const deathProbabilityLabels = Object.keys(deathProbabilityByAge.World);
    const deathProbabilityValues = deathProbabilityLabels.map(
      age => (100*deathProbabilityByAge.World[age])/ageStructure.World.short[age].both
    );
    const deathProbabilityCovid = deathProbabilityLabels.map(age => this.getCovidProbabilityByAge(age));
    console.log(deathProbabilityCovid);
    this.deathProbabilityChart = createStackedBarChart(
      deathsProbabilityCTX, deathProbabilityLabels,
      deathProbabilityValues, deathProbabilityValues.map(() => { return '#1f8ef1'; }), 'all other causes',
      deathProbabilityCovid, deathProbabilityValues.map(() => { return 'red'; }), 'covid-19'
    )
  }

  private composeData() {
    const since1st = deathCases.data[deathCases.data.length-1];
    const yesterday = since1st - deathCases.data[deathCases.data.length-2];

    const today = new Date();
    const day1 = new Date("01/11/2020");
    const difference = Math.floor((today.getTime()-day1.getTime())/(1000*60*60*24));

    this.since1st.data = totalDeaths.data.map(value => Math.floor(value/(365/difference)));
    this.since1st.labels = [...totalDeaths.labels];
    this.sortDeathTolls(this.since1st, since1st);

    this.yesterday.data = totalDeaths.data.map(value => Math.floor(value/365));
    this.yesterday.labels = [...totalDeaths.labels];
    this.sortDeathTolls(this.yesterday, yesterday);
  }

  public toggle() {
    this.since1stToggle = !this.since1stToggle;
    const dataset = this.since1stToggle ? this.since1st : this.yesterday;
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

  public ageDeathContinentSwitch(location: string) {
    this.ageDeathLocation = location;
    this.deathProbabilityChart.data.datasets[0].data = Object.keys(deathProbabilityByAge.World).map(
        age => (100*this.getData(location, deathProbabilityByAge)[age])/this.getData(location, ageStructure)[age].both
      );
    this.deathProbabilityChart.update();
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
    const illPeopleCount = ageRangePercentage*totalCases.data[totalCases.data.length-1];
    // estimation of lethal cases in current age range
    const estimationLethalCases = illPeopleCount*ageDeathRate.ageRate[ageRange];
    return estimationLethalCases/ageRangeCount;
  }

}
