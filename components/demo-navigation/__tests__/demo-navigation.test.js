import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';
import DemoNavigation from '../demo-navigation.js';

describe('DemoNavigation Component', () => {
    let navigation;
    const originalLocation = window.location;

    beforeEach(() => {
        // Mock window.location
        delete window.location;
        window.location = { 
            pathname: '/demos/piano-roll-demo.html',
            href: 'http://localhost/demos/piano-roll-demo.html'
        };
        
        document.body.innerHTML = '';
        navigation = document.createElement('demo-navigation');
        document.body.appendChild(navigation);
    });

    afterEach(() => {
        if (navigation && navigation.parentNode) {
            navigation.parentNode.removeChild(navigation);
        }
        // Restore original location
        window.location = originalLocation;
    });

    test('should render navigation structure', () => {
        const nav = navigation.shadowRoot.querySelector('.demo-nav');
        const header = navigation.shadowRoot.querySelector('.nav-header');
        const categories = navigation.shadowRoot.querySelectorAll('.nav-category');
        const footer = navigation.shadowRoot.querySelector('.nav-footer');
        
        expect(nav).toBeTruthy();
        expect(header).toBeTruthy();
        expect(categories.length).toBeGreaterThan(0);
        expect(footer).toBeTruthy();
    });

    test('should contain title and subtitle', () => {
        const title = navigation.shadowRoot.querySelector('.nav-title');
        const subtitle = navigation.shadowRoot.querySelector('.nav-subtitle');
        
        expect(title).toBeTruthy();
        expect(title.textContent).toContain('Component Demos');
        expect(subtitle).toBeTruthy();
        expect(subtitle.textContent).toContain('Explore all available components');
    });

    test('should contain navigation categories', () => {
        const categoryTitles = navigation.shadowRoot.querySelectorAll('.category-title');
        const expectedCategories = [
            'Music Creation',
            'Instruments', 
            'Playback Controls',
            'Visual Feedback',
            'Interface',
            'Special Features'
        ];
        
        expect(categoryTitles.length).toBeGreaterThanOrEqual(5);
        
        const categoryTexts = Array.from(categoryTitles).map(el => el.textContent.replace(/[^\w\s]/g, '').trim());
        
        expectedCategories.forEach(category => {
            expect(categoryTexts.some(text => text.includes(category))).toBe(true);
        });
    });

    test('should contain navigation links with proper attributes', () => {
        const navLinks = navigation.shadowRoot.querySelectorAll('.nav-link');
        
        expect(navLinks.length).toBeGreaterThan(10);
        
        navLinks.forEach(link => {
            expect(link.getAttribute('href')).toBeTruthy();
            expect(link.getAttribute('data-demo')).toBeTruthy();
        });
    });

    test('should extract demo name from URL correctly', () => {
        // Test with piano-roll demo URL
        expect(navigation.getCurrentDemoFromUrl()).toBe('piano-roll');
        
        // Test with different demo URL
        window.location.pathname = '/demos/fretboard-demo.html';
        expect(navigation.getCurrentDemoFromUrl()).toBe('fretboard');
        
        // Test with non-demo URL
        window.location.pathname = '/index.html';
        expect(navigation.getCurrentDemoFromUrl()).toBe(null);
    });

    test('should highlight current demo link', () => {
        // Set up for piano-roll demo
        window.location.pathname = '/demos/piano-roll-demo.html';
        navigation.currentDemo = navigation.getCurrentDemoFromUrl();
        navigation.highlightCurrentDemo();
        
        const activeLink = navigation.shadowRoot.querySelector('.nav-link.active');
        expect(activeLink).toBeTruthy();
        expect(activeLink.getAttribute('data-demo')).toBe('piano-roll');
    });

    test('should remove active class from all links when highlighting', () => {
        // First set all links as active
        const allLinks = navigation.shadowRoot.querySelectorAll('.nav-link');
        allLinks.forEach(link => link.classList.add('active'));
        
        // Then highlight current demo
        navigation.highlightCurrentDemo();
        
        // Only one should be active
        const activeLinks = navigation.shadowRoot.querySelectorAll('.nav-link.active');
        expect(activeLinks.length).toBeLessThanOrEqual(1);
    });

    test('should handle clicks on navigation links', () => {
        const navLink = navigation.shadowRoot.querySelector('.nav-link');
        expect(navLink).toBeTruthy();
        
        // Should not throw when clicked
        expect(() => {
            fireEvent.click(navLink);
        }).not.toThrow();
    });

    test('should update current demo on popstate', () => {
        const originalDemo = navigation.currentDemo;
        
        // Change the URL and trigger popstate
        window.location.pathname = '/demos/fretboard-demo.html';
        window.dispatchEvent(new PopStateEvent('popstate'));
        
        // Allow time for event to process
        setTimeout(() => {
            expect(navigation.currentDemo).not.toBe(originalDemo);
            expect(navigation.currentDemo).toBe('fretboard');
        }, 10);
    });

    test('should contain footer links', () => {
        const footerLinks = navigation.shadowRoot.querySelectorAll('.nav-footer-link');
        
        expect(footerLinks.length).toBeGreaterThanOrEqual(3);
        
        const homeLink = navigation.shadowRoot.querySelector('.nav-footer-link.home');
        expect(homeLink).toBeTruthy();
        expect(homeLink.textContent).toContain('Back to Gigso Home');
    });

    test('should have responsive design styles', () => {
        const styles = navigation.shadowRoot.querySelector('style');
        expect(styles.textContent).toContain('@media (max-width: 768px)');
        expect(styles.textContent).toContain('min-width: 100%');
    });

    test('should contain specific demo links', () => {
        const expectedDemos = [
            'piano-roll',
            'chord-palette', 
            'hand-pan',
            'fretboard',
            'transport-controls'
        ];
        
        expectedDemos.forEach(demo => {
            const link = navigation.shadowRoot.querySelector(`[data-demo="${demo}"]`);
            expect(link).toBeTruthy();
        });
    });
});