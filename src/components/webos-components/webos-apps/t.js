// Extend Polymer.Element base class
class Apps extends Polymer.Element {

  static get is() { return 'webos-apps' }

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
    webOs.dispatcher.emit('ready:component:appList');
    console.log('Log ::: Component created ::: <webos-apps>');
  }

  _installListeners() {
    webOs.dispatcher.on('create:app', this.createApp, this);
  }

  createApp(options) {
    if (options.app) {
      this.push('apps', options.app);
    } else {
      throw new Error('With \'create:app\' event required \'app\'');
    }
  }
}

// Register custom element definition using standard platform API
customElements.define(Apps.is, Apps);
