// Extend Polymer.Element base class
class Toolbar extends Polymer.Element {

  static get is() { return 'webos-toolbar' }

  static get config() {
    // properties, observers meta data
    return {};
  }

  connectedCallback() {
    super.connectedCallback();
    console.log('Log ::: Component created ::: <webos-toolbar>');
  }

}

// Register custom element definition using standard platform API
customElements.define(Toolbar.is, Toolbar);
