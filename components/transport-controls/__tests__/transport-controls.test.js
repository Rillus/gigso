// transport-controls.test.js
import '@testing-library/jest-dom';
import { screen, render } from '@testing-library/dom';
import TransportControls from '../transport-controls.js';

describe('TransportControls Component', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    test('should render transport controls with play, stop, and loop buttons', () => {
        // Arrange
        const transportControls = new TransportControls();

        // Act
        document.body.appendChild(transportControls);

        // Assert
        expect(document.querySelector('play-button')).toBeInTheDocument();
        expect(document.querySelector('stop-button')).toBeInTheDocument();
        expect(document.querySelector('loop-button')).toBeInTheDocument();
    });

    test('should have correct styles applied', () => {
        // Arrange
        const transportControls = new TransportControls();

        // Act
        document.body.appendChild(transportControls);

        // Assert
        const container = screen.getByTestId('transport-controls');
        expect(container).toHaveStyle('display: flex');
        expect(container).toHaveStyle('align-items: center');
        expect(container).toHaveStyle('justify-content: center');
    });
});