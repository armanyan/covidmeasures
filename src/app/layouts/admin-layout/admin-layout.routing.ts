import { Routes } from '@angular/router';

import { CountryComponent } from '../../country/country.component';
import { LockdownComponent } from '../../lockdown/lockdown.component';
import { SchoolComponent } from '../../school/school.component';
import { CovidComponent } from '../../covid/covid.component';
import { DeathRatesComponent } from '../../death-rates/death-rates.component';
import { EconomicsComponent } from '../../economics/economics.component';
import { SurveillanceComponent } from '../../surveillance/surveillance.component';
import { BordersComponent } from '../../borders/borders.component';
import { MasksComponent } from '../../masks/masks.component';
import { TestingComponent } from '../../testing/testing.component';
import { AboutUsComponent } from '../../about-us/about-us.component';


export const AdminLayoutRoutes: Routes = [
  { path: 'country', component: CountryComponent },
  { path: 'lockdown', component: LockdownComponent },
  { path: 'school', component: SchoolComponent },
  { path: 'covid', component: CovidComponent },
  { path: 'deathrates', component: DeathRatesComponent },
  { path: 'economics', component: EconomicsComponent },
  { path: 'surveillance',  component: SurveillanceComponent },
  { path: 'borders', component: BordersComponent },
  { path: 'masks', component: MasksComponent },
  { path: 'testing', component: TestingComponent },
  { path: 'aboutus', component: AboutUsComponent }
];
