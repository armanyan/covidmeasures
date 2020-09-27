import { Component, Input, OnInit } from "@angular/core";
import { aws } from "../../../utils";

@Component({
  selector: "app-survey-school-answers",
  templateUrl: "./survey-school-answers.component.html",
  styleUrls: ["./survey-school-answers.component.css"],
})
export class SurveySchoolAnswersComponent implements OnInit {
  @Input() surveyQuestions: Object[];
  constructor() {}

  ngOnInit(): void {
    fetch(`${aws}/community_school_reopening.json`)
      .then((res) => res.json())
      .then((data: Object[]) => {
        const surveyResults = {};

        console.log("progress");
        data.forEach((item) => {
          // to change unreadable string of Q5 with Alpha3
          if (item["Alpha3 (from Table 2)"]) {
            // we try
            item["Q5 - What country are you in?"][0] =
              item["Alpha3 (from Table 2)"];
          }
          for (const key in item) {
            if (Object.prototype.hasOwnProperty.call(item, key)) {
              const answer = item[key];
              let attr = key.split(" ")[0];
              const propertyName = `${attr} - ${this.surveyQuestions[attr]}`;

              if (surveyResults[propertyName]) {
                // if we already have the question
                if (surveyResults[propertyName][answer]) {
                  // if we already have the answer & the question
                  surveyResults[propertyName][answer] =
                    surveyResults[propertyName][answer] + 1;
                } else {
                  // if we dont have the answer of the question yet
                  surveyResults[propertyName][answer] = 1;
                }
                // will hold the supposed total votes
                surveyResults[propertyName].total =
                  surveyResults[propertyName].total + 1;
              } else {
                if (this.surveyQuestions[attr] != undefined) {
                  surveyResults[propertyName] = {
                    [answer]: 1,
                    total: 1,
                  };
                }
              }
            }
          }
        });
        console.log(surveyResults);
      });
  }
}
