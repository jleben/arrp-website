import {Router} from '@vaadin/router'

export class RouterView extends HTMLElement {
  constructor() {
    super();

    let shadow = this.attachShadow({ mode: 'open' });

    this.router = new Router(shadow);
  }

  setRoutes(routes) {
    this.router.setRoutes(routes);
  }
}

customElements.define('router-view', RouterView);
