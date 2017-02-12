(function() {
  
  class PubSub {
    constructor() {
      this.handlers = [];
    }

    subscribe(event, handler, context) {
      if (typeof context === 'undefined') { context = handler; }
      this.handlers.push({ event: event, handler: handler.bind(context) });
    }

    publish(event, args) {
      this.handlers.forEach(topic => {
        if (topic.event === event) {
          topic.handler(args)
        }
      })
    }
  }

  let dispatcher = new PubSub;

  let localDocument = document.currentScript.ownerDocument;
  let tmpl = localDocument.querySelectorAll('template')[0];

  class Message extends HTMLElement {
    constructor() {
      super();
    }

    createdCallback() {
      dispatcher.subscribe('test', this.test);
      let root = this.createShadowRoot();
      root.appendChild(tmpl.content.cloneNode(true));
    }

    test() {
      console.log('publish-subscribe is working');
    }
  }

  new (document.registerElement('webos-message', Message));
}());