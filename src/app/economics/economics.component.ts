import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import * as economics from '../data/economic';

@Component({
  selector: 'app-economics',
  templateUrl: './economics.component.html',
  styleUrls: ['./economics.component.css']
})
export class EconomicsComponent implements OnInit {
  public isMobile: boolean;

  public headers = [
    "Country", "Title", "Description", "Announcement Date", "Loans (%)", "Grants (%)", "Individuals (y/n)",
    "Small Businesses (y/n)", "Large Businesses (y/n)", "Amount (millions)"
  ];

  public table = [];

  constructor(
    private titleService: Title
  ) { }

  ngOnInit() {
    this.titleService.setTitle('Economic Stimulus Related to COVID-19 Pandemics');
    this.isMobile = window.innerWidth > 991 ? false : true;

    this.setTable();
  }

  private setTable() {
    for (const row of economics.default) {
      this.table.push({
        "country": row.country,
        "title": row.title,
        "desc": row.description,
        "announce": row.announcement,
        "loans": row.loans,
        "grants": row.grants,
        "fiscal": row.fiscal,
        "small": row.small_business,
        "large": row.large_business,
        "amount": row.amount,
        "currency": row.currency
      });
    }
  }

}
