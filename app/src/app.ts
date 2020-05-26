import {RouterConfiguration, Router} from 'aurelia-router';
import {PLATFORM} from 'aurelia-pal';

export class App {
  router: Router;

  configureRouter(config: RouterConfiguration, router: Router): void {
    this.router = router;
    config.title = 'Arrp';
    config.options.pushState = true;
    config.options.root = '/';
    config.map([
      { route: '',                 name: 'home',        moduleId: PLATFORM.moduleName('home') },
      { route: 'doc',              name: 'docs',        moduleId: PLATFORM.moduleName('doc/index'), title: 'Arrp | Documentation' },
      //{ route: 'play',             name: 'playground',  moduleId: 'play/play', title: 'Arrp | Playground' },
    ]);
  }
}
