import {Router} from '@vaadin/router'
import {fetchHtmlAsset} from './router/router.js'

import home_page from '../build/home.md-html'
import './root.svelte'
import './play/play.svelte'
import './doc/doc_v1_0_0.svelte'
import doc_v1_index from '../build/doc/v1.0.0/index.md-html'
import doc_v1_compiler from '../build/doc/v1.0.0/compiler.md-html'
import doc_v1_target_cpp from '../build/doc/v1.0.0/target-cpp.md-html'

const router = new Router(document.body);

console.log(doc_v1_compiler)

router.setRoutes([
  {
    path: '/',
    component: 'x-root',
    children: [
      { path: '/play', component: 'x-play' },
      { path: '/doc/v1.0.0', action: fetchHtmlAsset(doc_v1_index) },
      { path: '/doc/v1.0.0/compiler', action: fetchHtmlAsset(doc_v1_compiler) },
      { path: '/doc/v1.0.0/target-cpp', action: fetchHtmlAsset(doc_v1_target_cpp) },
      { path: '(.*)', action : fetchHtmlAsset(home_page) },
    ]
  }
])
