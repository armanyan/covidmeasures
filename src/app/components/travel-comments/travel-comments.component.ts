import { Component, OnInit, Input, NgModule } from "@angular/core";
import alpha3 from "../../data/alpha3";
import { ActivatedRoute, Router } from "@angular/router";
import {Location} from '@angular/common'; 

interface Country {
  value: string;
  viewValue: string;
  "sub-region": string;
}

@Component({
  selector: "app-travel-comments",
  templateUrl: "./travel-comments.component.html",
  styleUrls: ["./travel-comments.component.css"],
})
export class TravelCommentsComponent implements OnInit {
  public countryView: string = "USA";
  public countriesList: Country[] = [];
  public travel = {
    start: "",
    end: "",
    status: "No Data",
  };
  @Input() countriesTravel: any;

  public pageID:string = "";
  public url: string = "";

  constructor(
    private activatedRoute: ActivatedRoute, 
    private router:Router,
    private location: Location
    ) {}

  async ngOnInit() {

    const routeParam = this.activatedRoute.snapshot.paramMap.get('alpha3');
    if (routeParam) {
      this.getCountryView(routeParam);
    }else{
      this.getCountryView(this.countryView);
    }

    for (const key in alpha3) {
      if (alpha3.hasOwnProperty(key)) {
        const element = alpha3[key];
        this.countriesList.push({
          value: element["alpha-3"],
          viewValue: element.name,
          "sub-region": element["sub-region"],
        });
      }``
    }
  }
  ngAfterViewInit(){

  }

  public getCountryView(alpha3: string) {
    this.router.navigateByUrl(`borders/${alpha3}`).then(() => {
      const travelCountry = this.getCountry(this.countriesTravel, alpha3);

      this.travel.start = travelCountry.start;
      this.travel.end = travelCountry.end;
      this.travel.status = travelCountry.status;
      this.countryView = alpha3;
  
      // this.url = window.location.href;
      this.url = `https://covidmeasures.info/borders/${alpha3}`
      // console.log(travelCountry)
      this.pageID = `/${travelCountry.code}${this.checkPageID(alpha3)}`;
    });
  }

  public changeCountryView(alpha3){
    this.location.replaceState(`/borders/${alpha3}`);
    const travelCountry = this.getCountry(this.countriesTravel, alpha3);

    this.travel.start = travelCountry.start;
    this.travel.end = travelCountry.end;
    this.travel.status = travelCountry.status;
    this.countryView = alpha3;

    // this.url = window.location.href;
    this.url = `https://covidmeasures.info/borders/${alpha3}`
    // console.log(travelCountry)
    this.pageID = `/${travelCountry.code}${this.checkPageID(alpha3)}`;
  }

  private getCountry(countries, alpha3) {
    for (const country of countries) {
      if (country.alpha3 === alpha3) {
        return country;
      }
    }
  }

  private checkPageID(alpha3){
    // ALPHA3 that can cause duplicates
    const duplicates = ['GBR'];
    if(duplicates.includes(alpha3)){
      // we generate Different ID
      return `c!Id${alpha3.charCodeAt(0)}${alpha3}`;
    }
    return alpha3;
  }
}
