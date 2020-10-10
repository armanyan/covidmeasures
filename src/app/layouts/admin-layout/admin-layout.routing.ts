import { Routes } from '@angular/router';

import { HomeComponent } from '../../homepage/homepage.component';
import { CountryComponent } from '../../country/country.component';
import { LockdownComponent } from '../../lockdown/lockdown.component';
import { SchoolComponent } from '../../school/school.component';
import { ImpactsComponent } from '../../impacts/impacts.component';
import { CovidComponent } from '../../covid/covid.component';
import { DeathRatesComponent } from '../../death-rates/death-rates.component';
import { EconomicsComponent } from '../../economics/economics.component';
import { SurveillanceComponent } from '../../surveillance/surveillance.component';
import { BordersComponent } from '../../borders/borders.component';
import { MasksComponent } from '../../masks/masks.component';
import { TestingComponent } from '../../testing/testing.component';
import { GatheringsComponent } from '../../gatherings/gatherings.component';
import { AboutUsComponent } from '../../about-us/about-us.component';
import { NewsVideosComponent } from '../../news-videos/news-videos.component';

export const AdminLayoutRoutes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'country', component: CountryComponent, pathMatch: 'full' },
  { path: 'country/:alpha3', component: CountryComponent },
  { path: 'lockdown', component: LockdownComponent },
  { path: 'school', component: SchoolComponent },
  { path: 'impacts', component: ImpactsComponent },
  { path: 'covid', component: CovidComponent },
  { path: 'deathrates', component: DeathRatesComponent },
  { path: 'economics', component: EconomicsComponent },
  { path: 'surveillance',  component: SurveillanceComponent },
  { path: 'borders', component: BordersComponent, pathMatch: 'full' },
  { path: 'borders/:alpha3', component: BordersComponent },
  { path: 'masks', component: MasksComponent },
  { path: 'testing', component: TestingComponent },
  { path: 'gatherings', component: GatheringsComponent },
  { path: 'aboutus', component: AboutUsComponent },
  { path: 'news', component: NewsVideosComponent }
];
