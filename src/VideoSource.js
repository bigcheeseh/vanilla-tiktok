/**
 * Paginated video source.
 *
 * Abstract because the mock source used now will be swapped for a backend
 * endpoint later, and nothing else in the app should change when it is.
 */
export class VideoSource {
  constructor() {
    if (new.target === VideoSource) {
      throw new Error('VideoSource is abstract');
    }
  }

  /**
   * Fetch the next page. Returns an empty array when exhausted.
   * @param {number} limit
   * @returns {Promise<Array<{src: string, author?: string, description?: string}>>}
   */
  async fetchNext(limit) {
    throw new Error('not implemented');
  }
}

/** Reads a static list from videos.json. */
export class MockVideoSource extends VideoSource {
  constructor(url) {
    super();
    this.url = url;
    this.cursor = 0;
  }

  async fetchNext(limit) {
    throw new Error('not implemented');
  }
}
