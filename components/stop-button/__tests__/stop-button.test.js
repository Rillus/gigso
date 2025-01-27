import { fireEvent, getByRole } from '@testing-library/dom';
import '@testing-library/jest-dom';
import '../stop-button.js';



describe('StopButton Component', () => {
    let stopButtonElement;

    beforeEach(() => {
        document.body.innerHTML = '<stop-button></stop-button>';
        stopButtonElement = document.querySelector('stop-button');
    });

    test('should render the stop button', () => {
        const button = getByRole(stopButtonElement, 'button');
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent('■');
    });

    test('should dispatch "stop-clicked" event on click', () => {
        const button = getByRole(stopButtonElement, 'button');
        const stopClickedHandler = jest.fn();
        stopButtonElement.addEventListener('stop-clicked', stopClickedHandler);

        fireEvent.click(button);

        expect(stopClickedHandler).toHaveBeenCalledTimes(1);
    });

    test('should activate and deactivate the button', () => {
        const button = getByRole(stopButtonElement, 'button');

        stopButtonElement.activate();
        expect(button).toHaveClass('active');

        setTimeout(() => {
            expect(button).not.toHaveClass('active');
        }, 300);
    });
});
