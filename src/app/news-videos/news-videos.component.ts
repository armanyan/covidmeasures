import { Component, OnInit } from "@angular/core";
import {
  DomSanitizer,
  SafeResourceUrl,
  Title,
} from "@angular/platform-browser";
@Component({
  selector: "app-news-videos",
  templateUrl: "./news-videos.component.html",
  styleUrls: ["./news-videos.component.css"],
})
export class NewsVideosComponent implements OnInit {
  public showedVideoSrc: SafeResourceUrl;
  public playlists = [];

  constructor(private titleService: Title, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.titleService.setTitle("News Channel");
    this.getYoutubeVideos();
  }

  private async getYoutubeVideos() {
    const playlistId = "PLC3y8-rFHvwhBRAgFinJR8KHIrCdTkZcZ";
    this.showedVideoSrc = this.sanitizer.bypassSecurityTrustResourceUrl(
      "https://www.youtube.com/embed/GMHY6dEIIio"
    );
    let url =
      "https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&part=snippet&playlistId=" +
      playlistId +
      "&key=AIzaSyAiCIfLTl3k1aSPcPScEvnylvYgXfP4Bos";
    await fetch(url)
      .then((res) => res.json())
      .then((data) => (this.playlists = data.items));
    console.log(this.playlists);
  }

  public setShowedVideo(id: string) {
    this.showedVideoSrc = this.sanitizer.bypassSecurityTrustResourceUrl(
      "https://www.youtube.com/embed/" + id
    );
  }
}
