<svelte:options tag="x-root" />

<div id='header'>
<h1><a href='/'>Arrp</a></h1>
<a href='/doc/v1.0.0'>Documentation</a>
<a href='/play'>Playground</a>
</div>

<slot></slot>

<style>
a {
  text-decoration: none;
  color: #ffffff;
}

#header {
  background-color: #000066;
  display: flex;
  flex-flow: row;
  justify-content: center;
}
</style>
