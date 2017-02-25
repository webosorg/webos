// Extend Polymer.Element base class
class Apps extends Polymer.Element {

  static get is() { return 'webos-apps' }

  static get config() {
    // properties, observers meta data
    return {};
  }

  connectedCallback() {
    super.connectedCallback();
    console.log('Log ::: Component created ::: <webos-apps>');
  }

}

// Register custom element definition using standard platform API
customElements.define(Apps.is, Apps);
