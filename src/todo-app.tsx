/** @jsx createElement */
import { createElement, useState } from './jsx-runtime';

// Types
interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: number;
}

interface TodoItemProps {
  key?: any; // allow 'key' in TS to avoid complaints in map()
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

// TodoItem
const TodoItem = ({ todo, onToggle, onDelete }: TodoItemProps) => {
  const itemClass = 'item' + (todo.completed ? ' completed' : '');
  return (
    <div className={itemClass}>
      <input type="checkbox" checked={todo.completed} onChange={() => onToggle(todo.id)} />
      <span className="text">{todo.text}</span>
      <button onClick={() => onDelete(todo.id)}>Delete</button>
    </div>
  );
};

// AddTodoForm
interface AddTodoFormProps {
  onAdd: (text: string) => void;
}

const AddTodoForm = ({ onAdd }: AddTodoFormProps) => {
  const [getText, setText] = useState<string>('');

  // Keep the input focused (and caret at end) after EVERY re-render (fixes 1-char issue)
  const focusRef = (el: HTMLInputElement | null) => {
    if (!el) return;
    requestAnimationFrame(() => {
      const pos = el.value.length;
      el.focus();
      try { el.setSelectionRange(pos, pos); } catch {}
    });
  };

  // Stop the submit button from stealing focus on mousedown
  const preventButtonFocus = (e: any) => e.preventDefault();

  const submit = (e: any) => {
    e.preventDefault();
    const t = getText().trim();
    if (!t) return;
    onAdd(t);
    setText(''); // next render re-focuses input via ref
  };

  return (
    <form onSubmit={submit}>
      <input
        ref={focusRef}
        type="text"
        placeholder="Add a todo..."
        value={getText()}
        onInput={(e: any) => setText(e.target.value)}  // every keystroke
        name="todo"
      />
      <button type="submit" onMouseDown={preventButtonFocus}>Add</button>
    </form>
  );
};

// TodoApp
const TodoApp = () => {
  const [getTodos, setTodos] = useState<Todo[]>([]);

  const addTodo = (text: string) => {
    const now = Date.now();
    const newTodo: Todo = { id: now, text, completed: false, createdAt: now };
    setTodos([newTodo, ...getTodos()]);
  };

  const toggleTodo = (id: number) => {
    setTodos(getTodos().map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTodo = (id: number) => {
    setTodos(getTodos().filter(t => t.id !== id));
  };

  const total = getTodos().length;
  const completed = getTodos().filter(t => t.completed).length;

  return (
    <section className="todo">
      <header>Todo List</header>
      <AddTodoForm onAdd={addTodo} />
      <div>
        {getTodos().map(t => (
          <TodoItem key={t.id} todo={t} onToggle={toggleTodo} onDelete={deleteTodo} />
        ))}
      </div>
      <div className="muted">Total: {String(total)} | Completed: {String(completed)}</div>
    </section>
  );
};

export { TodoApp };



