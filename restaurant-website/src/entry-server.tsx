import { renderToString } from 'react-dom/server';
import App from './App';

/* Used only at build time to pre-render the page to static HTML. */
export function render() {
  return renderToString(<App />);
}
