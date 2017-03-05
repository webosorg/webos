// Extend Polymer.Element base class
class X extends Polymer.Element {

  static get is() { return 'webos-x' }

  static get config() {
    // properties, observers meta data
    return {};
  }

  connectedCallback() {
    super.connectedCallback();
    this._installListeners();
    this.appsList = this.$.appLists;
    console.log('Log ::: Component created ::: <webos-x>');
  }

  _installListeners() {
    // optimize this case
    this.addEventListener('mousemove', this._toggleAppsListVisibility.bind(this));
  }

  _toggleAppsListVisibility(e) {
    let height = window.innerHeight;
    // let halfWindowWidth = window.innerWidth / 2;
    let y = e.y;
    let x = e.x;
    if (height - y < 70/* && (x > halfWindowWidth - 120 && x < halfWindowWidth + 120)*/) {
      this.appsList.style.visibility = 'visible';
    } else {
      this.appsList.style.visibility = 'hidden';
    }
  }
}

// Register custom element definition using standard platform API
customElements.define(X.is, X);
