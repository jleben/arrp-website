import {Router} from '@vaadin/router'

export class RouterView extends HTMLElement {

  constructor() {
    super();

    let shadow = this.attachShadow({ mode: 'open' });

    this.router = new Router(shadow);
    this.routeTimer = null;
  }

  setRoutes(routes) {
    this.router.setRoutes(routes);
  }

  requestUpdateRoutesFromChildren() {
    if (this.routeTimer) {
      return;
    }

    this.routeTimer = setTimeout(() => this.updateRoutesFromChildren());
  }

  updateRoutesFromChildren() {
    this.routeTimer = null;

    let routes = [];

    for (let child of this.childNodes) {
      if (child instanceof Route) {
        routes.push({
          path: child.getAttribute('path'),
          component: child.getAttribute('component')
        });
      }
    }

    this.router.setRoutes(routes);
  }
}

export class Route extends HTMLElement {


    connectedCallback() { this.requestRouteUpdate();  }
    disconnectedCallback() { this.requestRouteUpdate();  }
    attributeChangedCallback() { this.requestRouteUpdate(); }

    requestRouteUpdate() {
      const view = this.parentElement;
      if (view && view instanceof RouterView)
      {
          view.requestUpdateRoutesFromChildren();
      }
    }
}

customElements.define('router-view', RouterView);
customElements.define('router-route', Route);
