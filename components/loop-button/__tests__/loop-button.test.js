import { fireEvent, getByRole } from '@testing-library/dom';
import '@testing-library/jest-dom';
import '../loop-button.js';


describe('LoopButton Component', () => {
    let loopButtonElement;

    beforeEach(() => {
        document.body.innerHTML = '<loop-button></loop-button>';
        loopButtonElement = document.querySelector('loop-button');
    });

    test('should render the loop button', () => {
        const button = getByRole(loopButtonElement, 'button');
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent('↻');
    });

    test('should dispatch "loop-clicked" event on click', () => {
        const button = getByRole(loopButtonElement, 'button');
        const loopClickedHandler = jest.fn();
        loopButtonElement.addEventListener('loop-clicked', loopClickedHandler);

        fireEvent.click(button);

        expect(loopClickedHandler).toHaveBeenCalledTimes(1);
    });

    test('should activate and deactivate the button', () => {
        const button = getByRole(loopButtonElement, 'button');

        loopButtonElement.activate();
        expect(button).toHaveClass('active');

        setTimeout(() => {
            expect(button).not.toHaveClass('active');
        }, 300);
    });
});
