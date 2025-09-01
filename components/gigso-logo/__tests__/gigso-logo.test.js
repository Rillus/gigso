import '@testing-library/jest-dom';
import GigsoLogo from '../gigso-logo.js';

describe('GigsoLogo Component', () => {
    let logo;

    beforeEach(() => {
        document.body.innerHTML = '';
        logo = document.createElement('gigso-logo');
        document.body.appendChild(logo);
    });

    afterEach(() => {
        if (logo && logo.parentNode) {
            logo.parentNode.removeChild(logo);
        }
    });

    test('should render logo element', () => {
        const logoElement = logo.shadowRoot.querySelector('.logo');
        expect(logoElement).toBeTruthy();
    });

    test('should contain SVG with Gigso branding', () => {
        const svg = logo.shadowRoot.querySelector('svg');
        expect(svg).toBeTruthy();
        expect(svg.getAttribute('width')).toBe('362');
        expect(svg.getAttribute('height')).toBe('362');
    });

    test('should contain key visual elements', () => {
        const gigsoGroup = logo.shadowRoot.querySelector('#gigso');
        const spinner = logo.shadowRoot.querySelector('#spinner');
        const sunElement = logo.shadowRoot.querySelector('[inkscape\\:label="sun"]');
        
        expect(gigsoGroup).toBeTruthy();
        expect(spinner).toBeTruthy();
        expect(sunElement).toBeTruthy();
    });

    test('should handle spin start event', () => {
        logo.spinStart();
        const logoElement = logo.shadowRoot.querySelector('.logo');
        expect(logoElement.getAttribute('class')).toBe('logo spin');
    });

    test('should handle spin pause event', () => {
        logo.spinPause();
        const logoElement = logo.shadowRoot.querySelector('.logo');
        expect(logoElement.getAttribute('class')).toBe('logo pause');
    });

    test('should handle spin stop event', () => {
        logo.spinStop();
        const logoElement = logo.shadowRoot.querySelector('.logo');
        expect(logoElement.getAttribute('class')).toBe('logo stop');
    });

    test('should respond to custom events', () => {
        const logoElement = logo.shadowRoot.querySelector('.logo');
        
        // Test start event
        logo.dispatchEvent(new CustomEvent('start'));
        expect(logoElement.getAttribute('class')).toBe('logo spin');
        
        // Test pause event
        logo.dispatchEvent(new CustomEvent('pause'));
        expect(logoElement.getAttribute('class')).toBe('logo pause');
        
        // Test stop event
        logo.dispatchEvent(new CustomEvent('stop'));
        expect(logoElement.getAttribute('class')).toBe('logo stop');
    });

    test('should have proper CSS animations defined', () => {
        const styles = logo.shadowRoot.querySelector('style');
        expect(styles.textContent).toContain('@keyframes spin');
        expect(styles.textContent).toContain('@keyframes return');
        expect(styles.textContent).toContain('animation: spin 8s linear infinite');
    });

    test('should contain brand color classes', () => {
        const navyElements = logo.shadowRoot.querySelectorAll('.fill-navy');
        const turquoiseElements = logo.shadowRoot.querySelectorAll('.fill-turquoise');
        const creamElements = logo.shadowRoot.querySelectorAll('.fill-cream');
        
        expect(navyElements.length).toBeGreaterThan(0);
        expect(turquoiseElements.length).toBeGreaterThan(0);
        expect(creamElements.length).toBeGreaterThan(0);
    });
});