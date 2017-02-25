// Extend Polymer.Element base class
class Desktop extends Polymer.Element {

  static get is() { return 'webos-desktop' }

  static get config() {
    // properties, observers meta data
    return {};
  }

  connectedCallback() {
    super.connectedCallback();
    console.log('Log ::: Component created ::: <webos-desktop>');
  }

}

// Register custom element definition using standard platform API
customElements.define(Desktop.is, Desktop);
