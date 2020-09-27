import { Component, Input, AfterViewInit } from "@angular/core";
import { aws, getCountryNameByAlpha } from "../../../utils";

@Component({
  selector: "app-survey-travel-answers",
  templateUrl: "./survey-travel-answers.component.html",
  styleUrls: ["./survey-travel-answers.component.scss"],
})
export class SurveyTravelAnswersComponent implements AfterViewInit {
  @Input() surveyQuestions: Object[];

  public surveyResults: {};
  public currentSurvey: {
    question: string;
    answers: object;
  } = {
    question: "",
    answers: {},
  };
  private surveyIndex: {
    current: number;
    max: number;
  } = { current: 0, max: 0 };

  constructor() {}

  async ngAfterViewInit() {
    await fetch(`${aws}/community_travel.json`)
      .then((res) => res.json())
      .then((data: Object[]) => {
        const surveyResults = {};

        data.forEach((item) => {
          // to change unreadable string of Q6 with Alpha3
          if (item["Alpha3 (from Table 2)"]) {
            // we try
            item["Q6 - Country"][0] = item["Alpha3 (from Table 2)"];
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

        const orderedSurveyResults = {};
        Object.keys(surveyResults)
          .sort()
          .forEach(function (key) {
            orderedSurveyResults[key] = surveyResults[key];
          });
        this.surveyResults = orderedSurveyResults;
        this.surveyIndex.current = 0;
        this.surveyIndex.max = Object.keys(this.surveyResults).length - 1;
      });
    this.setCurrentSurvey();
  }

  getPercentOf(y: number, x: number) {
    return ((y / x) * 100).toFixed(2);
  }

  private setCurrentSurvey() {
    this.currentSurvey.question = Object.keys(this.surveyResults)[
      this.surveyIndex.current
    ];
    this.currentSurvey.answers = this.surveyResults[
      this.currentSurvey.question
    ];
  }

  public nextSurvey() {
    if (this.surveyIndex.current + 1 <= this.surveyIndex.max) {
      this.surveyIndex.current = this.surveyIndex.current + 1;
    } else {
      this.surveyIndex.current = 0;
    }
    this.setCurrentSurvey();
  }
  public prevSurvey() {
    if (this.surveyIndex.current - 1 >= 0) {
      this.surveyIndex.current = this.surveyIndex.current - 1;
    } else {
      this.surveyIndex.current = this.surveyIndex.max;
    }
    this.setCurrentSurvey();
  }

  public formatAnswer(answer: string | number, question: string) {
    switch (question) {
      case "Q6 - What country are you in?":
        return getCountryNameByAlpha(answer.toString());
      default:
        return answer;
    }
  }
}
