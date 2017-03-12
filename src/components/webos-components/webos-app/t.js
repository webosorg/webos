// Extend Polymer.Element base class
class App extends Polymer.Element {

  static get is() { return 'webos-app' }

  static get config() {
    // properties, observers meta data
    return {};
  }

  connectedCallback() {
    super.connectedCallback();
    this.appName = this.getAttribute('name') || 'unknown';
    let appIcon = this.getAttribute('icon') || '../../../webos-apps/images/default.png';
    this.$.appName.innerHTML = this.appName;
    this.$.appIcon.backgroundImage = 'url(\'\' + appIcon + \'\')';
    console.log('Log ::: Component created ::: <webos-app>');
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
customElements.define(App.is, App);
