import './assets/main.css'

import { render } from 'solid-js/web'
import App from './App'
import { HashRouter, Route } from '@solidjs/router'
import { Home } from './pages/Home'
import { Rubric } from './pages/Rubric'

render(
  () => (
    <HashRouter root={App}>
      <Route path="home" component={Home} />
      <Route path="rubric" component={Rubric} />
    </HashRouter>
  ),
  document.getElementById('root') as HTMLElement
)
