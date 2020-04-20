import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import 'rxjs/add/operator/filter';
import { Router, Event } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import PerfectScrollbar from 'perfect-scrollbar';
import { Title } from '@angular/platform-browser';
import { NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  private _router: Subscription;
  private lastPoppedUrl: string;
  private yScrollStack: number[] = [];
  public title: string; /** this will hold the title of the document */
  public isMobile: boolean;

  constructor( 
    public location: Location, 
    private router: Router, 
    private titleService: Title 
    ) {
        //Router subscriber
        this.router.events.subscribe((event: Event) => {
          if (event instanceof NavigationEnd) {
            // we change the title in the banner
            setTimeout(()=> {
              this.title = this.titleService.getTitle()
            }, 500)
          }
      });
    }

  ngOnInit() {
      
  }
  ngAfterViewInit() {
      this.runOnRouteChange();
  }
  ngAfterContentChecked(){
    this.title = this.titleService.getTitle()
  }
  isMaps(path){
      var titlee = this.location.prepareExternalUrl(this.location.path());
      titlee = titlee.slice( 1 );
      if(path == titlee){
          return false;
      }
      else {
          return true;
      }
  }
  runOnRouteChange(): void {
    if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
      const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
      const ps = new PerfectScrollbar(elemMainPanel);
      ps.update();
    }
  }
  isMac(): boolean {
      let bool = false;
      if (navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.platform.toUpperCase().indexOf('IPAD') >= 0) {
          bool = true;
      }
      return bool;
  }

}
