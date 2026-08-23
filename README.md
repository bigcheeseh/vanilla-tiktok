# Reels

Vertical short-video feed, vanilla JS, no build step.

## Run

ES modules need HTTP, `file://` will not work:

```bash
npx serve .
```

## Structure

```
index.html
styles/main.css
src/
  main.js              entry
  Feed.js              binds the list to 3 recycled DOM slides
  LinkedVideoList.js   doubly-linked list with a cursor (abstract)
  VideoSource.js       paginated source (abstract) + mock
  videos.json          mock data
assets/videos/         video files
```

## Notes

Videos from the task folder go to `assets/videos/` and are listed in
`src/videos.json`. Local files rather than cloud links: cloud storage does not
serve Range requests, so seeking and chunked loading break.

The feed is a doubly-linked list with a cursor. Scrolling is a `prev`/`next`
pointer hop, appending a page is O(1), and old nodes are dropped from the head
to bound memory. No index lookup — search belongs on the backend.

Three `<video>` elements are created once and recycled. Native scroll with
`scroll-snap-type: y mandatory` handles the gesture, inertia, wheel and
trackpad, so desktop works with the same code as mobile.
