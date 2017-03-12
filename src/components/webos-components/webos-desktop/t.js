// Extend Polymer.Element base class
class Desktop extends Polymer.Element {

  static get is() { return 'webos-desktop' }

  static get config() {
    // properties, observers meta data
    return {};
  }

  static get properties() {
    return {
      apps: {
        type: Array,
        value: () => []
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this._installListeners();
    console.log('Log ::: Component created ::: <webos-desktop>');
  }

  _installListeners() {
    webOs.dispatcher.on('open:app', this.openApp, this);
    webOs.dispatcher.on('close:app', this.closeApp, this);
    webOs.dispatcher.on('ready:app', this.readyApp, this);
  }

  openApp(options) {
    let app = options.app;
    let link = document.createElement('link');
    link.rel = 'import';
    link.href = app.componentPath;
    document.head.append(link);
    this.push('apps', app);
  }

  readyApp(appName) {
    let currentElem = this.shadowRoot.querySelector('#' + appName);
    let currentBody = currentElem.shadowRoot.querySelector('#body');
    let currentApp = this.get('apps').find(app => { return app.name == appName });
    currentBody.append(document.createElement(currentApp.elemName));
  }

  closeApp(options) {
    this.splice('apps', this.apps.indexOf(options.app), 1);
  }
}

// Register custom element definition using standard platform API
customElements.define(Desktop.is, Desktop);
