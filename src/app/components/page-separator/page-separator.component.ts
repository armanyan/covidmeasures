import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-page-separator",
  templateUrl: "./page-separator.component.html",
  styleUrls: ["./page-separator.component.css"],
})
export class PageSeparatorComponent implements OnInit {
  @Input() title: string;
  constructor() {}

  ngOnInit(): void {}
}
