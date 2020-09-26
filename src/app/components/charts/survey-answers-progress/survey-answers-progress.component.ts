import { Component, OnInit } from "@angular/core";
import { aws } from "../../../utils";

@Component({
  selector: "app-survey-answers-progress",
  templateUrl: "./survey-answers-progress.component.html",
  styleUrls: ["./survey-answers-progress.component.css"],
})
export class SurveyAnswersProgressComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    fetch(`${aws}/community_school_reopening.json`)
      .then((res) => res.json())
      .then((data: Object[]) => {
        const surveyResults = {};

        console.log("progress");
        data.forEach((data) => {
          for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
              const answer = data[key];
              const attr = key.split(" ")[0];

              if (surveyResults[attr]) {
                if (surveyResults[attr][answer]) {
                  surveyResults[attr][answer] = surveyResults[attr][answer] + 1;
                  console.log("if", surveyResults[attr]);
                } else {
                  surveyResults[attr][answer] = 1;
                }
              } else {
                surveyResults[attr] = {
                  [answer]: 1,
                };
                console.log("else", surveyResults[attr]);
              }
            }
          }
        });
        console.log(surveyResults);
      });
  }
}
