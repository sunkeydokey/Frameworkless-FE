import getTodos from './getTodos.js';
import view from './view.js';

const state = {
  todos: getTodos(),
  currentFilter: 'Active',
};

const main = document.querySelector('.todoapp');

window.requestAnimationFrame(() => {
  const newMain = view(main, state);
  main.replaceWith(newMain);
});
