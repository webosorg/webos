/**
 * Module for make worker source.
 * @module libs/workerSource.maker
 * @see module:core/process
 */

/** Class representing a worker source maker. */

export default class MakeWorkerSource {
  /**
   * Check options and call 'workerSource' method.
   * @param { object } options - Options for worker body. Can contain worker dependency and fn.
   */

  constructor(options) {
    this.options = options;
    if (options.deps) {
      this.deps = options.deps.join(',');
    } else {
      this.deps = '';
    }

    this.deps = "\'" + this.deps + "\'";
    this.workerSource();
  }

  /**
   * Make worker source.
   * @return { Function }
   */

  workerSource() {
    // TODO ::: Optimize this case
    return Function(
      `
      importScripts(${this.deps});
      let fn = ${this.options.fn};
      fn();
      `
    );
  }
}