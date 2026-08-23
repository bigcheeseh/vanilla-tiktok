import { Feed } from "./Feed.js";
import { LinkedVideoList } from "./LinkedVideoList.js";
import { videos } from "./videos.js";

const list = new LinkedVideoList().append(videos);
const feed = new Feed(
  document.querySelector("[data-feed]"),
  document.querySelector("[data-slide-template]"),
  list,
);

feed.start();

const muteButton = document.querySelector("[data-mute]");
muteButton.addEventListener("click", () => {
  feed.setMuted(!feed.muted);
  muteButton.textContent = feed.muted ? "🔇" : "🔊";
});
