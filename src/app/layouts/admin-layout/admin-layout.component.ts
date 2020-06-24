import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import PerfectScrollbar from 'perfect-scrollbar';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  public title: string; /** this will hold the title of the document */
  public isMobile: boolean;

  constructor( 
    public location: Location,
    private titleService: Title,
    private router: Router
  ) {}

  ngOnInit() {
    setInterval(() => Date.now(), 500);
  }

  ngAfterViewInit() {
      this.runOnRouteChange();
  }

  ngAfterContentChecked(){
    this.title = this.titleService.getTitle().split(':')[0]
  }

  runOnRouteChange(): void {
    if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
      const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
      const ps = new PerfectScrollbar(elemMainPanel);
      ps.update();
    }
  }

  isMac(): boolean {
    return (navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.platform.toUpperCase().indexOf('IPAD') >= 0);
  }

  isHomePage() {
    return this.router.url === '/home';
  }

}
