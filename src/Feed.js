import { LinkedVideoList } from "./LinkedVideoList.js";

const POOL_SIZE = 5;
const CENTER = Math.floor(POOL_SIZE / 2);

/** Pool size buys scroll headroom; this buys buffering. Outer slides cost no traffic. */
const PRELOAD_RADIUS = 1;

/** `scrollend` is missing in Safari < 18. */
const SCROLL_IDLE_MS = 120;

export class Feed {
  /**
   * @param {HTMLElement} container
   * @param {HTMLTemplateElement} template
   * @param {LinkedVideoList} list
   */
  constructor(container, template, list) {
    this.container = container;
    this.template = template;
    this.list = list;
    this.slides = [];
    this.muted = true;
    this.scrollTimer = null;
    this.preloadRadius = 0;
  }

  start() {
    this.createSlides();
    this.render();
    this.observePlayback();
    this.center();

    // Neighbours wait so the first video gets the whole connection.
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

  createSlides() {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < POOL_SIZE; i++) {
      const slide = this.template.content.firstElementChild.cloneNode(true);
      this.slides.push(slide);
      fragment.append(slide);
    }
    this.container.append(fragment);
  }

  centerVideo() {
    return this.slides[CENTER].querySelector("video");
  }

  nodeAt(offset) {
    const step = offset < 0 ? "prev" : "next";
    let node = this.list.current;
    for (let i = 0; i < Math.abs(offset); i++) node = node[step];
    return node;
  }

  render() {
    this.slides.forEach((slide, i) => {
      this.bindSlide(slide, this.nodeAt(i - CENTER).value);
    });
    this.applyPreload();
  }

  bindSlide(slide, src) {
    const video = slide.querySelector("video");
    if (video.dataset.src === src) return;

    video.pause();
    video.removeAttribute("src");
    video.load();              // releases the old buffer
    video.src = src;
    video.dataset.src = src;
    video.muted = this.muted;

    slide.querySelector("[data-meta]").textContent = src.split("/").pop();
  }

  applyPreload() {
    this.slides.forEach((slide, i) => {
      const video = slide.querySelector("video");
      const value = Math.abs(i - CENTER) <= this.preloadRadius ? "auto" : "none";
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

  center() {
    this.container.scrollTop = CENTER * this.container.clientHeight;
  }

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
