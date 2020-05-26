import {RouterConfiguration, Router} from 'aurelia-router';
import {PLATFORM} from 'aurelia-pal';

export class DocIndex {
  router: Router;

  configureRouter(config: RouterConfiguration, router: Router): void {
    this.router = router;
    config.title = 'Arrp';
    config.options.pushState = true;
    config.options.root = '/';
    config.map([
      { route: '',                    name: 'toc',  moduleId: PLATFORM.moduleName('./toc')  },
      { route: 'compiler',            name: 'compiler',        moduleId: PLATFORM.moduleName('doc/compiler') },
      { route: 'syntax',              name: 'syntax',        moduleId: PLATFORM.moduleName('doc/syntax')},
    ]);
  }
}
