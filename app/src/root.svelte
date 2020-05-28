<svelte:options tag="x-root" />

<h1>Arrp</h1>
<a href='/doc/v1.0.0'>Documentation</a>
<a href='/play'>Playground</a>

<router-view id='router' bind:this={router}></router-view>

<script>
import './router/router.js'
import './home.svelte'
import './doc/doc_v1_0_0.svelte'
import './play/play.svelte'
import { onMount } from 'svelte';

let router;

onMount(() => {
  let routes = [
    {path: '/',     component: 'x-home'},
    {path: '/doc/v1.0.0',  component: 'x-doc-1-0-0'},
    {path: '/play', component: 'x-play'},
    {path: '(.*)', component: 'x-home'},
  ]

  router.setRoutes(routes);
})

</script>
