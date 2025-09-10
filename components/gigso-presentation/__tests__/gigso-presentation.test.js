import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';
import GigsoPresentation from '../gigso-presentation.js';

describe('GigsoPresentation Component', () => {
    let presentation;
    
    beforeEach(() => {
        // Mock requestFullscreen and exitFullscreen
        HTMLElement.prototype.requestFullscreen = jest.fn(() => Promise.resolve());
        document.exitFullscreen = jest.fn(() => Promise.resolve());
        
        // Mock fullscreenElement
        Object.defineProperty(document, 'fullscreenElement', {
            writable: true,
            value: null
        });
        
        presentation = document.createElement('gigso-presentation');
        document.body.appendChild(presentation);
    });
    
    afterEach(() => {
        if (presentation && presentation.parentNode) {
            presentation.parentNode.removeChild(presentation);
        }
        
        // Clear any timers
        if (presentation.timerInterval) {
            clearInterval(presentation.timerInterval);
        }
    });
    
    describe('Initialization', () => {
        test('should render presentation structure', () => {
            const container = presentation.shadowRoot.querySelector('.presentation-container');
            const header = presentation.shadowRoot.querySelector('.presentation-header');
            const slidesContainer = presentation.shadowRoot.getElementById('slides-container');
            const footer = presentation.shadowRoot.querySelector('.presentation-footer');
            
            expect(container).toBeTruthy();
            expect(header).toBeTruthy();
            expect(slidesContainer).toBeTruthy();
            expect(footer).toBeTruthy();
        });
        
        test('should initialize with correct default values', () => {
            expect(presentation.currentSlide).toBe(0);
            expect(presentation.totalSlides).toBe(8);
            expect(presentation.isFullscreen).toBe(false);
            expect(presentation.slides.length).toBe(8);
        });
        
        test('should render control buttons', () => {
            const prevBtn = presentation.shadowRoot.getElementById('prev-btn');
            const nextBtn = presentation.shadowRoot.getElementById('next-btn');
            const fullscreenBtn = presentation.shadowRoot.getElementById('fullscreen-btn');
            const exitBtn = presentation.shadowRoot.getElementById('exit-btn');
            
            expect(prevBtn).toBeTruthy();
            expect(nextBtn).toBeTruthy();
            expect(fullscreenBtn).toBeTruthy();
            expect(exitBtn).toBeTruthy();
        });
    });
    
    describe('Navigation', () => {
        test('should handle next slide navigation', () => {
            const nextSpy = jest.spyOn(presentation, 'nextSlide');
            const nextBtn = presentation.shadowRoot.getElementById('next-btn');
            
            fireEvent.click(nextBtn);
            
            expect(nextSpy).toHaveBeenCalled();
        });
        
        test('should handle previous slide navigation', () => {
            const prevSpy = jest.spyOn(presentation, 'previousSlide');
            const prevBtn = presentation.shadowRoot.getElementById('prev-btn');
            
            fireEvent.click(prevBtn);
            
            expect(prevSpy).toHaveBeenCalled();
        });
        
        test('should update slide counter', () => {
            presentation.currentSlide = 2;
            presentation.updateSlideCounter();
            
            const currentElement = presentation.shadowRoot.getElementById('current-slide');
            expect(currentElement.textContent).toBe('3');
        });
        
        test('should update progress bar', () => {
            presentation.currentSlide = 3;
            presentation.updateProgress();
            
            const progressFill = presentation.shadowRoot.getElementById('progress-fill');
            expect(progressFill.style.width).toBe('50%');
        });
    });
    
    describe('Keyboard Navigation', () => {
        test('should handle arrow key navigation', () => {
            const nextSpy = jest.spyOn(presentation, 'nextSlide');
            const prevSpy = jest.spyOn(presentation, 'previousSlide');
            
            // Simulate arrow right
            fireEvent.keyDown(document, { key: 'ArrowRight' });
            expect(nextSpy).toHaveBeenCalled();
            
            // Simulate arrow left
            fireEvent.keyDown(document, { key: 'ArrowLeft' });
            expect(prevSpy).toHaveBeenCalled();
        });
        
        test('should handle spacebar for next slide', () => {
            const nextSpy = jest.spyOn(presentation, 'nextSlide');
            
            fireEvent.keyDown(document, { key: ' ' });
            
            expect(nextSpy).toHaveBeenCalled();
        });
        
        test('should handle escape key for exit', () => {
            const exitSpy = jest.spyOn(presentation, 'exitPresentation');
            
            fireEvent.keyDown(document, { key: 'Escape' });
            
            expect(exitSpy).toHaveBeenCalled();
        });
    });
    
    describe('Timer Functionality', () => {
        test('should start timer on initialization', () => {
            expect(presentation.startTime).toBeTruthy();
            expect(presentation.timerInterval).toBeTruthy();
        });
        
        test('should display timer in correct format', () => {
            const timerDisplay = presentation.shadowRoot.getElementById('timer-display');
            expect(timerDisplay.textContent).toMatch(/^\d{2}:\d{2}$/);
        });
    });
    
    describe('Fullscreen Functionality', () => {
        test('should handle fullscreen toggle', async () => {
            const fullscreenBtn = presentation.shadowRoot.getElementById('fullscreen-btn');
            
            fireEvent.click(fullscreenBtn);
            
            expect(HTMLElement.prototype.requestFullscreen).toHaveBeenCalled();
        });
    });
    
    describe('Speaker Notes', () => {
        test('should provide speaker notes for each slide type', () => {
            const notes = presentation.getSpeakerNotes('title-slide');
            expect(notes).toContain('Opening Hook');
            
            const overviewNotes = presentation.getSpeakerNotes('web-components-overview');
            expect(overviewNotes).toContain('Standards-based');
        });
        
        test('should handle unknown slide types', () => {
            const notes = presentation.getSpeakerNotes('unknown-slide');
            expect(notes).toContain('No notes available');
        });
    });
    
    describe('Events', () => {
        test('should dispatch slide-changed event', (done) => {
            const eventSpy = jest.fn();
            presentation.addEventListener('slide-changed', eventSpy);
            
            // Wait for slides to load, then test navigation
            setTimeout(() => {
                if (presentation.slides.length > 1) {
                    presentation.goToSlide(1);
                    
                    setTimeout(() => {
                        expect(eventSpy).toHaveBeenCalled();
                        done();
                    }, 300);
                } else {
                    done();
                }
            }, 100);
        });
        
        test('should dispatch presentation-exit event', () => {
            const eventSpy = jest.fn();
            presentation.addEventListener('presentation-exit', eventSpy);
            
            presentation.exitPresentation();
            
            expect(eventSpy).toHaveBeenCalled();
            expect(eventSpy.mock.calls[0][0].detail).toHaveProperty('currentSlide');
            expect(eventSpy.mock.calls[0][0].detail).toHaveProperty('duration');
        });
    });
    
    describe('Slide Management', () => {
        test('should prevent navigation beyond slide bounds', () => {
            presentation.currentSlide = 0;
            presentation.previousSlide();
            expect(presentation.currentSlide).toBe(0);
            
            presentation.currentSlide = presentation.totalSlides - 1;
            presentation.nextSlide();
            expect(presentation.currentSlide).toBe(presentation.totalSlides - 1);
        });
        
        test('should update navigation button states', () => {
            presentation.currentSlide = 0;
            presentation.updateNavigationButtons();
            
            const prevBtn = presentation.shadowRoot.getElementById('prev-btn');
            const nextBtn = presentation.shadowRoot.getElementById('next-btn');
            
            expect(prevBtn.disabled).toBe(true);
            expect(nextBtn.disabled).toBe(false);
        });
    });
});