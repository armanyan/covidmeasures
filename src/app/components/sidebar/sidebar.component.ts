import { Component, OnInit, NgZone } from "@angular/core";
import { Router } from "@angular/router";

declare const $: any;
declare interface RouteInfo {
  path: string;
  href?: boolean;
  title: string;
  icon: string;
  class: string;
  soon?: boolean;
  hide?: boolean;
  link?: boolean;
  belongsTo?: string;
}
export const ROUTES: RouteInfo[] = [
  {
    path: "/country",
    title: "Country Overview",
    icon: "outlined_flag",
    class: "",
  },
  {
    path: "/lockdown",
    title: "Lockdown",
    icon: "lock",
    class: "",
    belongsTo: "measures",
  },
  {
    path: "/school",
    title: "School Closure",
    icon: "school",
    class: "",
    belongsTo: "measures",
  },
  {
    path: "/covid",
    title: "COVID-19 Statistics",
    icon: "table_chart",
    class: "",
  },
  {
    path: "/impacts",
    title: "Impacts",
    icon: "vertical_align_center",
    class: "",
  },
  {
    path: "/surveillance",
    title: "Surveillance",
    icon: "policy",
    class: "",
    belongsTo: "measures",
  },
  {
    path: "/borders",
    title: "International Travel",
    icon: "airplanemode_active",
    class: "",
    belongsTo: "measures",
  },
  {
    path: "/masks",
    title: "Masks",
    hide: true,
    icon: "healing",
    class: "",
    belongsTo: "measures",
  },
  {
    path: "/testing",
    title: "Tests & Vaccine",
    // soon: true,
    icon: "local_hospital",
    class: "",
    belongsTo: "measures",
  },
  {
    path: "/gatherings",
    title: "Mass Gatherings",
    icon: "people_alt",
    class: "",
    belongsTo: "measures",
  },
  {
    path: "/news",
    title: "CovidMeasures TV",
    icon: "video_library",
    class: "",
  },
  {
    path: "/aboutus",
    title: "About Us",
    icon: "supervisor_account",
    class: "",
  },
  {
    path: "https://www.instagram.com/covidmeasures.info/",
    href: true,
    title: "Instagram",
    icon: "../../../assets/svg-icons/instagram_gray.svg",
    class: "",
    belongsTo: "follow_us",
  },
  {
    path: "https://www.facebook.com/CovidMeasures.info",
    href: true,
    title: "Facebook",
    icon: "../../../assets/svg-icons/fb_logo_grey.svg",
    class: "",
    belongsTo: "follow_us",
  },
  {
    path: "https://www.youtube.com/channel/UCH4NDnTrZ8NukMbLWwcIGeg",
    href: true,
    title: "Youtube",
    icon: "../../../assets/svg-icons/youtube_logo_gray.svg",
    class: "",
    belongsTo: "follow_us",
  },
  {
    path: "https://www.buymeacoffee.com/covidmeasures",
    title: "Buy Us A Coffee",
    icon: "local_cafe",
    class: "",
    link: true,
  },
];

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.css"],
})
export class SidebarComponent implements OnInit {
  menuItems: any[];

  constructor(private router: Router, private ngZone: NgZone) {}

  ngOnInit() {
    // We set collapsable Menu
    const socialMedia = {
      title: "Follow Us!",
      show: false,
      id: "followUs",
      collapse: true,
      icon: "arrow_drop_down",
      menus: [],
    };
    socialMedia.menus = ROUTES.filter((item) => item.belongsTo == "follow_us");

    const measures = {
      title: "Measures",
      show: false,
      id: "measures",
      collapse: true,
      icon: "arrow_drop_down",
      menus: [],
    };
    measures.menus = ROUTES.filter((item) => item.belongsTo === "measures");

    this.menuItems = ROUTES.filter(
      (menuItem) => menuItem.belongsTo === undefined
    );
    this.menuItems.splice(1, 0, measures);
    this.menuItems.splice(7, 0, socialMedia);
  }
  isMobileMenu() {
    if ($(window).width() > 991) {
      return false;
    }
    return true;
  }

  public navigateToRoute(path: string) {
    // seems a problem in firefox to navigate twice
    this.router.navigateByUrl(path).then(() => {
      // console.log("navigated once")
      this.ngZone.run(() => {
        this.router.navigateByUrl(path).then(() => {
          // console.log("navigated twice")
        });
      });
    });
  }
}
