import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { MarkerService } from '../../_service/marker.service';
import { ShapeService } from '../../_service/shape.service';
import { HttpClient } from '@angular/common/http';

interface Country {
  name: string;
  alpha3: string;
  code: string;
  region: string;
  start:string;
  start_reopening: string;
  school_closure: boolean;
  historical_coverage: string;
  current_children_no_school: number;
  historical_children_no_school: number;
  current_coverage: string;
  status: string
}

@Component({
  selector: 'app-map-school-closure',
  templateUrl: './map-school-closure.component.html',
  styleUrls: ['./map-school-closure.component.css']
})


export class MapSchoolClosureComponent implements OnInit {
  public map: L.map;
  public countries: Array<Country>;

  constructor(
    private markerService: MarkerService, 
    private shapeService: ShapeService,
    private http: HttpClient
    ) {
     
    }
    ngOnInit():void {
      this.http.get('https://covidmeasures-data.s3.amazonaws.com/school_closure.json').subscribe((res:{countries: Array<Country>}) => {
        this.countries = res.countries
        this.initMap();
        this.shapeService.getCountriesShapes().subscribe(country => {
          this.initStatesLayer(country);
        });

      // we populate the maps with markers
      // this.markerService.makeStateMarkers(this.map);
      // this.markerService.makeStateCircleMarkers(this.map);
      })
    }

    ngAfterViewInit(): void {}

    private initMap(): void{
      // we create the map
      this.map = L.map('map', {
        center: [ 40.416775, -3.703790 ],
        zoom: 3
      });
      // we add tiles for our map
      const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      });


      tiles.addTo(this.map);  

      const legend = L.control({position: 'bottomright'});
      const getColor = function(status) {
        return  status == "No data" ? '#e3e3e3' :
                status == "No closure" ? '#28a745' :
                status == "Nationwide Closure" ? '#e6595a' :
                status == "Partial Closure" ? '#ee7f08' : 
                status == "Re-opening" ? '#ffeb3b' : 
                status == "Re-open"  ? '#17a2b8' :
                          '#e3e3e3';
      }
      legend.onAdd = function (map) {

          const div = L.DomUtil.create('div', 'info legend'),
              status = ['No data', 'No closure', 'Nationwide Closure', 'Partial Closure', 'Re-opening', 'Re-open'],
              labels = [];

          // loop through our density intervals and generate a label with a colored square for each interval
          for (let i = 0; i < status.length; i++) {
              div.innerHTML +=
                  '<i style="background:' + getColor(status[i]) + '"></i>    <strong>' + status[i] + '</strong> <br>';
          }

          return div;
      };

      legend.addTo(this.map);
    }

    private initStatesLayer(item) {
      const stateLayer = L.geoJSON(item, {
        style: (feature) => ({
          weight: 3,
          opacity: 0.5,
          color: 'aliceblue',
          fillOpacity: 0.8,
          fillColor: this.getFillColor(feature)
        }),
        // onEachFeature: (feature, layer) => (
        //   layer.bindPopup("clicked").on({
        //     mouseover: (e) => (this.highlightFeature(e)),
        //     mouseout: (e) => (this.resetFeature(e))
        //   })
        // )
      });
      this.map.addLayer(stateLayer);
    }

    private getFillColor(item:{id:string}) {
      const foundCountry = this.countries.find(country => country.alpha3 === item.id)
      if (foundCountry) {
        if(foundCountry.status.toLowerCase() == "no data") return '#e3e3e3';
        if(
          foundCountry.status.toLowerCase() == "no closure") return '#28a745';
        if(
          foundCountry.status.toLowerCase() == "closure" && 
          foundCountry.current_coverage.toLowerCase() == "general"
          ) return '#e6595a';
        if(
          foundCountry.status.toLowerCase() == "closure" && 
          foundCountry.current_coverage.toLowerCase() == "partial"
          ) return '#ee7f08';
        if(
          foundCountry.status.toLowerCase() == "re-openning" || 
          foundCountry.status.toLowerCase() == "re-opening"
          ) return '#ffeb3b';
        if(foundCountry.status.toLowerCase() == "re-open") return '#17a2b8';
        else return '#e3e3e3'
      }
      return '#e3e3e3';
    }
}
