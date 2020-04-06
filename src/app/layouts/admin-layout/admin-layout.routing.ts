import { Routes } from '@angular/router';

import { CovidComponent } from '../../covid/covid.component';
import { LockdownComponent } from '../../lockdown/lockdown.component';
import { DeathRatesComponent } from '../../death-rates/death-rates.component';
import { EconomicsComponent } from '../../economics/economics.component';
import { SurveillanceComponent } from '../../surveillance/surveillance.component';
import { BordersComponent } from '../../borders/borders.component';
import { AboutUsComponent } from '../../about-us/about-us.component';


export const AdminLayoutRoutes: Routes = [
  { path: 'lockdown', component: LockdownComponent },
  { path: 'covid', component: CovidComponent },
  { path: 'deathrates', component: DeathRatesComponent },
  { path: 'economics', component: EconomicsComponent },
  { path: 'surveillance',  component: SurveillanceComponent },
  { path: 'borders', component: BordersComponent },
  { path: 'aboutus', component: AboutUsComponent }
];
