# Reels

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

Three slides in the DOM — prev, current, next. Scroll rests on the middle one;
when it settles elsewhere, the off-screen slide moves to the other end, gets the
next video, and scroll returns to the middle. Endless feed, three decoders.

Videos live in a circular doubly-linked list: navigation is a `prev`/`next` hop.

`scroll-snap-type: y mandatory` drives the gesture — swipe, wheel and trackpad
come from the browser, so mobile and desktop share one code path.

`IntersectionObserver` drives playback: one video plays, the rest are paused and
rewound. Rebinding a slide releases the old buffer. Playback stops in background
tabs. All three slides preload — instant swipe at the cost of three files in
flight.
