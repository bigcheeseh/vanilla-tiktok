import { Feed } from './Feed.js';
import { MockVideoSource } from './VideoSource.js';

const feed = new Feed(
  document.querySelector('[data-feed]'),
  document.querySelector('[data-slide-template]'),
  null, // concrete LinkedVideoList implementation
  new MockVideoSource('./src/videos.json'),
);

feed.start();

document.querySelector('[data-mute]').addEventListener('click', () => {
  feed.setMuted(!feed.muted);
});
