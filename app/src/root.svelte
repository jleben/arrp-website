<svelte:options tag="x-root" />

<h1><a href='/'>Arrp</a></h1>
<a href='/doc/v1.0.0'>Documentation</a>
<a href='/play'>Playground</a>
<a href='/unknown'>Unknown</a>

<router-view id='router'>
  <router-route path='/' component='x-home'></router-route>
  <router-route path='/doc/v1.0.0' component='x-doc-1-0-0'></router-route>
  <router-route path='/play' component='x-play'></router-route>
  <router-route path='(.*)' component='x-home'></router-route>
</router-view>

<script>
import './router/router.js'
import './home.svelte'
import './doc/doc_v1_0_0.svelte'
import './play/play.svelte'
</script>
