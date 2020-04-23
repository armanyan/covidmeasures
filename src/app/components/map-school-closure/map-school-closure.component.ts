import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { MarkerService } from '../../_service/marker.service';
import { ShapeService } from '../../_service/shape.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-map-school-closure',
  templateUrl: './map-school-closure.component.html',
  styleUrls: ['./map-school-closure.component.css']
})
export class MapSchoolClosureComponent implements OnInit {
  public map;
  public countries;

  constructor(
    private markerService: MarkerService, 
    private shapeService: ShapeService,
    private http: HttpClient
    ) {
     
    }
    ngOnInit():void {
      this.countries = this.http.get('https://covidmeasures-data.s3.amazonaws.com/school_closure.json').subscribe((res:{countries: Array<object>}) => {
        this.countries = res.countries
        this.initMap();
        this.shapeService.getCuntriesShapes().subscribe(country => {
          this.initStatesLayer(country);
        });
        console.log(this.countries)

      // we populate the maps with markers
      // this.markerService.makeStateMarkers(this.map);
      // this.markerService.makeStateCircleMarkers(this.map);
      })
    }

    ngAfterViewInit(): void {}

    private initMap(): void{
      console.log("init map")
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
        return  status == "Closure" ? '#e6595a' : // if status == "Closure"
                status === "No Closure" ? '#6DB65B' : // if status == ""
                status == "No Data"  ? '#e3e3e3' : // if statys == "No Data"
                          '#e3e3e3';
      }
      legend.onAdd = function (map) {

          const div = L.DomUtil.create('div', 'info legend'),
              status = ["Closure",  "No Closure", "No Data",],
              labels = [];

          // loop through our density intervals and generate a label with a colored square for each interval
          for (let i = 0; i < status.length; i++) {
              div.innerHTML +=
                  '<i style="background:' + getColor(status[i]) + '"></i>  - <strong>' + status[i] + '</strong> <br>';
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
        if(foundCountry.status == "Closure") return '#e6595a';
        if(foundCountry.status == "No Data") return '#e3e3e3';
        else return '#6DB65B'
      }
      return '#e3e3e3';
    }
}
