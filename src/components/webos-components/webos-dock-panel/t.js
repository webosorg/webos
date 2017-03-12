// Extend Polymer.Element base class
class DockPanel extends Polymer.Element {

  static get is() { return 'webos-dock-panel' }

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
    console.log('Log ::: Component created ::: <webos-dock-panel>');
  }

  _installListeners() {
    webOs.dispatcher.on('create:app:in:dock', this.createApp, this);
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
customElements.define(DockPanel.is, DockPanel);
