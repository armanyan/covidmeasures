import { Component, OnInit } from '@angular/core';

declare const $: any;
declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
    soon?: boolean;
}
export const ROUTES: RouteInfo[] = [
  { path: '/lockdown', title: 'Lockdown Stats',  icon:'lock', class: '' },
  { path: '/covid', title: 'COVID-19 Stats',  icon: 'dashboard', class: '' },
  { path: '/deathrates', title: 'Death Rates',  icon:'trending_up', class: '' },
  { path: '/economics', title: 'Economic Stimulus', soon: true, icon:'monetization_on', class: '' },
  { path: '/surveillance', title: 'Surveillance', soon: true,  icon:'policy', class: '' },
  { path: '/borders', title: 'Border Control', soon: true,  icon:'location_on', class: '' },
  { path: '/aboutus', title: 'About Us', icon:'supervisor_account', class: '' },
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
