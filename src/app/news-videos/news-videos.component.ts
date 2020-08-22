import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
@Component({
  selector: 'app-news-videos',
  templateUrl: './news-videos.component.html',
  styleUrls: ['./news-videos.component.css']
})
export class NewsVideosComponent implements OnInit {

  constructor(   
     private titleService: Title,) { }

  ngOnInit(): void {
     this.titleService.setTitle('News Channel');
  }
}
