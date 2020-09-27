import { Component, Input, AfterViewInit } from "@angular/core";
import { aws, getCountryNameByAlpha } from "../../../utils";

@Component({
  selector: "app-survey-travel-answers",
  templateUrl: "./survey-travel-answers.component.html",
  styleUrls: ["./survey-travel-answers.component.css"],
})
export class SurveyTravelAnswersComponent implements AfterViewInit {
  @Input() surveyQuestions: Object[];

  constructor() {}

  async ngAfterViewInit() {
    await fetch(`${aws}/community_travel.json`)
      .then((res) => res.json())
      .then((data: Object[]) => {});
  }
}
