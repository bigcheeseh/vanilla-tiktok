export class LinkedVideoList {
  constructor() {
    /** @type {VideoNode|null} */
    this.head = null;
    /** @type {VideoNode|null} */
    this.tail = null;
    /** @type {VideoNode|null} cursor */
    this.current = null;
    this.size = 0;
  }

  /**
   * Append a fetched page to the tail.
   * @param {Array<{src: string, author?: string, description?: string}>} items
   */
  append(items) {
    if (!items?.length) {
      console.warn("empty video list, list should contain at least one video");
      return;
    }

    this.size = items.length;
    items.forEach((item, i) => {
      const videoNode = new VideoNode(item.src);
      if (this.tail) {
        videoNode.prev = this.tail;
        this.tail.next = videoNode;
      }

      if (!this.head) {
        this.head = videoNode;
      }

      if (!this.current) {
        this.current = videoNode;
      }

      this.tail = videoNode;
      this.tail.next = this.head;
      this.head.prev = this.tail;
    });

    return this;
  }

  /**
   * Move the cursor forward.
   * @returns {VideoNode|null}
   */
  next() {
    if (!this.size) return;

    const next = this.current.next;
    this.current = next;
    return this.current;
  }

  /**
   * Move the cursor backward.
   * @returns {VideoNode|null}
   */
  prev() {
    if (!this.size) return;

    const prev = this.current.prev;
    this.current = prev;
    return this.current;
  }

  init() {
    this.head = null;
    this.tail = null;
    this.current = null;
    this.size = 0;
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
