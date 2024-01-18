# Ch.03 DOM 이벤트 관리

이벤트는 무엇에 의해 생성되었는지와 관계 없이 DOM API에서 매우 중요한 부분이다. 이벤트를 통해 앱의 내용을 변경시킬 수 있기 때문이다. 이번 장에서는 DOM 이벤트 API와 이벤트 핸들러, 핸들러를 DOM Element에 올바르게 연결하는 방법을 알아본다.

## YAGNI 원칙 (You Are Not Gonna Need It.)

2장에서는 이벤트 없이 렌더링만을 담당하는 앱을 작성했다. 이는 당시에 직면한 문제만을 해결하고자 하는 저자의 철학이 담겨 있다. 본서에서는 이러한 원칙이 프레임워크 없는 프로젝트에서는 절대적으로 중요하다고 서술되어 있다.

## DOM 이벤트 API

이벤트란 웹 애플리케이션에서 발생하는 동작으로, 브라우저는 사용자에게 이를 알려주어 반응할 수 있게 한다.

대표적인 이벤트인 클릭 이벤트의 라이프사이클은 다음과 같다.

1. 버튼 렌더링
2. 버튼 클릭
3. 클릭 이벤트 전달
4. 클릭 이벤트 캡처
5. 클릭 이벤트에 반응

이벤트에 반응하기 위해서는 이벤트를 트리거한 DOM Element에 연결해야한다.

### attribute에 연결

이벤트 핸들러를 DOM Element에 연결하는 방법 중 가장 빠른 방법으로는 on[event name] attribute를 사용할 수 있다. 다만 attribute를 사용한 이벤트 핸들러 연결은 한 번에 하나만의 핸들러만 연결할 수 있다.

```javascript
const button = document.querySelector('button');
button.onclick = () => {
  doSomething();
};
```

### addEventListener로 핸들러 연결

이벤트를 처리하는 DOM 노드에 EventTarget 인터페이스를 구현할 수 있다. 인터페이스의 addEventListner 메소드는 DOM 노드에 핸들러를 추가한다.

```javascript
const button = document.querySelector('button');
button.addEventListener('click', () => {
  doSomething();
});
```

addEventListener의 첫 번째 매개변수는 이벤트 타입이다. 두 번째 매개변수는 콜백으로, 이벤트가 트리거되면 호출된다. 앞의 attribute를 통한 연결과 다르게 여러 개의 이벤트 핸들러를 연결할 수 있다.

DOM 요소가 사라져야 하는 경우 removeEventListener 메소드를 사용해 연결된 핸들러도 제거하는 것이 메모리 상 좋다. 다만 이 경우에 콜백으로 전달된 함수의 참조를 유지해야 한다.

```javascript
❌
const button = document.querySelector('button');
button.addEventListener('click', () => {
  doSomething();
});

button.removeEventListener('click', () => {
  doSomething();
});

✅
const button = document.querySelector('button');
const handler = () => doSomething();

button.addEventListener('click', handler);

button.removeEventListener('click', handler);
```

### 이벤트 객체

이벤트 핸들러는 DOM 노드나 시스템에서 생성된 이벤트를 나타내는 매개변수를 가질 수 있다.

```javascript
const button = document.querySelector('button');
button.addEventListener('click', (event) => {
  console.log(event);
});
```

전달된 event 객체는 이벤트가 발생한 포인트, 타입 등 다양한 정보를 포함하고 있다.

### DOM 이벤트 라이프사이클

DOM 이벤트의 라이프사이클은 다음과 같다.

1. **캡처 단계**: 이벤트가 html에서 Target Element 까지 이동한다.
2. **목표 단계**: 이벤트가 Target Element에 도달한다.
3. **버블 단계**: 이벤트가 Target Element에서 html로 이동한다.

이런 여러 단계가 존재하는 이유는, 브라우저 암흑 시기에 브라우저마다 캡처단계만 지원하거나 버블 단계만 지원하는 등 이벤트 핸들링 방식이 달랐기 때문이라고 한다. 현재는 일반적으로 버블 단계만 이용해도 관계 없으나 복잡한 상황을 관리해야할 경우를 염두에 두고 캡처 단계도 숙지해두도록 하자.

```javascript
const button = document.querySelector('button');
button.addEventListener('click', handler, false /* useCapture */);
```

addEventListener의 세 번째 매개변수로는 useCapture가 있고, default 는 false 이다. 선택적인 매개변수이지만 폭넓은 브라우저 호환성을 위해 넣어주는 것이 좋다고 한다. useCapture에 true를 전달하면 이벤트 트리거 시에 버블링 단계가 아닌 캡처링 단계에 핸들러를 호출한다.

### 사용자 정의 이벤트

DOM 이벤트 API는 커스텀 이벤트 타입을 정의하고 다른 이벤트처럼 처리할 수 있다.

```javascript
const CUSTOM_EVENT = 'CoolCustomEvent';
const input = document.querySelector('input');

input.addEventListener('input', () => {
  const { value } = input;
  console.log(value);

  if (value === CUSTOM_EVENT) {
    const customEvent = new CustomEvent(CUSTOM_EVENT, {
      detail: {
        cool: 'custom event',
      },
    });

    input.dispatchEvent(customEvent);
  }
});

input.addEventListener(CUSTOM_EVENT, ({ detail }) => {
  console.log('New Custom event: ', detail);
});
```

## Todo MVC에 적용하기

2장에서 렌더링엔진을 달아준 Todo 앱에 이벤트를 추가해본다. 관리해야할 이벤트들은 다음과 같다.

- Todo 생성
- Todo 수정
- Todo 삭제
- 하단 필터 변경
- Completed 체크박스 토글
- 모든 Todo에 Completed 토글
- Completed Todos 일괄 삭제

### CH02의 렌더링 엔진 리뷰

#### 문제점

2장에서 Todo Element 를 생성하는 함수는 문자열을 생성해 innerHTML을 통해 부모 노드에 추가한다. 하지만 문자열에는 이벤트 핸들러를 추가할 수 없기 때문에 addEventListener를 위해 DOM 노드를 만들어주어야 한다.

#### Template Element

DOM 노드를 생성하기 위해서 createElement API를 사용할 수 있다. 이를 통해 비어있는 새 DOM 노드를 생성하고 다양한 핸들러 등을 추가할 수 있으나, 코드는 점점 가독성과 유지 가능성을 잃어갈 것이다.

다른 옵션으로 html 파일의 template 태그 안에 Element들의 마크업을 유지하는 방법이 있다. template 태그는 렌더링 엔진의 스탬프로 사용할 수 있는 보이지 않는 태그이다.

```html
<template id="todo-item">
  <li>
    <div class="view">
      <input class="toggle" type="checkbox" />
      <label></label>
      <button class="destroy"></button>
    </div>
    <input class="edit" />
  </li>
</template>
```

todo-item template은 todo 구성요소애서 스탬프로 사용되어 새로운 li DOM 노드를 생성한다.

## 이벤트 위임

책에서는 li 요소에 이벤트를 위임하여 target node와 matches API를 통해 이벤트를 위임한다. 이벤트 위임을 통해 성능과 메모리 사용성을 개선시킬 수 있다.

## 정리

DOM 이벤트에 대해서 알아보았다. 순수한 html, css, js보다 리액트를 사용하며 onClick과 onChange 와 같은 속성에 익숙해져 있던 내게 브라우저 이벤트에 대해서 다시 한 번 깊게 생각할 수 있는 장이었다. 평소에는 잘 신경쓰지 않던 (당연히 중요하다는 것은 안다.) 버블링과 캡처링에 대해서 다시 한 번 짚고 넘어갔다. 그리고 버블링을 통해 matches API로 이벤트 위임을 하는 파트를 보며 새로운 스킬을 알게 된 점이 좋았다.
