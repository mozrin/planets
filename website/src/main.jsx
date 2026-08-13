import { createRoot } from 'react-dom/client';
import './styles.css';

const docs = [
  { lang: 'English', href: '/docs/en/README.md' },
  { lang: 'ไทย', href: '/docs/th/README.md' }
];

function App() {
  return <main>
    <header><p className="eyebrow">MPD</p><h1>Mozrin's Planet Dashboard</h1><p>Explore your planets from one calm, mobile-first dashboard.</p></header>
    <section aria-labelledby="docs"><h2 id="docs">Documentation</h2><p>Choose your language:</p><div className="cards">{docs.map(({ lang, href }) => <a className="card" href={href} key={lang}>{lang} documentation <span>→</span></a>)}</div></section>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
