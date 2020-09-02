import { Component, HostListener, Inject, Input, OnInit } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
@Component({
  selector: "app-page-navigator",
  templateUrl: "./page-navigator.component.html",
  styleUrls: ["./page-navigator.component.css"],
})
export class PageNavigatorComponent implements OnInit {
  @Input() pageSections: Array<{ name: string; sectionID: string }>;
  @Input() navTopDistance: number = 0;
  private paramSection: string;

  constructor(@Inject(DOCUMENT) document, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // we get the distance of pagenave from the top of the screen
    if (!this.navTopDistance) {
      this.navTopDistance = document
        .getElementById("pageNavbar")
        .getBoundingClientRect().top;
    }
    // we get the params in he url
    this.route.queryParams.subscribe(params => {
      if ( params['section']) {
        this.paramSection = params['section'];
        // we add little delay
        setTimeout(()=> {
          this.scrollInto(this.paramSection)
        }, 1000)
      }

    });
  }

  @HostListener("window:scroll", ["$event"])
  onWindowScroll(e) {
    let pageNavbar = document.getElementById("pageNavbar");
    if (window.pageYOffset > this.navTopDistance + 200) {
      // if scroll past pagenav we make it fixed
      pageNavbar.classList.add("nav-fixed");
    } else {
      pageNavbar.classList.remove("nav-fixed");
    }
  }

  public scrollInto(id: string): void {
    const yOffset = -60;
    const el: HTMLElement | null = document.getElementById(id);
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
    if (el) {
      setTimeout(() => window.scrollTo({ top: y, behavior: "smooth" }), 0);
    }
  }
}
