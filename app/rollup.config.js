import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import html from '@rollup/plugin-html';
import smartAsset from "rollup-plugin-smart-asset"

export default {
  input: 'src/main.js',
  output: {
    dir: 'dist',
    entryFileNames: '[name]-[hash].js',
    chunkFileNames: '[name]-[hash].js',
    format: 'esm'
  },
  plugins: [
    smartAsset({
      url: 'copy',
      extensions: '.md-html',
      useHash: true
    }),
    svelte({
      customElement: true
    }),
    resolve({
      browser: true,
      dedupe: ['svelte']
    }),
    html({
      title: 'Arrp',
      publicPath: '/'
    })
  ]
};
