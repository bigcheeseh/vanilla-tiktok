import { LinkedVideoList } from "./LinkedVideoList.js";

/** only (prev + current + next) sources per render */
const POOL_SIZE = 3;

/** Idle time that means inertia has stopped. `scrollend` is missing in Safari < 18. */
const SCROLL_IDLE_MS = 120;

/**
 * Binds the list to a fixed pool of recycled DOM slides.
 *
 * The <video> elements are created once and never replaced: each one is a
 * decoder, and mobile browsers cap how many can exist. After a snap settles,
 * the cursor moves, the slides are rebound to (prev, current, next) and the
 * container is silently scrolled back to the middle slide.
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
  }

  start() {
    this.createSlides();
    this.render();
    this.observePlayback();
    this.center();

    this.container.addEventListener("scroll", () => {
      clearTimeout(this.scrollTimer);
      this.scrollTimer = setTimeout(() => this.onScrollEnd(), SCROLL_IDLE_MS);
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

  /** Write (prev, current, next) into the three slides. */
  render() {
    const current = this.list.current;
    this.bindSlide(this.slides[0], current.prev.value);
    this.bindSlide(this.slides[1], current.value);
    this.bindSlide(this.slides[2], current.next.value);
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
  }

  onScrollEnd() {
    const slot = Math.round(
      this.container.scrollTop / this.container.clientHeight,
    );
    if (slot === 1) return;

    const forward = slot === 2;
    forward ? this.list.next() : this.list.prev();

    // Move the off-screen slide to the other end and bind the new video to it.
    // Only that one slide is touched, so the video now on screen keeps playing.
    const recycled = forward ? this.slides.shift() : this.slides.pop();
    const current = this.list.current;

    if (forward) {
      this.slides.push(recycled);
      this.container.append(recycled);
      this.bindSlide(recycled, current.next.value);
    } else {
      this.slides.unshift(recycled);
      this.container.prepend(recycled);
      this.bindSlide(recycled, current.prev.value);
    }

    this.center();
  }

  /** Put the middle slide back on screen, without animation. */
  center() {
    this.container.scrollTop = this.container.clientHeight;
  }

  /** The visible slide plays; the two off-screen ones pause and rewind. */
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
