import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ShapeService {

  constructor(private http: HttpClient) { }

  getCountriesShapes(): Observable<any> {
    return this.http.get('../../assets/geojson/countries.json');
  }
}
