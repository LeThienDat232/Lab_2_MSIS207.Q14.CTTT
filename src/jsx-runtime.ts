// src/jsx-runtime.ts
export interface VNode {
  type: string | ComponentFunction | 'fragment';
  props: Record<string, any>;
  children: Array<VNode | string | number>;
}
export interface ComponentProps {
  children?: Array<VNode | string | number>;
  [key: string]: any;
}
export type ComponentFunction = (props: ComponentProps) => VNode | string | number;

let _hooks: any[] = [];
let _hookIndex = 0;
let _currentRoot: VNode | null = null;
let _currentContainer: HTMLElement | null = null;

// 5.2: batched rerenders
let _renderScheduled = false;
function _resetHookIndex() { _hookIndex = 0; }

// 5.2: event delegation
const _delegated = new Set<string>();
function _ensureDelegated(evt: string) {
  if (!_currentContainer || _delegated.has(evt)) return;
  _currentContainer.addEventListener(evt, (e: Event) => {
    let t = e.target as HTMLElement | null;
    while (t && t !== _currentContainer) {
      const map = (t as any).__handlers;
      const h = map?.[evt] as EventListener | undefined;
      if (h) { h.call(t, e); if ((e as any).cancelBubble) break; }
      t = t.parentElement;
    }
  });
  _delegated.add(evt);
}

function _scheduleRerender() {
  if (_renderScheduled) return;
  _renderScheduled = true;

  Promise.resolve().then(() => {
    _renderScheduled = false;
    if (!_currentRoot || !_currentContainer) return;

    // preserve focus/caret (now includes <select>)
    const focusables = 'input,textarea,select';
    const active = document.activeElement as HTMLElement | null;
    let idx = -1, start: number | null = null, end: number | null = null;

    if (active && (active.matches as any)?.call(active, focusables)) {
      const all = Array.from(document.querySelectorAll(focusables));
      idx = all.indexOf(active);
      try {
        if ('selectionStart' in active) {
          start = (active as any).selectionStart ?? null;
          end   = (active as any).selectionEnd ?? null;
        }
      } catch {}
    }

    _currentContainer.innerHTML = '';
    _resetHookIndex();
    _currentContainer.appendChild(renderToDOM(_currentRoot));

    if (idx >= 0) {
      const after = Array.from(_currentContainer.querySelectorAll(focusables));
      const next = after[idx] as any;
      if (next?.focus) {
        next.focus();
        try {
          if (start != null && end != null && 'setSelectionRange' in next) {
            next.setSelectionRange(start, end);
          }
        } catch {}
      }
    }
  });
}

// JSX factories
export function createElement(
  type: string | ComponentFunction,
  props: Record<string, any> | null,
  ...children: (VNode | string | number | null | undefined | boolean | Array<any>)[]
): VNode {
  const flat = (arr: any[]) => arr.flat(Infinity).filter(c => c !== null && c !== undefined && c !== false);
  const normChildren = flat(children) as Array<VNode | string | number>;
  const finalProps = { ...(props || {}), children: normChildren };
  return { type: type as any, props: finalProps, children: normChildren };
}

export function createFragment(
  props: Record<string, any> | null,
  ...children: (VNode | string | number)[]
): VNode {
  return createElement('fragment', props, ...children);
}

function camelToKebab(s: string) { return s.replace(/[A-Z]/g, m => '-' + m.toLowerCase()); }

// DOM rendering
export function renderToDOM(vnode: VNode | string | number): Node {
  if (typeof vnode === 'string' || typeof vnode === 'number') return document.createTextNode(String(vnode));

  if ((vnode as VNode).type === 'fragment') {
    const frag = document.createDocumentFragment();
    (vnode as VNode).children.forEach(ch => frag.appendChild(renderToDOM(ch as any)));
    return frag;
  }

  if (typeof (vnode as VNode).type === 'function') {
    const out = ((vnode as VNode).type as ComponentFunction)({ ...((vnode as VNode).props || {}), children: (vnode as VNode).children });
    return renderToDOM(out as any);
  }

  const el = document.createElement((vnode as VNode).type as string);
  const props = (vnode as VNode).props || {};
  let deferredSelectValue: string | null = null; // set after options exist

  for (const [key, value] of Object.entries(props)) {
    if (key === 'children' || key === 'key') continue;

    if (key === 'ref' && typeof value === 'function') { value(el); continue; }

    if (/^on[A-Z]/.test(key) && typeof value === 'function') {
      const evt = key.slice(2).toLowerCase();
      const delegate = evt === 'click' || evt === 'input' || evt === 'change';
      if (delegate) {
        (el as any).__handlers = (el as any).__handlers || {};
        (el as any).__handlers[evt] = value;
        _ensureDelegated(evt);
      } else {
        el.addEventListener(evt, value as EventListener);
      }
      continue;
    }

    if (key === 'className') { el.setAttribute('class', String(value)); continue; }

    if (key === 'style') {
      if (typeof value === 'string') {
        el.setAttribute('style', value);
      } else if (value && typeof value === 'object') {
        for (const [sk, sv] of Object.entries(value as Record<string, any>)) {
          if (sv == null) continue;
          (el as HTMLElement).style.setProperty(camelToKebab(sk), String(sv));
        }
      }
      continue;
    }

    if (key === 'value') {
      if (el instanceof HTMLSelectElement) {
        deferredSelectValue = value == null ? '' : String(value);
      } else if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        (el as any).value = value == null ? '' : String(value);
      } else {
        el.setAttribute('value', String(value));
      }
      continue;
    }

    if (key === 'checked' && el instanceof HTMLInputElement) { el.checked = !!value; continue; }

    if (typeof value === 'boolean') { if (value) el.setAttribute(key, ''); continue; }

    el.setAttribute(key, String(value));
  }

  (vnode as VNode).children.forEach(ch => el.appendChild(renderToDOM(ch as any)));

  if (deferredSelectValue !== null && el instanceof HTMLSelectElement) (el as any).value = deferredSelectValue;

  return el;
}

// Mount & tiny hook
export function mount(vnode: VNode, container: HTMLElement): void {
  _currentRoot = vnode;
  _currentContainer = container;
  container.innerHTML = '';
  _resetHookIndex();
  container.appendChild(renderToDOM(vnode));
}

export function useState<T>(
  initial: T | (() => T)
): [() => T, (next: T | ((prev: T) => T)) => void] {
  const idx = _hookIndex++;
  if (_hooks[idx] === undefined) {
    _hooks[idx] = typeof initial === 'function' ? (initial as any)() : initial;
  }
  const getter = () => _hooks[idx] as T;
  const setter = (arg: any) => {
    const next = typeof arg === 'function' ? arg(_hooks[idx]) : arg;
    _hooks[idx] = next;
    _scheduleRerender();
  };
  return [getter, setter];
}

