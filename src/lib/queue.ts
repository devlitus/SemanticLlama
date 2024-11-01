export class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private maxConcurrent: number;
  private currentConcurrent: number = 0;

  constructor(maxConcurrent = 2) {
    this.maxConcurrent = maxConcurrent;
  }

  async add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.currentConcurrent >= this.maxConcurrent) {
      return;
    }

    this.processing = true;

    while (
      this.queue.length > 0 &&
      this.currentConcurrent < this.maxConcurrent
    ) {
      const task = this.queue.shift();
      if (task) {
        this.currentConcurrent++;
        try {
          await task();
        } finally {
          this.currentConcurrent--;
        }
      }
    }

    this.processing = false;

    if (this.queue.length > 0) {
      this.processQueue();
    }
  }
}
