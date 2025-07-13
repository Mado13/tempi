import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'

console.log('Safe area top:', getComputedStyle(document.documentElement).getPropertyValue('--safe-area-top'));

const app = mount(App, {
  target: document.getElementById('app'),
})

export default app
