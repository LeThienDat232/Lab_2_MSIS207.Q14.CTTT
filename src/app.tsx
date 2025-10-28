/** @jsx createElement */
import { createElement, useState } from './jsx-runtime';
import { Button } from './Button';
import { Counter } from './counter';
import { TodoApp } from './todo-app';
import { Dashboard } from './dashboard';

type Page = 'home' | 'ex1-btn' | 'ex1-ctr' | 'ex2' | 'ex4';

export const App = () => {
  const [getPage, setPage] = useState<Page>('ex4'); // default to dashboard

  const Nav = () => (
    <nav className="buttons" style={{margin:'14px 0'}}>
      <button onClick={() => setPage('ex1-btn')}>Ex1 • Button</button>
      <button onClick={() => setPage('ex1-ctr')}>Ex1 • Counter</button>
      <button onClick={() => setPage('ex2')}>Ex2 • Todo</button>
      <button className="primary" onClick={() => setPage('ex4')}>Ex4 • Dashboard</button>
    </nav>
  );

  return (
    <div className="grid">
      <div className="card">
        <div className="card-title">Exercises</div>
        <div className="card-body">
          <div className="muted" style={{marginBottom:8}}>
            Click to switch. This is client-side with your custom JSX runtime.
          </div>
          <Nav />
        </div>
      </div>

      <div className="card">
        <div className="card-title">Preview</div>
        <div className="card-body">
          {getPage() === 'ex1-btn' && <Button />}
          {getPage() === 'ex1-ctr' && <Counter />}
          {getPage() === 'ex2' && <TodoApp />}
          {getPage() === 'ex4' && <Dashboard />}
        </div>
      </div>

      <div className="footer">© {new Date().getFullYear()} Lab 2 — UIT</div>
    </div>
  );
};
