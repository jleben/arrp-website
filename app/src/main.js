import {Router} from '@vaadin/router'
import {fetchHtmlAction} from './router/router.js'

import home_page from '../build/home.md-html'
import './root.svelte'
import './play/play.svelte'
import './doc/doc_v1_0_0.svelte'
import doc_v1_index from '../build/doc/v1.0.0/index.md-html'

const router = new Router(document.body);

router.setRoutes([
  {
    path: '/',
    component: 'x-root',
    children: [
      { path: '/play', component: 'x-play' },
      { path: '/doc/v1.0.0', action: fetchHtmlAction(doc_v1_index) },
      { path: '(.*)', action : fetchHtmlAction(home_page) },
    ]
  }
])
