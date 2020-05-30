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
      if (!(child instanceof Route))
        continue;

      const path = child.getAttribute('path');
      if (!path)
        continue;

      if (child.getAttribute('component')) {
        routes.push({
          path: path,
          component: child.getAttribute('component')
        });
      }
      else if (child.getAttribute('url')) {
        console.log('a url route');
        this.addRouteForUrl(child.getAttribute('url'), path, routes);
      }
    }

    console.log('new routes:');
    console.log(routes);

    this.router.setRoutes(routes);
  }

  addRouteForUrl(url, path, routes) {
    let content;

    routes.push({
      path: path,
      action: (context, commands) => {
        console.log('content:');
        console.log(content);

        if (content)
          return content;

        return fetch(url)
          .then((response) => response.text())
          .then((text) => {
            console.log('parsing');
            let div1 = commands.component('div');
            let shadow = div1.attachShadow({ mode: 'open' });
            let div2 = document.createElement('div');
            div2.innerHTML = text;
            shadow.appendChild(div2);

            content = div1;
            return content;
          });
      }
    })
  }
}


function findRouteLocation(node) {
  let root = node.getRootNode();
  if (!(root instanceof ShadowRoot)) {
    console.log('no shadow root');
    return null;
  }

  let host = root.host;

  if (!host.location) {
    console.log('host has no location');
    return null;
  }

  return host.location;
}

export function setChildRoutes() {
  console.log('setChildRoutes');
  console.log(this.childSet);
  return [];
}

export class Route extends HTMLElement {

    constructor() { super(); console.log('Route: constructed.'); }

    connectedCallback() {

      console.log('Route: connected.');

      let location = findRouteLocation(this);
      if (!location) {
        console.error('Could not find parent route location.');
        return;
      }

      console.log('Route: installing.');

      let route = location.route;

      if (!route.childSet)
        route.childSet = new Set();

      this.set = route.childSet;
      this.set.add(this);

      /*
      route.children.push({
        path: this.getAttribute('path'),
        component: this.getAttribute('component')
      });*/
    }

    disconnectedCallback() {
      console.log('Route: disconnected.');
      if (this.set) {
        console.log('Route: removing.');
        this.set.remove(this)
      }
      this.set = null;
    }
}

export class RouterLink extends HTMLAnchorElement {

    connectedCallback() {
      this.location = findRouteLocation(this);
      console.log(`Link: location = ${this.location}`);
      this.updateHref();
    }

    disconnectedCallback() {
      this.location = null;
      this.updateHref();
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (name == 'go-to') {
          this.updateHref();
      }
    }

    updateHref()
    {
      if (this.location && this.getAttribute('go-to')) {
        let a = this.location.getUrl();
        let b = this.getAttribute('go-to');

        console.log(`Composing URL: '${a}' '${b}'`);

        let result;
        if (a.endsWith('/'))
          a = a.slice(0, -1);
        result = a+b

        console.log(`Link: setting href = ${result}`);
        this.setAttribute('href', result);
      } else {
        console.log('Link: clearing href.');
        this.setAttribute('href', null);
      }
    }
}

customElements.define('router-route', Route);
customElements.define('router-link', RouterLink, { extends: 'a' });

export function fetchHtmlAction(url) {

  let action = (context, commands) => {
    let promise =
      fetch(url)
      .then((response) => response.text())
      .then((text) => {
        console.log('parsing');
        let div1 = commands.component('div');
        let shadow = div1.attachShadow({ mode: 'open' });
        let div2 = document.createElement('div');
        div2.innerHTML = text;
        shadow.appendChild(div2);
        return div1;
      });

    context.route.action = () => { return promise; };

    return promise;
  }

  return action;
}
