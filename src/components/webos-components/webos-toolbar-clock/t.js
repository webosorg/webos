// Extend Polymer.Element base class
class Clock extends Polymer.Element {

  static get is() { return 'webos-toolbar-clock' }

  static get config() {
    // properties, observers meta data
    return {};
  }

  connectedCallback() {
    super.connectedCallback();
    console.log('Log ::: Component created ::: <webos-toolbar-clock>');
  }

}

// Register custom element definition using standard platform API
customElements.define(Clock.is, Clock);
