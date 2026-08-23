/**
 * Doubly-linked list of videos with a cursor.
 *
 * The feed only ever needs the current video and its two neighbours, so
 * navigation is a pointer hop (O(1)) and appending a fetched page is O(1).
 * There is no index lookup: nothing on the client searches by position.
 *
 * Abstract — the concrete list is implemented on top of this contract.
 */
export class LinkedVideoList {
  constructor() {
    if (new.target === LinkedVideoList) {
      throw new Error('LinkedVideoList is abstract');
    }

    /** @type {VideoNode|null} */
    this.head = null;
    /** @type {VideoNode|null} */
    this.tail = null;
    /** @type {VideoNode|null} cursor: the video currently on screen */
    this.current = null;
    this.size = 0;
  }

  /**
   * Append a fetched page to the tail.
   * @param {Array<{src: string, author?: string, description?: string}>} items
   */
  append(items) {
    throw new Error('not implemented');
  }

  /**
   * Move the cursor forward/backward. Returns null at the ends.
   * @returns {VideoNode|null}
   */
  next() {
    throw new Error('not implemented');
  }

  prev() {
    throw new Error('not implemented');
  }

  /**
   * Drop nodes before the cursor, keeping at most `keep` of them.
   * Bounds memory over a long session; O(1) per removed node.
   * @param {number} keep
   */
  trimHistory(keep) {
    throw new Error('not implemented');
  }
}

export class VideoNode {
  constructor(value) {
    this.value = value;
    /** @type {VideoNode|null} */
    this.prev = null;
    /** @type {VideoNode|null} */
    this.next = null;
  }
}
