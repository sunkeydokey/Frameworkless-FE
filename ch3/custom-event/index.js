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
