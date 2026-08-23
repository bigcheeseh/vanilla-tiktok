import { Feed } from "./Feed.js";
import { LinkedVideoList } from "./LinkedVideoList.js"
import { videos } from "./videos.js";

const feed = new Feed(
  document.querySelector("[data-feed]"),
  document.querySelector("[data-slide-template]"),
  (new LinkedVideoList()).append(videos),
);

feed.start();

document.querySelector("[data-mute]").addEventListener("click", () => {
  feed.setMuted(!feed.muted);
});
