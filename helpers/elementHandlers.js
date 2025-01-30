export default class ElementHandlers {
  constructor() {
    this.elements = [];
  }

  static addElement(element, parentElement) {
    try {
      const newElement = new element.tag();
      const eleRef = parentElement.appendChild(newElement);

      if (element.emittedEvents) {
        element.emittedEvents.forEach((emittedEvent) => {
          eleRef.addEventListener(emittedEvent.name, emittedEvent.function);
        });
      }
    } catch (error) {
      console.error(`Error creating element ${element.tag}:`, error);
    }
  }
}
