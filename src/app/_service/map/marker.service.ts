import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { icon } from 'leaflet';
import * as L from 'leaflet';
import { PopUpService } from './pop-up.service';

@Injectable({
  providedIn: 'root'
})
export class MarkerService {

  capitals: string = '';

  constructor(private http: HttpClient, private popupService: PopUpService) {}
  
  makeStateMarkers(map: L.map): void {
    this.http.get(this.capitals).subscribe((res: any) => {
      for (const c of res.states) {
        const lat = c.lat;
        const long = c.long;
        L.marker([ lat,long], {
          icon: icon({
            iconSize: [ 25, 41 ],
            iconAnchor: [ 13, 41 ],
            iconUrl: '../../assets/img/map/marker-icon.png',
            shadowUrl: '../../assets/img/map/marker-shadow.png'
          })
        }).addTo(map)
      }
    });
  }
  makeStateCircleMarkers(map: L.map): void {
    this.http.get(this.capitals).subscribe((res: any) => {
      for (const c of res.states) {
        const lat = c.lat;
        const long = c.long;
        const circle = L.circleMarker([ lat, long], {
          radius: 20,
        })
        circle.bindPopup(this.popupService.makeStatePopup(c));
        circle.addTo(map);
      }
    });
  }
}