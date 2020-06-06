import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "app-disqus-comments",
  templateUrl: "./disqus-comments.component.html",
  styleUrls: ["./disqus-comments.component.css"],
})
export class DisqusCommentsComponent implements OnInit {

  public pageID:string = "";
  public url: string = "";

  @Input() countriesData: any;
  @Input() baseUrl: string;
  @Input() page: string;
  @Input() uniqueString: string;
  @Input() uniqueAll?: boolean;
  @Input() duplicatesID?: string[] = [];
  @Input() set countryAlpha3(alpha3: string){
    const countries = this.getCountry(alpha3);
    if (countries) {
      this.url = `${this.baseUrl}/${this.page}/${alpha3}`
      this.pageID = `/${countries.code}${this.checkPageID(alpha3)}`;
    }
  }

  constructor() {}

  async ngOnInit() {}

  private getCountry(alpha3: string) {
    for (const country of this.countriesData) {
      if (country.alpha3 === alpha3) {
        return country;
      }
    }
  }

  private checkPageID(alpha3){
    // if uniques ID is required to all pages
    if (this.uniqueAll) return `${this.uniqueString}${alpha3.charCodeAt(0)}${alpha3}`;
    
    // if unique ID have duplicate
    const duplicates = this.duplicatesID;
    if (duplicates.includes(alpha3)) return `${this.uniqueString}${alpha3.charCodeAt(0)}${alpha3}`;
    
    return alpha3;
  }
}
