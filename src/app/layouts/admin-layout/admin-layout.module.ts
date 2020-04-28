import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http'; 
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminLayoutRoutes } from './admin-layout.routing';
import { CountryComponent } from '../../country/country.component';
import { LockdownComponent } from '../../lockdown/lockdown.component';
import { SchoolComponent } from '../../school/school.component';
import { CovidComponent } from '../../covid/covid.component';
import { DeathRatesComponent } from '../../death-rates/death-rates.component';
import { AboutUsComponent } from '../../about-us/about-us.component';
import { EconomicsComponent } from '../../economics/economics.component';
import { SurveillanceComponent } from '../../surveillance/surveillance.component';
import { BordersComponent } from '../../borders/borders.component';
import { MasksComponent } from '../../masks/masks.component';
import { TestingComponent } from '../../testing/testing.component';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';

import { MapSchoolClosureComponent } from '../../components/map-school-closure/map-school-closure.component';
import { MapLockdownComponent } from '../../components/map-lockdown/map-lockdown.component';
import { MarkerService } from '../../_service/marker.service';
import { PopUpService } from '../../_service/pop-up.service';
import { ShapeService } from '../../_service/shape.service';
import { MapTilesService } from '../../_service/map-tiles.service';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatRippleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatSortModule,
    HttpClientModule,
  ],
  providers: [
    MarkerService,
    PopUpService,
    ShapeService,
    MapTilesService
  ],
  declarations: [
    CountryComponent,
    LockdownComponent,
    SchoolComponent,
    CovidComponent,
    DeathRatesComponent,
    AboutUsComponent,
    EconomicsComponent,
    SurveillanceComponent,
    BordersComponent,
    MasksComponent,
    TestingComponent,
    MapSchoolClosureComponent,
    MapLockdownComponent
  ]
})

export class AdminLayoutModule {}
