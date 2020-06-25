import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common'; 
import { Router } from '@angular/router';

import { RemindMeComponent } from 'app/components/remind-me/remind-me.component';
import { aws, mobileWidth, getAlpha3FromAlpha2, getCountryNameByAlpha } from 'app/utils';
import alpha3 from "../data/alpha3";

interface Country {
  value: string;
  viewValue: string;
  "sub-region": string;
}

const corsURL = 'https://still-plateau-79204.herokuapp.com/';
const reminderURL = 'https://amm2uwbmja.execute-api.eu-west-3.amazonaws.com/remindMe/add';

@Component({
  selector: 'app-borders',
  templateUrl: './borders.component.html',
  styleUrls: ['./borders.component.css']
})
export class BordersComponent implements OnInit {
  public isMobile: boolean;
  public readMore = false;
  public travelData: any;
  public headers = [
    "Country", "Foreigners Ban", "Home Quarantine", "COVID-19 Testing", "Closed Borders", "Other Measures",
    "Exceptions", "Start", "End", "Status"
  ];

  public table = [];

  public countryView: string;
  public countriesList: Country[] = [];

  public topic = {
    start: "",
    end: "",
    status: "No Data",
  };

  constructor(
    private http: HttpClient,
    private titleService: Title,
    private router: Router,
    private location: Location,
    private dialog: MatDialog
  ) { }

  async ngOnInit() {
    this.titleService.setTitle('International Travel: Citizens Tracking Travel Restrictions Worldwide');
    this.isMobile = window.innerWidth > mobileWidth ? false : true;
    this.travelData = (await this.http.get(`${aws}/international_flights.json`).toPromise() as any);

    this.countryView = await this.getUserCountry();
    this.getCountryView(this.countryView);

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

  public async getCountryView(alpha3: string) {
    const url = this.router.url;
    const inBorders = url.split('/').includes("borders");
    // if user are still in borders route we proceed
    if (inBorders) {
      await this.router.navigateByUrl(`borders/${alpha3}`);
      const countries = this.getCountry(this.travelData.countries, alpha3);
      this.topic.start = countries.start;
      this.topic.end = countries.end;
      this.topic.status = countries.status;
      this.countryView = alpha3; 
    }
  }

  private async getUserCountry() {
    try {
      const ip = await this.http.get(`https://ipinfo.io?token=999cc9c2d29155`).toPromise();
      return getAlpha3FromAlpha2((ip as any).country);
    } catch (_err) {
      return 'USA';
    }
  }

  public changeCountryView(alpha3){
    this.location.replaceState(`borders/${alpha3}`);
    const countries = this.getCountry(this.travelData.countries, alpha3);

    this.topic.start = countries.start;
    this.topic.end = countries.end;
    this.topic.status = countries.status;
    this.countryView = alpha3;
  }

  private getCountry(countries, alpha3) {
    for (const country of countries) {
      if (country.alpha3 === alpha3) {
        return country;
      }
    }
  }

  public openRemindMe() {

    const dialogRef = this.dialog.open(RemindMeComponent, {
      width: '500px',
      data: {email: undefined, country: getCountryNameByAlpha(this.countryView), condition: undefined}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        result.condition.forEach(async condition => {
          await this.http.post(
            `${corsURL}${reminderURL}`,
            { 'email': result.email, 'conditions': condition },
          ).toPromise();
        });
      }
    });
  }

}
