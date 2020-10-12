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

import { FooterComponent } from "./footer/footer.component";
import { NavbarComponent } from "./navbar/navbar.component";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { EconomicDataComponent } from "./economic-data/economic-data.component";
import { MapSchoolClosureComponent } from "./maps/map-school-closure/map-school-closure.component";
import { MapLockdownComponent } from "./maps/map-lockdown/map-lockdown.component";
import { MapMasksComponent } from "./maps/map-masks/map-masks.component";
import { DisqusCommentsComponent } from "./pages-comments/disqus-comments.component";
import { DisqusModule } from "ngx-disqus";
import { PageLoadersComponent } from "./page-loaders/page-loaders.component";
import { RemindMeComponent } from "./remind-me/remind-me.component";
import { EvolutionCountryComponent } from "./charts/evolution-country/evolution-country.component";
import { PageQuestionComponent } from "./page-question/page-question.component";
import { PageNavigatorComponent } from "./page-navigator/page-navigator.component";
import { PageSeparatorComponent } from "./page-separator/page-separator.component";
import { SurveySchoolAnswersComponent } from "./charts/survey-school-answers/survey-school-answers.component";
import { SurveyTravelAnswersComponent } from "./charts/survey-travel-answers/survey-travel-answers.component";
import { SurveyGatheringsAnswersComponent } from './charts/survey-gatherings-answers/survey-gatherings-answers.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatRippleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatSortModule,
    MatDialogModule,
    BsDatepickerModule.forRoot(),
    DisqusModule,
  ],
  declarations: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    EconomicDataComponent,
    MapSchoolClosureComponent,
    MapLockdownComponent,
    MapMasksComponent,
    DisqusCommentsComponent,
    PageLoadersComponent,
    RemindMeComponent,
    EvolutionCountryComponent,
    PageQuestionComponent,
    PageNavigatorComponent,
    PageSeparatorComponent,
    SurveySchoolAnswersComponent,
    SurveyTravelAnswersComponent,
    SurveyGatheringsAnswersComponent,
  ],
  exports: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    MapSchoolClosureComponent,
    MapLockdownComponent,
    MapMasksComponent,
    DisqusCommentsComponent,
    PageLoadersComponent,
    RemindMeComponent,
    EvolutionCountryComponent,
    PageQuestionComponent,
    PageNavigatorComponent,
    PageSeparatorComponent,
    SurveySchoolAnswersComponent,
    SurveyTravelAnswersComponent,
    SurveyGatheringsAnswersComponent,
    DisqusModule,
  ],
})
export class ComponentsModule {}
