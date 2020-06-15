import { Component, OnInit, Input } from '@angular/core';
import * as L from 'leaflet';
import { MarkerService } from '../../../_service/map/marker.service';
import { ShapeService } from '../../../_service/map/shape.service';
import { MapTilesService } from '../../../_service/map/map-tiles.service';

const colors = {
  "No, NOT required or recommended": "#D8DD3E",
  "No, NOT required, but recommended": "#FFB566",
  "Variable responses": '#D95F0E',
  "Yes, in SOME public places": "#F44008",
  "Yes, in ALL public places": "#c80303",
  "NA": "#e3e3e3"
};

interface MasksData {
  "Q1 - Rule" : string;
  "Q2 - People Compliance": string;
  "Q3 - Efficient": string;
  "Q4 - Country or State": string;
  alpha3: string;
  "Submition Date": string
};

@Component({
  selector: 'app-map-masks',
  templateUrl: './map-masks.component.html',
  styleUrls: ['./map-masks.component.css']
})
export class MapMasksComponent implements OnInit {

  private map: L.map;
  private info: L.control;
  private legend: L.control;
  @Input() countryMasksData: Array<MasksData>;

  constructor(
    private markerService: MarkerService, 
    private shapeService: ShapeService,
    private mapTiles: MapTilesService
    ) {
     
    }

  ngOnInit(): void {
    this.initMap();
    this.addLegend();
    this.shapeService.getCountriesShapes().subscribe(country => {
      country.features.forEach(item => {
        const allSurveys = this.countryMasksData.filter(mask => mask.alpha3 == item.id);

        const q1Count = {}; // will hold the counts of survey answers
        allSurveys.forEach( question => {
          if(q1Count[question['Q1 - Rule']]){
            q1Count[question['Q1 - Rule']].number = q1Count[question['Q1 - Rule']].number + 1;
            q1Count[question['Q1 - Rule']].percent = 
              ((q1Count[question['Q1 - Rule']].number / allSurveys.length) * 100).toFixed(2);
          }else {
            q1Count[question['Q1 - Rule']] = {
              answer: question['Q1 - Rule'],
              number: 1,
              percent: ((1 / allSurveys.length) * 100).toFixed(2)
            };
          }
        });
        const survey  = Object.keys( q1Count ).map( key => q1Count[key]);
        item.survey = survey;
        item.totalSurvey = allSurveys.length;
        // console.log("survey values", survey);
      })
      this.initStatesLayer(country);
    });
    // console.log("masks data starts", this.countryMasksData);
  }

  private initMap(): void{
    // we create the map
    this.map = L.map('map', {
      center: [ 40.416775, -3.703790 ],
      zoom: 3
    });
    // we add tiles for our map
    this.mapTiles.addTiles(this.map)
  }

  private addLegend(){
    // we add legends to our map
    this.legend = L.control({position: 'bottomleft'});
    this.legend.onAdd = function () {

        const div = L.DomUtil.create('div', 'info legend');
        const status = [
          "No, NOT required or recommended",
          "No, NOT required, but recommended",
          "Variable responses",
          "Yes, in SOME public places",
          "Yes, in ALL public places",
          "NA"
        ];
        // loop through our density intervals and generate a label with a colored square for each interval
        div.innerHTML += 
        `<h6 style="padding-bottom:0px; font-weight:bold;">
          Survey: Are you required to wear a mask when you go outside?
        </h6>`;
        for (let i = 0; i < status.length; i++) {
            div.innerHTML +=
                `<div class="legend-align-center">
                  <i style="background:${colors[status[i]]}"></i>    
                  <span>${ status[i] }.</span>
                </div>`;
        }
        return div;
    };

    this.legend.addTo(this.map);
  }

  private initStatesLayer(item) {
    const stateLayer = L.geoJSON(item, {
      style: (feature) => ({
        weight: 3,
        opacity: 0.5,
        color: 'aliceblue',
        fillOpacity: 0.8,
        fillColor: this.getFillColor(feature.survey)
      }),
      onEachFeature: (feature, layer) => (
        layer.bindTooltip(this.tooltipContent(feature.survey, feature.properties.name), {
          sticky: true,
          direction: 'top'
        }).openTooltip().on({
          mouseover: (e) => (this.highlightFeature(e)),
          mouseout: (e) => (this.resetFeature(e))
        })
      )
    })
    this.map.addLayer(stateLayer);
  }

  private getFillColor(survey) {
    if (survey.length > 1) {
      const percents = survey.map(x => parseFloat(x.percent))
      const largest = Math.max.apply(Math, percents);
      if (largest > 50) {
        const answerName = survey.find(x => parseFloat(x.percent) == largest);
        return colors[answerName.answer]
      }else {
        return colors['Variable responses'];
      }
    }
    if (survey.length > 0) return colors[survey[0].answer];
  }

  private highlightFeature(e)  {
    const layer = e.target;
    layer.setStyle({
      weight: 4,
      opacity: 1,
      color: "orange",
      fillOpacity: .6,
    });
  }

  private resetFeature(e)  {
    const layer = e.target;
    layer.setStyle({
      weight: 3,
      opacity: 0.5,
      color: 'aliceblue',
      fillOpacity: 0.8,
      // fillColor: this.getFillColor(id)
    });
  }

  private tooltipContent(survey, countryName) {
    const $div = document.createElement('div'); 
    $div.innerHTML = `<h5 style="font-weight:bold" class="p-0 m-0">${ countryName }</h5>`;
    if (survey.length) {
      for (let i = 0; i < survey.length; i++) {
        const sur = survey[i];
        $div.innerHTML += `
          <div>
            <span>
              ${sur.answer} 
              <strong> ${sur.percent}%</strong>
            </span>
          </div>
        `;
      }
    }else{
      $div.innerHTML += `<strong>No Data</strong>`;
    }
    return $div;
  }
}
