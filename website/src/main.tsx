import { useEffect, useState, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

type User = { email: string; name: string };
type ApiResponse = { user: User | null };

async function api(path: string, options: RequestInit = {}): Promise<ApiResponse> {
  const response = await fetch(path, { headers: { 'content-type': 'application/json' }, ...options });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}

function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [mode, setMode] = useState('register');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { api('/api/auth/me').then(({ user }) => setUser(user)).catch(() => setUser(null)); }, []);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(''); setSaving(true);
    const form = new FormData(event.currentTarget);
    try {
      const data = await api(`/api/auth/${mode}`, { method: 'POST', body: JSON.stringify(Object.fromEntries(form)) });
      setUser(data.user);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Something went wrong.'); } finally { setSaving(false); }
  };
  const logout = async () => { await api('/api/auth/logout', { method: 'POST' }); setUser(null); setMode('login'); };

  if (user === undefined) return <main className="shell"><p className="loading">Loading…</p></main>;
  if (user) return <main className="shell"><section className="panel welcome"><p className="eyebrow">PLANETS</p><h1>Welcome, {user.name}.</h1><p>You’re signed in as <strong>{user.email}</strong>.</p><div className="orbit"><span>✦</span><span>●</span><span>✦</span></div><button className="secondary" onClick={logout}>Sign out</button></section></main>;

  const registering = mode === 'register';
  return <main className="shell"><section className="panel"><p className="eyebrow">PLANETS</p><h1>{registering ? 'Start exploring.' : 'Welcome back.'}</h1><p className="intro">{registering ? 'Create your account. Your email address will be your user ID.' : 'Sign in to your planet dashboard.'}</p>
    <form onSubmit={submit}>
      {registering && <label>Name<input name="name" autoComplete="name" minLength={2} maxLength={80} required placeholder="Your name" /></label>}
      <label>Email <span className="hint">(your user ID)</span><input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
      <label>Password<input name="password" type="password" autoComplete={registering ? 'new-password' : 'current-password'} minLength={8} required placeholder="At least 8 characters" /></label>
      {error && <p className="error" role="alert">{error}</p>}
      <button disabled={saving}>{saving ? 'Please wait…' : registering ? 'Create account' : 'Sign in'}</button>
    </form>
    <p className="switch">{registering ? 'Already have an account?' : 'New here?'} <button type="button" className="link" onClick={() => { setMode(registering ? 'login' : 'register'); setError(''); }}>{registering ? 'Sign in' : 'Create an account'}</button></p>
  </section></main>;
}

const root = document.getElementById('root');
if (!root) throw new Error('The root element is missing.');
createRoot(root).render(<App />);
