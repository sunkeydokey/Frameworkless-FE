let panel;
let start = 0;
let frames = 0;

const createDiv = () => {
  const div = document.createElement('div');

  div.style.position = 'fixed';
  div.style.top = '60px';
  div.style.width = '50px';
  div.style.height = '50px';
  div.style.backgroundColor = '#262626';
  div.style.color = 'white';

  return div;
};

const tick = () => {
  frames++;
  const now = window.performance.now();
  if (now >= start + 1000) {
    panel.innerText = frames;
    frames = 0;
    start = now;
  }
  console.log(start);
  window.requestAnimationFrame(tick);
};

const init = (parent = document.querySelector('main')) => {
  panel = createDiv();

  window.requestAnimationFrame(() => {
    start = window.performance.now();
    parent.appendChild(panel);
    tick();
  });
};

init();
