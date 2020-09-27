import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";

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

@NgModule({
  imports: [CommonModule, RouterModule, DisqusModule],
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
    DisqusModule,
  ],
})
export class ComponentsModule {}
