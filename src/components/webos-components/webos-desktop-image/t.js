// Extend Polymer.Element base class
class Image extends Polymer.Element {

  static get is() { return 'webos-desktop-image' }

  static get config() {
    // properties, observers meta data
    return {};
  }

  connectedCallback() {
    super.connectedCallback();
    console.log('Log ::: Component created ::: <webos-desktop-image>');
  }

}

// Register custom element definition using standard platform API
customElements.define(Image.is, Image);
