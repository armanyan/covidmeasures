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
  public currentVideoId: string;

  constructor(private titleService: Title, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.titleService.setTitle("News Channel");
    this.getYoutubeVideos();
  }

  private async getYoutubeVideos() {
    const uploadOrPlaylistId = "UUH4NDnTrZ8NukMbLWwcIGeg";

    let url =
      "https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&part=snippet&playlistId=" +
      uploadOrPlaylistId +
      "&key=AIzaSyAiCIfLTl3k1aSPcPScEvnylvYgXfP4Bos";
    await fetch(url)
      .then((res) => res.json())
      .then((data) => (this.playlists = data.items));

    // console.log(this.playlists);
    this.setShowedVideo(this.playlists[0].contentDetails.videoId);
  }

  public setShowedVideo(id: string) {
    this.currentVideoId = id;
    this.showedVideoSrc = this.sanitizer.bypassSecurityTrustResourceUrl(
      "https://www.youtube.com/embed/" + id
    );
  }

  public playlistItemStyle(item: any) {
    const imgUrl = item.snippet.thumbnails.high.url;
    const videoId = item.snippet.resourceId.videoId;

    return videoId == this.currentVideoId
      ? {
          "background-image": "url(" + imgUrl + ")",
          border: "solid 4px #82c386",
          opacity: 1,
        }
      : {
          "background-image": "url(" + imgUrl + ")",
        };
  }
}

//  Additional Routes
/**
 *  To get Channel Info
 *  -> https://www.googleapis.com/youtube/v3/channels?id={channel Id}&key={API key}&part=contentDetails
 *
 *  To get Playlist Info
 *  -> https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&part=snippet&playlistId={playlist_Id}&key={Api_Key}
 */
