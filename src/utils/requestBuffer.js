const recentlySubmittedForms = new WeakMap();

export function setupRequestBuffer() {
  document.addEventListener(
    'submit',
    (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;

      const previous = recentlySubmittedForms.get(form);
      if (previous && previous > Date.now()) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }

      recentlySubmittedForms.set(form, Date.now() + 650);
      const submitButtons = form.querySelectorAll(
        'button[type="submit"], button:not([type])'
      );

      submitButtons.forEach((button) => {
        if (button.disabled) return;
        button.disabled = true;
        button.setAttribute('aria-busy', 'true');
        button.dataset.requestBufferDisabled = 'true';
      });

      window.setTimeout(() => {
        submitButtons.forEach((button) => {
          if (button.dataset.requestBufferDisabled === 'true') {
            button.disabled = false;
            button.removeAttribute('aria-busy');
            delete button.dataset.requestBufferDisabled;
          }
        });
      }, 650);
    },
    true
  );
}
