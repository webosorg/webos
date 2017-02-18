// Extend Polymer.Element base class
class Terminal extends Polymer.Element {

  static get is() { return 'webos-terminal' }

  static get config() {
    // properties, observers meta data
    return {};
  }

  connectedCallback() {
    super.connectedCallback();
  }

}

// Register custom element definition using standard platform API
customElements.define(Terminal.is, Terminal);
