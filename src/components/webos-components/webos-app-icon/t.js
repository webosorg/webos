// Extend Polymer.Element base class
class Icon extends Polymer.Element {

  static get is() { return 'webos-app-icon' }

  static get config() {
    // properties, observers meta data
    return {};
  }

  connectedCallback() {
    super.connectedCallback();
    let iconUrl = this.getAttribute('icon') ||
                  '../../../webos-apps/images/default.png'; // default;
    this.appName = this.getAttribute('name') || 'unknow';
    console.log(iconUrl, this.appName);
    this.$.appIcon.backgroundImage = 'url(\'\' + iconUrl + \'\')';
    this.$.appName.innerHTML = this.appName;
    console.log('Log ::: Component created ::: <webos-app-icon>');
  }

  touchApp() {
    webOs.dispatcher.emit('app:touch', {
      name: this.appName
    });
  }

}

// Register custom element definition using standard platform API
customElements.define(Icon.is, Icon);
