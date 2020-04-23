import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PopUpService {

  constructor() { }

  public makeStatePopup(data: object| any): string {
   
    return  `<div>Capital: ${ data.name }</div>
    <div>State: ${ data.capital }</div>
    <div>Population: ${ data.abbr }</div>`
  }
}
