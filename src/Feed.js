import { LinkedVideoList } from "./LinkedVideoList.js";

/** Slides kept in the DOM. Odd, so one is exactly in the middle. */
const POOL_SIZE = 5;

/** Index of the slide the scroll rests on. */
const CENTER = Math.floor(POOL_SIZE / 2);

/**
 * How far from the centre videos are actually downloaded.
 * Pool size buys scroll headroom; this buys buffering. They are separate:
 * the outer slides exist only so a fast swipe never hits the container edge,
 * and they cost no traffic while their preload stays "none".
 */
const PRELOAD_RADIUS = 1;

/** Idle time that means inertia has stopped. `scrollend` is missing in Safari < 18. */
const SCROLL_IDLE_MS = 120;

/**
 * Binds the list to a fixed pool of recycled DOM slides.
 *
 * The <video> elements are created once and never replaced: each one is a
 * decoder, and mobile browsers cap how many can exist. After a snap settles,
 * the slides that went off screen are moved to the other end of the container
 * and rebound, and the scroll returns to the centre.
 */
export class Feed {
  /**
   * @param {HTMLElement} container [data-feed]
   * @param {HTMLTemplateElement} template [data-slide-template]
   * @param {LinkedVideoList} list
   */
  constructor(container, template, list) {
    this.container = container;
    this.template = template;
    this.list = list;
    /** @type {HTMLElement[]} kept in DOM order */
    this.slides = [];
    this.muted = true;
    this.scrollTimer = null;
    /** Starts at 0 so the first video gets the whole connection to itself. */
    this.preloadRadius = 0;
  }

  start() {
    this.createSlides();
    this.render();
    this.observePlayback();
    this.center();

    // Neighbours start downloading only once the first video can play,
    // otherwise they would share the connection with it and delay the frame.
    this.centerVideo().addEventListener("canplay", () => {
      this.preloadRadius = PRELOAD_RADIUS;
      this.applyPreload();
    }, { once: true });

    this.container.addEventListener("scroll", () => {
      clearTimeout(this.scrollTimer);
      this.scrollTimer = setTimeout(() => this.onScrollEnd(), SCROLL_IDLE_MS);
    });

    document.addEventListener("visibilitychange", () => {
      const video = this.centerVideo();
      if (document.hidden) video.pause();
      else video.play().catch(() => {});
    });
  }

  /** Clone the template POOL_SIZE times, insert in one fragment. */
  createSlides() {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < POOL_SIZE; i++) {
      const slide = this.template.content.firstElementChild.cloneNode(true);
      this.slides.push(slide);
      fragment.append(slide);
    }
    this.container.append(fragment);
  }

  /** @returns {HTMLVideoElement} the video currently on screen */
  centerVideo() {
    return this.slides[CENTER].querySelector("video");
  }

  /**
   * Walk the ring from the cursor. Negative goes back, positive forward.
   * @param {number} offset
   */
  nodeAt(offset) {
    const step = offset < 0 ? "prev" : "next";
    let node = this.list.current;
    for (let i = 0; i < Math.abs(offset); i++) node = node[step];
    return node;
  }

  /** Bind every slide to its node. Unchanged slides are skipped in bindSlide. */
  render() {
    this.slides.forEach((slide, i) => {
      this.bindSlide(slide, this.nodeAt(i - CENTER).value);
    });
    this.applyPreload();
  }

  /**
   * @param {HTMLElement} slide
   * @param {string} src
   */
  bindSlide(slide, src) {
    const video = slide.querySelector("video");
    if (video.dataset.src === src) return;

    video.pause();
    video.removeAttribute("src");
    video.load();
    video.src = src;
    video.dataset.src = src;
    video.muted = this.muted;

    slide.querySelector("[data-meta]").textContent = src.split("/").pop();
  }

  /**
   * Download only what is close to the centre. Raising preload from "none"
   * is what starts the fetch; slides beyond the radius stay at zero traffic.
   */
  applyPreload() {
    this.slides.forEach((slide, i) => {
      const near = Math.abs(i - CENTER) <= this.preloadRadius;
      const video = slide.querySelector("video");
      const value = near ? "auto" : "none";
      if (video.preload !== value) video.preload = value;
    });
  }

  onScrollEnd() {
    const slot = Math.round(
      this.container.scrollTop / this.container.clientHeight,
    );
    if (slot === CENTER) return;

    const forward = slot > CENTER;
    const steps = Math.abs(slot - CENTER);

    // One step per slide passed, so a fast swipe over several slides recovers
    // in a single pass. Moving a node re-parents it — no copy is made.
    for (let i = 0; i < steps; i++) {
      forward ? this.list.next() : this.list.prev();
      const recycled = forward ? this.slides.shift() : this.slides.pop();

      if (forward) {
        this.slides.push(recycled);
        this.container.append(recycled);
      } else {
        this.slides.unshift(recycled);
        this.container.prepend(recycled);
      }
    }

    this.render();
    this.center();
  }

  /** Put the centre slide back on screen, without animation. */
  center() {
    this.container.scrollTop = CENTER * this.container.clientHeight;
  }

  /** The visible slide plays; the off-screen ones pause and rewind. */
  observePlayback() {
    this.observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            video.play().catch((e) => {
              console.warn({ autoplay_error: e });
            });
          } else {
            video.pause();
            video.currentTime = 0;
          }
        }),
      { root: this.container, threshold: 0.6 },
    );

    this.slides.forEach((slide) =>
      this.observer.observe(slide.querySelector("video")),
    );
  }

  setMuted(muted) {
    this.muted = muted;
    this.slides.forEach(
      (slide) => (slide.querySelector("video").muted = muted),
    );
  }
}
