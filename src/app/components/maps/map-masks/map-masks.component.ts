import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { MarkerService } from '../../../_service/map/marker.service';
import { ShapeService } from '../../../_service/map/shape.service';
import { MapTilesService } from '../../../_service/map/map-tiles.service';
import countries from '../../../data/countries';

const colors = {
  "No, NOT required or recommended": "#66bb6a",
  "No, NOT required, but recommended": "#ffeb3b",
  "Yes, in SOME public places": "#e6595a",
  "Yes, in ALL public places": "#B55007",
  "NA": "#e3e3e3"
}

@Component({
  selector: 'app-map-masks',
  templateUrl: './map-masks.component.html',
  styleUrls: ['./map-masks.component.css']
})
export class MapMasksComponent implements OnInit {

  private map: L.map;
  private info: L.control;
  private legend: L.control;
  // @Input() countries: Array<Country>;

  constructor(
    private markerService: MarkerService, 
    private shapeService: ShapeService,
    private mapTiles: MapTilesService
    ) {
     
    }

  ngOnInit(): void {
    this.initMap();
    this.addInfoBox();
    this.addLegend();
    this.shapeService.getCountriesShapes().subscribe(country => {
      country.features.forEach(item => {
        const foundCountry = countries.find(country => country.alpha3 === item.id)
        if (foundCountry) {
          // we add data from apit to each country
          item.countryData = foundCountry
        }else{
          item.countryData = null
        }
      })
      this.initStatesLayer(country);
    });
    // we populate the maps with markers
    // this.markerService.makeStateMarkers(this.map);
    // this.markerService.makeStateCircleMarkers(this.map);

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

  private addInfoBox(){
    // we add info box
    this.info = L.control();

    this.info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        // this.update();
        return this._div;
    };

    const getTextColor = function(status: string, curfew: boolean) {
      if (status) {
        if(status == "Restricted" && !curfew) return colors['Restricted'];
        if(status == "Restricted" && curfew) return colors['Curfew'];
        return colors[status];
      }
    };
    // method that we will use to update the control based on feature properties passed
    // this.info.update = function (country) {
    //     this._div.innerHTML = 
    //     '<h4>Lockdown Status</h4>' +  (country ?
    //     `<b>${ country.name }</b><br />
    //     <span style="color:${ getTextColor(country.status, country.curfew) }; text-shadow: 1px 1px 1px #37180F;">
    //       ${ country.curfew ? 'Curfew' : country.status == 'No data' ? '' : country.status}
    //     </span>`
    //     : 'Hover over a Country');
    // };

    this.info.addTo(this.map);
  }

  private addLegend(){
    // we add legends to our map
    this.legend = L.control({position: 'bottomleft'});
    this.legend.onAdd = function () {

        const div = L.DomUtil.create('div', 'info legend');
        const status = [
          "No, NOT required or recommended",
          "No, NOT required, but recommended",
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
        fillColor: this.getFillColor(feature.countryData)
      }),
    });
    this.map.addLayer(stateLayer);
  }

  private getFillColor(country) {
    if (country) {
      let status = country.status;
      if (status === 'Restricted') {
        status = country.curfew ? 'Curfew': 'Restricted';
      }
      if (status === 'Restricted') {
        status = country.restriction_type == "Light measures" ? "Light measures" : "Restricted"
      }
      return colors[status] ? colors[status] : colors['No data'];
    }
    return 'red';
  }

  private highlightFeature(e)  {
    const layer = e.target;
    layer.setStyle({
      weight: 2,
      opacity: 1,
      fillOpacity: .6,
    });
    this.info.update(layer.feature.countryData)
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
    this.info.update()
  }

}
