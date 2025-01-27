import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';
import '../gigso-menu.js'; // Import the component to ensure it's defined

describe('GigsoMenu Component', () => {
    let gigsoMenuElement;

    beforeEach(() => {
        // Create an instance of the component
        gigsoMenuElement = document.createElement('gigso-menu');
        document.body.appendChild(gigsoMenuElement);

        // Mock the target elements
        const targets = ['current-chord-display', 'gigso-keyboard', 'add-chord-form'];
        targets.forEach(target => {
            const element = document.createElement(target);
            element.id = target;
            element.style.display = 'block'; // Initially visible
            document.body.appendChild(element);
        });
    });

    afterEach(() => {
        // Clean up the DOM
        document.body.removeChild(gigsoMenuElement);
        document.querySelectorAll('#current-chord-display, #gigso-keyboard, #add-chord-form').forEach(element => {
            document.body.removeChild(element);
        });
    });

    test('should render all toggle buttons', () => {
        const buttons = gigsoMenuElement.shadowRoot.querySelectorAll('button');
        expect(buttons.length).toBe(3); // Ensure all buttons are rendered
    });

    test('should toggle display of target elements and update button class', () => {
        const buttons = gigsoMenuElement.shadowRoot.querySelectorAll('button');
        buttons.forEach(button => {
            const targetId = button.getAttribute('data-target');
            const targetElement = document.querySelector(targetId);

            // Initial state
            expect(targetElement.style.display).toBe('block');
            expect(button).toHaveClass('isOn');

            // Simulate button click
            button.click();

            // After first click
            expect(targetElement.style.display).toBe('none');
            expect(button).toHaveClass('isOff');

            // Simulate button click again
            button.click();

            // After second click
            expect(targetElement.style.display).toBe('block');
            expect(button).toHaveClass('isOn');
        });
    });
}); 