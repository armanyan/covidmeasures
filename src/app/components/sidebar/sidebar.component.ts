import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';

declare const $: any;
declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
    soon?: boolean;
    hide?: boolean;
    link?: boolean;
    belongsTo?: string;
}
export const ROUTES: RouteInfo[] = [
  { path: '/country', title: 'Country Overview',  icon:'outlined_flag', class: '' },
  { path: '/lockdown', title: 'Lockdown', icon:'lock', class: '',  belongsTo: 'measures' },
  { path: '/school', title: 'School Closure',  icon:'school', class: '',  belongsTo: 'measures' },
  { path: '/covid', title: 'COVID-19 Statistics',  icon:'table_chart', class: '' },
  { path: '/impacts', title: 'Impacts',  icon:'vertical_align_center', class: '' },
  // { path: '/covid', title: 'COVID-19',  icon: 'table_chart', class: '', belongsTo: 'statistics' },
  // { path: '/deathrates', title: 'Death Rates',  icon:'trending_up', class: '', belongsTo: 'statistics' },
  { path: '/economics', title: 'Economic Stimulus', hide: true, icon:'monetization_on', class: '' },
  { path: '/surveillance', title: 'Surveillance',  icon:'policy', class: '',  belongsTo: 'measures' },
  { path: '/borders', title: 'International Travel', icon: 'airplanemode_active', class: '', belongsTo: 'measures' },
  { path: '/masks', title: 'Masks', hide: true, icon:'healing', class: '',  belongsTo: 'measures' },
  { path: '/testing', title: 'Testing', soon: true, icon:'local_hospital', class: '', belongsTo: 'measures' },
  { path: '/aboutus', title: 'About Us', icon:'supervisor_account', class: '' },
  { path: 'https://www.buymeacoffee.com/covidmeasures', title: 'Buy Us A Coffee', icon:'local_cafe', class: '', link: true }
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  menuItems: any[];

  constructor(
    private router: Router,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    // const statistics = { title: "Statistics", collapse: true, icon: 'arrow_drop_down', menus : []};
    // statistics.menus = ROUTES.filter(item => item.belongsTo == 'statistics');
    
    const measures =  { title: "Measures", collapse:true, icon: 'arrow_drop_down', menus : []};
    measures.menus = ROUTES.filter(item => item.belongsTo === 'measures');

    this.menuItems = ROUTES.filter(menuItem => menuItem.belongsTo === undefined);
    this.menuItems.splice(1,0, measures);
    // this.menuItems.splice(2,0, statistics);

  }
  isMobileMenu() {
      if ($(window).width() > 991) {
          return false;
      }
      return true;
  };

  public navigateToRoute(path: string){
    // seems a problem in firefox to navigate twice
    this.router.navigateByUrl(path).then(()=> {
      // console.log("navigated once")
      this.ngZone.run(()=> {
        this.router.navigateByUrl(path).then(()=> {
          // console.log("navigated twice")
        })
      })
    })
  }
}
