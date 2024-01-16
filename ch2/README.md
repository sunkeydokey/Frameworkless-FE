# Ch.02 렌더링

데이터의 표시는 어플리케이션의 중요한 기능이다. 데이터를 표시한다는 것은 요소를 화면 등의 출력 장치에 요소를 렌더링하는 것을 의미한다. W3C는 프로그래밍으로 요소를 렌더링하는 방식을 DOM으로 정의했는데, 이번 장에서는 프레임워크 없이 DOM을 효과적으로 제어하는 방법을 익히는 것을 목표로 한다.

## DOM (문서 객체 모델)

[DOM](https://developer.mozilla.org/ko/docs/Web/API/Document_Object_Model)은 웹 앱을 구성하는 요소를 조작할 수 있는 API이다. HTML 문서는 DOM 트리로 구성된다.

![DOM Tree](https://www.w3.org/TR/WD-DOM/table.gif)

이미지 출처: [https://www.w3.org/TR/WD-DOM/introduction.html](https://www.w3.org/TR/WD-DOM/introduction.html)

```HTML
<body>
  <button type="button" class="example-button">
    Select Me!
  </button>
  <script type="module" src="index.js"></script>
</body>
```

Node 메소드인 querySelector 등으로 DOM node를 선택해 다음과 같이 조작할 수 있다.

```javascript
const EXAMPLE = '.example-button';
const button = document.querySelector(EXAMPLE);
// 버튼 내부 텍스트 수정
button.innerText = 'DOM Selected';
// 스타일 속성 수정
button.style.backgroundColor = 'blue';
// 브라우저 이벤트 등록
button.addEventListener('click', () => {
  button.innerText = 'Clicked';
});
```

## 렌더링 성능 모니터링

DOM을 렌더링하는 모듈을 설계할 때는 가독성과 유지보수를 염두에 두어야 한다. 그만큼 중요한 것으로는 성능이다. 이번 절에서는 렌더링 엔진의 성능을 모니터링하는 도구들을 확인한다.

### 크롬 개발자 도구

크롬 브라우저 개발자 도구에서는 `Cmd/Ctrl + Shift + P` 커맨드를 통해 명령 메뉴들을 실행할 수 있다. `Show frame per seconds (FPS) meter` 메뉴를 선택하면 Frame Rate와 GPU가 사용하는 메모리양을 확인할 수 있다.

### stats.js

[stats.js](https://github.com/mrdoob/stats.js)는 렌더링 성능을 측정하는 간단한 라이브러리이다. 패키지를 설치하거나 북마크렛을 통해 자신의 프로젝트의 DOM에 추가하여 측성능 정 위젯을 표시할 수 있다.

### 직접 만들어보기

웹앱의 FPS를 측정하기 위해 [`requestAnimationFrame API`](https://developer.mozilla.org/ko/docs/Web/API/window/requestAnimationFrame)를 사용한다. requestAnimationFrame API를 통해 렌더링 사이클과 다음 사이클 사이의 시간을 추적하고 1초 동안 콜백의 호출 횟수를 측정하면 된다.

#### 먼저 위젯 요소를 할당할 변수, 시작 시점을 기록하는 변수, 프레임을 측정할 변수를 선언

```javascript
let panel;
let start = 0;
let frames = 0;
```

#### panel에 할당할 div를 생성하는 함수를 선언

```javascript
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
```

#### 1초동안 frames를 증가시킬 tick 함수를 선언

```javascript
const tick = () => {
  frames++;
  const now = window.performance.now();

  if (now >= fpsUtil.getStart() + 1000) {
    panel.innerText = frames;
    frames = 0;
    start = now;
  }

  window.requestAnimationFrame(tick);
};
```

#### 동작

```javascript
const init = (parent = document.querySelector('body')) => {
  panel = createDiv();

  window.requestAnimationFrame(() => {
    start = window.performance.now();
    parent.appendChild(panel);
    tick();
  });
};

init();
```

## 렌더링 함수

이번 절부터 순수 함수로 element를 DOM에 렌더링하는 다양한 방법을 분석한다. 순수 함수를 통해 렌더링한다는 것은 DOM Element가 앱의 상태에만 의존한다는 것을 뜻한다. 모든 예제 코드는 [TodoMVC](https://todomvc.com/) 템플릿을 사용한다.

### Code base

TodoMVC의 템플릿 HTML

```HTML
<html>
  <head>
    ...
  </head>
  <body>
    <section class="todoapp">
      <header class="header">
        <h1>todos</h1>
        <input
          class="new-todo"
          placeholder="What needs to be done?"
          autofocus
        />
      </header>
      <section class="main">
        <input id="toggle-all" class="toggle-all" type="checkbox" />
        <label for="toggle-all">Mark all as complete</label>
        <ul class="todo-list"></ul>
      </section>
      <footer class="footer">
        <span class="todo-count">1 Item Left</span>
        <ul class="filters">
          <li>
            <a href="#/">All</a>
          </li>
          <li>
            <a href="#/active">Active</a>
          </li>
          <li>
            <a href="#/completed">Completed</a>
          </li>
        </ul>
        <button class="clear-completed">Clear completed</button>
      </footer>
    </section>
    <script type="module" src="index.js"></script>
  </body>
</html>
```

렌더링할 데이터는 faker 라이브러리를 통해 생성한다.

```javascript
const { faker } = window;

const createElement = () => ({
  text: faker.random.words(2),
  completed: faker.random.boolean(),
});

const repeat = (elementFactory, number) => {
  const array = [];
  for (let index = 0; index < number; index++) {
    array.push(elementFactory());
  }
  return array;
};

export default () => {
  const howMany = faker.random.number(10);
  return repeat(createElement, howMany);
};
```

### 순수 함수 렌더링 - 첫 번째 예제

#### view.js

```javascript
const getTodoElement = (todo) => {
  const { text, completed } = todo;

  return `
  <li ${completed ? 'class="completed"' : ''}>
    <div class="view">
      <input 
        ${completed ? 'checked' : ''}
        class="toggle" 
        type="checkbox">
      <label>${text}</label>
      <button class="destroy"></button>
    </div>
    <input class="edit" value="${text}">
  </li>`;
};

const getTodoCount = (todos) => {
  const notCompleted = todos.filter((todo) => !todo.completed);

  const { length } = notCompleted;
  if (length === 1) {
    return '1 Item left';
  }

  return `${length} Items left`;
};

export default (targetElement, state) => {
  const { currentFilter, todos } = state;

  const element = targetElement.cloneNode(true);

  const list = element.querySelector('.todo-list');
  const counter = element.querySelector('.todo-count');
  const filters = element.querySelector('.filters');

  list.innerHTML = todos.map(getTodoElement).join('');
  counter.textContent = getTodoCount(todos);

  Array.from(filters.querySelectorAll('li a')).forEach((a) => {
    console.log(a.textContent);
    if (a.textContent === currentFilter) {
      a.classList.add('selected');
    } else {
      a.classList.remove('selected');
    }
  });

  return element;
};
```

첫 번째 view 함수는 타겟이 될 DOM Element를 인자로 받아 복제한다. 그 후 두 번째 매개변수인 state를 사용해 복제본을 업데이트한다.
실제 수정사항은 복제본에서만 업데이트되었다. 이렇게 분리된 DOM Element를 수정해 성능을 향상시킬 수 있다. 이제 controller를 만들어 실제 DOM에 커밋한다.

#### index.js (controller)

```javascript
const state = {
  todos: getTodos(),
  currentFilter: 'Active',
};

const main = document.querySelector('.todoapp');

window.requestAnimationFrame(() => {
  const newMain = view(main, state);
  main.replaceWith(newMain);
});
```

컨트롤러는 requestAnimationFrame을 기반으로 한다. 이 API의 콜백 내부에서 DOM을 조작하면 메인 스레드를 차단하지 않으며 이벤트 루프에서 repaint의 스케줄링 직전에 실행된다.

#### review

DOM 복제본을 통한 가상 노드 조작과 requestAnimationFrame API를 통해 충분한 성능의 렌더링 엔진이다. 다만 렌더링 성능 모니터링에서 성능 이전에 언급한 가독성과 유지보수에서는 문제가 있다.

1. **하나의 거대한 함수.** 한 개의 큰 함수가 여러 개의 DOM Element를 조작하고 있다. 추후 복잡해지기 쉽다.
2. **동일한 작업을 수행하는 여러 방법.** innerText를 통해 리스트를 생성하면, counter는 length만 사용하면 됨. filter는 classList를 관리하고있음.

세 기능을 관심사에 따라 작은 함수로 분리하고 일관성 문제를 해결할 수 있다.

### 순수 함수 렌더링 - 분리

```text
02
┣ view
┃ ┣ app.js
┃ ┣ counter.js
┃ ┣ filters.js
┃ ┗ todos.js
┣ getTodos.js
┣ index.html
┗ index.js
```

todos, counter, filter를 담당하는 함수들을 분리했다.

```javascript
// app.js
import todosView from './todos.js';
import counterView from './counter.js';
import filtersView from './filters.js';

export default (targetElement, state) => {
  const element = targetElement.cloneNode(true);

  const list = element.querySelector('.todo-list');
  const counter = element.querySelector('.todo-count');
  const filters = element.querySelector('.filters');

  list.replaceWith(todosView(list, state));
  counter.replaceWith(counterView(counter, state));
  filters.replaceWith(filtersView(filters, state));

  return element;
};
```

```javascript
const getTodoElement = (todo) => {
  const { text, completed } = todo;

  return `
      <li ${completed ? 'class="completed"' : ''}>
        <div class="view">
          <input 
            ${completed ? 'checked' : ''}
            class="toggle" 
            type="checkbox">
          <label>${text}</label>
          <button class="destroy"></button>
        </div>
        <input class="edit" value="${text}">
      </li>`;
};

export default (targetElement, { todos }) => {
  const newTodoList = targetElement.cloneNode(true);
  const todosElements = todos.map(getTodoElement).join('');
  newTodoList.innerHTML = todosElements;
  return newTodoList;
};
```

```javascript
const getTodoCount = (todos) => {
  const notCompleted = todos.filter((todo) => !todo.completed);

  const { length } = notCompleted;
  if (length === 1) {
    return '1 Item left';
  }

  return `${length} Items left`;
};

export default (targetElement, { todos }) => {
  const newCounter = targetElement.cloneNode(true);
  newCounter.textContent = getTodoCount(todos);
  return newCounter;
};
```

```javascript
export default (targetElement, { currentFilter }) => {
  const newCounter = targetElement.cloneNode(true);
  Array.from(newCounter.querySelectorAll('li a')).forEach((a) => {
    if (a.textContent === currentFilter) {
      a.classList.add('selected');
    } else {
      a.classList.remove('selected');
    }
  });
  return newCounter;
};
```

app.js 에서 기능에 따라 세 개의 개별 함수를 통해 렌더링을 한다. 추상화되면서 코드의 가독성이 좋아졌다. 이번 절의 코드들은 추후 작성할 컴포넌트 라이브러리의 베이스가 된다.

### 순수 함수 렌더링 - 컴포넌트 함수

위의 app.js에서는 DOM 수정을 위해 그에 맞는 함수를 수동으로 호출해야한다. 컴포넌트 기반 애플리케이션을 위해서는 컴포넌트 간의 상호작용에 선언적 방식이 필요하다. 그렇게 하면 시스템이 모든 부분을 자동으로 연결할 것이다.

이번 버전에서는 [HTML의 데이터 속성](https://developer.mozilla.org/ko/docs/Learn/HTML/Howto/Use_data_attributes)과 컴포넌트 레지스트리를 사용한다.

```text
03
 ┣ view
 ┃ ┣ app.js
 ┃ ┣ counter.js
 ┃ ┣ filters.js
 ┃ ┗ todos.js
 ┣ getTodos.js
 ┣ index.html
 ┣ index.js
 ┗ registry.js
```

```HTML
<body>
  <section class="todoapp">
    <header class="header">
      <h1>todos</h1>
      <input
        class="new-todo"
        placeholder="What needs to be done?"
        autofocus
      />
    </header>
    <section class="main">
      <input id="toggle-all" class="toggle-all" type="checkbox" />
      <label for="toggle-all">Mark all as complete</label>
      <ul class="todo-list" data-component="todos"></ul>
    </section>
    <footer class="footer">
      <span class="todo-count" data-component="counter" >1 Item Left</span>
      <ul class="filters" data-component="filters">
        <li>
          <a href="#/">All</a>
        </li>
        <li>
          <a href="#/active">Active</a>
        </li>
        <li>
          <a href="#/completed">Completed</a>
        </li>
      </ul>
      <button class="clear-completed">Clear completed</button>
    </footer>
  </section>
  <script type="module" src="index.js"></script>
</body>
```

컴포넌트의 이름을 data-component 어트리뷰트에 넣어주었다.

```javascript
const registry = {};

const renderWrapper = (component) => {
  return (targetElement, state) => {
    const element = component(targetElement, state);

    const childComponents = element.querySelectorAll('[data-component]');

    Array.from(childComponents).forEach((target) => {
      const name = target.dataset.component;

      const child = registry[name];
      if (!child) {
        return;
      }

      target.replaceWith(child(target, state));
    });

    return element;
  };
};

const add = (name, component) => {
  registry[name] = renderWrapper(component);
};

const renderRoot = (root, state) => {
  const cloneComponent = (root) => {
    return root.cloneNode(true);
  };

  return renderWrapper(cloneComponent)(root, state);
};

export default {
  add,
  renderRoot,
};
```

- renderWrapper 함수는 data-component 속성의 value를 통해 동일 시그니처의 컴포넌트를 반환한다.
- add 함수는 registry에 컴포넌트를 추가해준다. 이를 통해 재사용되는 로직으로 추후 개발될 컴포넌트들의 상호작용을 쉽게 연결, 확장할 수 있다.
- renderRoot 함수는 최초 렌더링 시에 앱의 root DOM을 렌더링한다.

이 로직들을 index.js 에서 혼합해준다.

```javascript
import getTodos from './getTodos.js';
import todosView from './view/todos.js';
import counterView from './view/counter.js';
import filtersView from './view/filters.js';

import registry from './registry.js';

registry.add('todos', todosView);
registry.add('counter', counterView);
registry.add('filters', filtersView);

const state = {
  todos: getTodos(),
  currentFilter: 'All',
};

window.requestAnimationFrame(() => {
  const main = document.querySelector('.todoapp');
  const newMain = registry.renderRoot(main, state);
  main.replaceWith(newMain);
});
```

## 동적 데이터 렌더링

이전까지는 정적인 데이터만을 사용해 초기 렌더링 코드를 작성했다. 실제 앱에서는 사용자나 시스템 이벤트에 의해 데이터가 변경된다. 이벤트 리스너는 다음 장에서 다루기 때문에 이번 장에서는 시간 경과에 따라 상태를 무작위로 변경한다.

```javascript
const render = () => {
  window.requestAnimationFrame(() => {
    const main = document.querySelector('.todoapp');
    const newMain = registry.renderRoot(main, state);
    main.replaceWith(newMain);
  });
};

window.setInterval(() => {
  state.todos = getTodos();
  render();
}, 5000);

render();
```

이전 예제에서의 render 부분을 5초마다 진행하도록 수정했다. 소규모 앱에서는 충분한 성능이지만 추후 프로젝트 규모가 커진다면 성능이 저하될 우려가 있다.

### Virtual DOM (가상 DOM)

리액트가 대세인 현재 가상 DOM은 설명이 필요하지 않을 정도로 유명하다. 이를 통해 위의 선언적 방식 렌더링 엔진의 성능을 향상시킬 수 있다. UI의 표현은 메모리에 유지하고 **'실제'** DOM과 동기화한다. 이로써 실제 DOM은 더 적은 작업을 수행하게 할 수 있다. 이 과정은 `reconciliation`이라고도 불린다.

가상 DOM 방식에서는 diff 알고리즘을 통해 실제 DOM을 업데이트된 복사본과 교체하는 가장 빠른 방법을 찾아낸다.

#### 간단한 가상 DOM 구현

이제부터는 이전의 replaceWith가 아닌 새로 생성할 간단한 diff 알고리즘 함수를 적용한다.

```javascript
//index.js
const render = () => {
  window.requestAnimationFrame(() => {
    const main = document.querySelector('.todoapp');
    const newMain = registry.renderRoot(main, state);
    applyDiff(document.body, main, newMain);
  });
};
```

```javascript
// applyDiff.js
const isNodeChanged = (node1, node2) => {
  const n1Attributes = node1.attributes;
  const n2Attributes = node2.attributes;
  if (n1Attributes.length !== n2Attributes.length) {
    // node의 attribute 개수가 다른 경우
    return true;
  }

  const differentAttribute = Array.from(n1Attributes).find((attribute) => {
    const { name } = attribute;
    const attribute1 = node1.getAttribute(name);
    const attribute2 = node2.getAttribute(name);

    // node의 attribyte가 하나 이상 변경된 경우
    return attribute1 !== attribute2;
  });

  if (differentAttribute) {
    return true;
  }

  if (
    node1.children.length === 0 &&
    node2.children.length === 0 &&
    // 두 노드가 자식 요소를 가지지 않는데
    node1.textContent !== node2.textContent
    // 내부의 text가 다른 경우
  ) {
    return true;
  }

  return false;
};

// applyDiff 함수는 현재 DOM 노드와 실제 DOM 노드, 새로운 가상 DOM 노드의 부모를 받는다.
const applyDiff = (parentNode, realNode, virtualNode) => {
  if (realNode && !virtualNode) {
    // 새 노드가 정의되지 않은 경우 실제 노드를 삭제한다.
    realNode.remove();
    return;
  }

  if (!realNode && virtualNode) {
    // 실제 노드가 정의되지 않았는데 가상 노드가 존재하는 경우 부모 노드에 추가한다.
    // index.js 기준으로 main 태그가 없으면 newMain이 body의 자식 요소로 추가될 것이다.
    parentNode.appendChild(virtualNode);
    return;
  }

  if (isNodeChanged(virtualNode, realNode)) {
    // 위의 두 조건문을 통과한 경우(두 노드가 모두 정의된 경우) 차이를 확인한다.
    // 차이가 있는 경우 가상 DOM을 실제 DOM에 적용한다.
    realNode.replaceWith(virtualNode);
    return;
  }

  // 위의 과정을 자식요소에도 반복한다.
  const realChildren = Array.from(realNode.children);
  const virtualChildren = Array.from(virtualNode.children);

  const max = Math.max(realChildren.length, virtualChildren.length);
  for (let i = 0; i < max; i++) {
    applyDiff(realNode, realChildren[i], virtualChildren[i]);
  }
};

export default applyDiff;
```

applyDiff 함수는 현재 DOM 노드와 실제 DOM 노드, 새로운 가상 DOM 노드의 부모를 받는다.

```javascript
if (realNode && !virtualNode) {
  realNode.remove();
  return;
}
```

실제 React에서 사용하는 diff 알고리즘과 로직도 성능도 차이가 있겠지만 꽤 간단한 diff 함수로 필요한 변경사항만 replace 하게 되었다.

## 정리

- 앱을 작성할 때 가독성, 유지가능성, 성능 등을 염두에 두어야한다.
- data 속성과 component registry 같은 방식으로 재사용성을 증대하고 확장에 알맞은 로직을 선언적으로 작성할 수 있음을 배웠다.
- 간단한 가상 DOM을 작성하며 리액트와 같은 라이브러리가 데이터 변경에 따라 화면을 새로 갈아 끼우면서도 성능을 유지할 수 있는지 이해할 수 있었다.
