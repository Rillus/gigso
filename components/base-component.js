export default class BaseComponent extends HTMLElement {
  constructor(template, styles, isolatedStyles = true) {
      super();
      if (isolatedStyles) {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>${styles}</style>
            ${template}
        `;
      } else {
        this.innerHTML = `
            <style>${styles}</style>
            ${template}
        `;
      }
  }

  addEventListeners(eventListeners) {
      eventListeners.forEach(({ selector, event, handler }) => {
        if(selector !== null) {
          if (this.isolatedStyles) {
            const element = this.shadowRoot.querySelector(selector);
            if (element) {
                element.addEventListener(event, handler);
            }
          } else {
            const element = this.querySelector(selector);
            if (element) {
                element.addEventListener(event, handler);
            }
          }
        } else {
          this.addEventListener(event, handler);
        }
      });
  }

  dispatchComponentEvent(selector, eventName, eventDetails) {
    if(selector !== null) {
      const eleRef = document.querySelector(selector);
      if (eleRef) {
          eleRef.dispatchEvent(new CustomEvent(eventName, { detail: eventDetails }));
      } else {
          console.warn('Element not found', selector, 'when triggering event', eventName);
      }
    } else {
      this.dispatchEvent(new CustomEvent(eventName, { detail: eventDetails }));
    }
  }
}