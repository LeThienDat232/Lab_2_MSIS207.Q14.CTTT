/** @jsx createElement */
import { createElement, mount } from './jsx-runtime';
import { Dashboard } from './dashboard';   // or: Button / Counter / TodoApp

const root = document.getElementById('app')!;
mount(<Dashboard />, root);
