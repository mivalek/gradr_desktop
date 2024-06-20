import './assets/main.css'

import { render } from 'solid-js/web'
import App from './App'
import { Route, Router } from '@solidjs/router'
import { Home } from './pages/Home'
import { Rubric } from './pages/Rubric'

render(
  () => (
    <Router root={App}>
      <Route path="/" component={Home} />
      <Route path="/rubric" component={Rubric} />
    </Router>
  ),
  document.getElementById('root') as HTMLElement
)
