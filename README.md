# Vanilla TikTok

Vertical short-video feed. Vanilla JS, no framework, no build step.

## Run

```bash
pnpm install
pnpm start        # http://localhost:8000
```

ES modules need HTTP — opening `index.html` as a file will not work.

## Solution

A fixed pool of 5 slides lives in the DOM around a cursor. Scroll rests on the
middle one; when it settles elsewhere, the slides left behind move to the other
end and get the next videos. Constant number of decoders.

Videos are stored in a circular doubly-linked list — navigation is a
`prev`/`next` hop.

`scroll-snap-type: y mandatory` drives the gesture, so mobile and desktop share
one code path. `IntersectionObserver` drives playback: one video at a time.

Only the centre slide and its neighbours preload, and they start after the
centre video fires `canplay`.
