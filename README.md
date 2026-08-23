# Vanilla TikTok

Vertical short-video feed. Vanilla JS, no framework, no build step.

## Run

```bash
pnpm install
pnpm start        # http://localhost:8000
```

ES modules need HTTP — opening `index.html` as a file will not work.

## Structure

```
index.html            markup + slide <template>
styles/main.css
src/
  main.js             entry
  Feed.js             slide pool, recycling, playback
  LinkedVideoList.js  circular doubly-linked list with a cursor
  videos.js           video list
assets/videos/        video files
```

## Solution

A fixed pool of slides lives in the DOM around the cursor. Scroll rests on the
middle one; when it settles elsewhere, the slides left behind move to the other
end, get the next videos, and scroll returns to the middle. Endless feed, a
constant number of decoders.

Videos live in a circular doubly-linked list: navigation is a `prev`/`next` hop.

`scroll-snap-type: y mandatory` drives the gesture — swipe, wheel and trackpad
come from the browser, so mobile and desktop share one code path.

`IntersectionObserver` drives playback: one video plays, the rest are paused and
rewound. Rebinding a slide releases the old buffer. Playback stops in background
tabs.

Pool size and preload depth are separate. Five slides give a fast swipe room to
run; only the centre one and its two neighbours download, and they start only
after the first video can play — so the first frame never shares the connection.
