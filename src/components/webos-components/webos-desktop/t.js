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
  }

  openApp(options) {
    this.push('apps', options.app);
  }

  closeApp(options) {
    this.splice('apps', this.apps.indexOf(options.app), 1);
  }

}

// Register custom element definition using standard platform API
customElements.define(Desktop.is, Desktop);
