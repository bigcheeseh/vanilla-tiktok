export class LinkedVideoList {
  constructor() {
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
    this.clear()

    if (!items?.length) {
      console.warn("empty video list, list should contain at least one video");
      return;
    }

    this.size = items.length
    items.forEach((item, i) => {
      const videoNode = new VideoNode(item.src);
      if (this.tail) {
        videoNode.prev = this.tail;
      }

      const nextItem = items[i + 1];
      if (nextItem) {
        videoNode.next = new VideoNode(nextItem.src);
      }

      if (!this.head) {
        this.head = videoNode;
      }

      if (!this.current) {
        this.current = videoNode;
      }

      this.tail = videoNode;
    });
  }

  /**
   * Move the cursor forward/backward. Returns null at the ends.
   * @returns {VideoNode|null}
   */
  next() {
    const next = this.current.next;
    if (!next) {
      this.current = this.head;
      return this.current;
    }

    this.current = next;
    return this.current;
  }

  prev() {
    const prev = this.current.prev;
    if (!prev) {
      this.current = this.tail
      return this.current;
    }

    this.current = prev;
    return this.current;
  }


  init() {
    this.head = null;
    this.current = null;
    this.next = null;
    this.size = 0
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
