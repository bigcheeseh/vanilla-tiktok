import { LinkedVideoList } from './LinkedVideoList.js';

/**
 * Binds the list to three recycled DOM slides.
 *
 * The three <video> elements are created once and never replaced: each one is
 * a decoder, and mobile browsers cap how many can exist. After a snap settles,
 * the cursor moves, the slides are rebound to (prev, current, next) and the
 * container is silently scrolled back to the middle slide.
 */
export class Feed {
  /**
   * @param {HTMLElement} container [data-feed]
   * @param {LinkedVideoList} list
   * @param {import('./VideoSource.js').VideoSource} source
   */
  constructor(container, list, source) {
    this.container = container;
    this.list = list;
    this.source = source;
    this.slides = [...container.querySelectorAll('[data-slide]')];
    this.muted = true;
  }

  async start() {
    throw new Error('not implemented');
  }

  /** Write (prev, current, next) into the three slides. */
  render() {
    throw new Error('not implemented');
  }

  /**
   * Play the middle slide, pause and rewind the other two.
   * Autoplay only works while muted, and play() rejects when the browser
   * blocks it — the rejection must be caught.
   */
  updatePlayback() {
    throw new Error('not implemented');
  }

  setMuted(muted) {
    throw new Error('not implemented');
  }
}
