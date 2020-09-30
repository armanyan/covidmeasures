<<<<<<< HEAD
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatRippleModule } from "@angular/material/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatSelectModule } from "@angular/material/select";
import { MatSortModule } from "@angular/material/sort";
import { MatDialogModule } from "@angular/material/dialog";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
=======
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
>>>>>>> 336523ee70c275c686752111bcf415d26898d00e

import { FooterComponent } from './footer/footer.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { EconomicDataComponent } from './economic-data/economic-data.component';

@NgModule({
  imports: [
<<<<<<< HEAD
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatRippleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatSortModule,
    MatDialogModule,
    DisqusModule,

    BsDatepickerModule.forRoot(),
=======
    CommonModule,
    RouterModule,
>>>>>>> 336523ee70c275c686752111bcf415d26898d00e
  ],
  declarations: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    EconomicDataComponent
  ],
  exports: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent
  ]
})
export class ComponentsModule { }
