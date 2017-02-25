// Extend Polymer.Element base class
class X extends Polymer.Element {

  static get is() { return 'webos-x' }

  static get config() {
    // properties, observers meta data
    return {};
  }

  connectedCallback() {
    super.connectedCallback();
    console.log('Log ::: Component created ::: <webos-x>');
  }

}

// Register custom element definition using standard platform API
customElements.define(X.is, X);
