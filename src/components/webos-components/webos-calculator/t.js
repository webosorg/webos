// Extend Polymer.Element base class
class Calculator extends Polymer.Element {

  static get is() { return 'webos-calculator' }

  static get config() {
    // properties, observers meta data
    return {};
  }

  connectedCallback() {
    super.connectedCallback();
    console.log('Log ::: Component created ::: <webos-calculator>');
  }

  handleTrack(e) {
    console.log(e);
  }

  close(e) {
    webOs.dispatcher.emit('close:app', {
      app: {
        name: this.appName
      }
    })
  }

}

// Register custom element definition using standard platform API
customElements.define(Calculator.is, Calculator);
