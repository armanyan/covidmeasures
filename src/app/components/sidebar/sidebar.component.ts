import { Component, OnInit } from '@angular/core';

declare const $: any;
declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
    soon?: boolean;
    join?: boolean;
    contribute?: boolean;
}
export const ROUTES: RouteInfo[] = [
  { path: '/lockdown', title: 'Lockdown Stats',  icon:'lock', class: '' },
  { path: '/school', title: 'School Closure',  icon:'school', class: '' },
  { path: '/covid', title: 'COVID-19 Stats',  icon: 'dashboard', class: '' },
  { path: '/deathrates', title: 'Death Rates',  icon:'trending_up', class: '' },
  { path: '/economics', title: 'Economic Stimulus', soon: true, icon:'monetization_on', class: '' },
  { path: '/surveillance', title: 'Surveillance', soon: true,  icon:'policy', class: '' },
  { path: '/borders', title: 'Border Control', soon: true,  icon:'location_on', class: '' },
  { path: '/masks', title: 'Masks', soon: true,  icon:'healing', class: '' },
  { path: '/testing', title: 'Testing', soon: true,  icon:'local_hospital', class: '' },
  { path: '/aboutus', title: 'About Us', icon:'supervisor_account', class: '' },
  { path: '/join', title: 'Join Us', join: true, icon:'contact_mail', class: '' },
  { path: '/contribute', title: 'Contribute', contribute: true, icon:'pan_tool', class: '' }
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  menuItems: any[];

  constructor() { }

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
  }
  isMobileMenu() {
      if ($(window).width() > 991) {
          return false;
      }
      return true;
  };
}
