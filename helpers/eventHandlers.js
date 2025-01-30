export default class EventHandlers {
  static dispatchComponentEvent(selector, eventName, eventDetails) {
    const eleRef = document.querySelector(selector);
    if (eleRef) {
        eleRef.dispatchEvent(new CustomEvent(eventName, { detail: eventDetails }));
    } else {
        console.warn('Element not found', selector, 'when triggering event', eventName);
    }
  }

  static addEventListeners(eventListeners) {
    eventListeners.forEach(({ selector, event, handler }) => {
      if(selector !== null) {
        if(typeof selector === 'string') {
          const eleRef = document.querySelector(selector);
          if (eleRef) {
              eleRef.addEventListener(event, handler);
          }
        } else {
          selector.addEventListener(event, handler);
        }
      } else {
        this.addEventListener(event, handler);
      }
    });
  }
}