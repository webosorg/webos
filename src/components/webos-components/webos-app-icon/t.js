// Extend Polymer.Element base class
class Icon extends Polymer.Element {

  static get is() { return 'webos-app-icon' }

  static get config() {
    // properties, observers meta data
    return {};
  }

  connectedCallback() {
    super.connectedCallback();
    console.log('Log ::: Component created ::: <webos-app-icon>');
  }

}

// Register custom element definition using standard platform API
customElements.define(Icon.is, Icon);
