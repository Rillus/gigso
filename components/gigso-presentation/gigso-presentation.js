import BaseComponent from '../base-component.js';

export default class GigsoPresentation extends BaseComponent {
    constructor() {
        const template = `
            <div class="presentation-container">
                <div class="presentation-header">
                    <div class="slide-counter">
                        <span id="current-slide">1</span> / <span id="total-slides">8</span>
                    </div>
                    <div class="presentation-controls">
                        <button id="speaker-notes-btn" class="control-btn">📝 Speaker Notes</button>
                        <button id="fullscreen-btn" class="control-btn">⛶ Fullscreen</button>
                        <button id="exit-btn" class="control-btn">✕ Exit</button>
                    </div>
                </div>
                
                <div class="progress-bar">
                    <div class="progress-fill" id="progress-fill"></div>
                </div>
                
                <div class="slides-container" id="slides-container">
                    <!-- Slides will be dynamically loaded here -->
                </div>
                
                <div class="presentation-footer">
                    <div class="navigation-controls">
                        <button id="prev-btn" class="nav-btn">← Previous</button>
                        <button id="next-btn" class="nav-btn">Next →</button>
                    </div>
                    <div class="presentation-timer">
                        <span id="timer-display">00:00</span>
                    </div>
                </div>
                
                <div class="speaker-notes" id="speaker-notes">
                    <h4>Speaker Notes</h4>
                    <div id="notes-content"></div>
                </div>
            </div>
        `;
        
        const styles = `
            .presentation-container {
                width: 100vw;
                height: 100vh;
                background: linear-gradient(135deg, #1e3c72, #2a5298);
                color: white;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            
            .presentation-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 25px;
                background: rgba(0, 0, 0, 0.2);
                backdrop-filter: blur(10px);
                z-index: 100;
            }
            
            .slide-counter {
                font-size: 14px;
                font-weight: 500;
                color: rgba(255, 255, 255, 0.8);
            }
            
            .presentation-controls {
                display: flex;
                gap: 10px;
            }
            
            .control-btn {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: white;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.3s ease;
            }
            
            .control-btn:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateY(-1px);
            }
            
            .progress-bar {
                height: 4px;
                background: rgba(255, 255, 255, 0.1);
                position: relative;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #00ff87, #60efff);
                width: 12.5%;
                transition: width 0.5s ease;
            }
            
            .slides-container {
                flex: 1;
                position: relative;
                overflow: hidden;
                padding: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .presentation-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 25px;
                background: rgba(0, 0, 0, 0.2);
                backdrop-filter: blur(10px);
            }
            
            .navigation-controls {
                display: flex;
                gap: 15px;
            }
            
            .nav-btn {
                background: linear-gradient(135deg, #667eea, #764ba2);
                border: none;
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            }
            
            .nav-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
            }
            
            .nav-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                transform: none;
            }
            
            .presentation-timer {
                font-size: 18px;
                font-weight: 600;
                color: #00ff87;
                text-shadow: 0 0 10px rgba(0, 255, 135, 0.3);
            }
            
            .speaker-notes {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 20px;
                transform: translateY(100%);
                transition: transform 0.3s ease;
                z-index: 200;
                max-height: 30vh;
                overflow-y: auto;
            }
            
            .speaker-notes.visible {
                transform: translateY(0);
            }
            
            .speaker-notes h4 {
                margin: 0 0 10px 0;
                color: #00ff87;
            }
            
            /* Slide transition animations */
            .slide {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: 0;
                transform: translateX(100px);
                transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
            }
            
            .slide.active {
                opacity: 1;
                transform: translateX(0);
                z-index: 10;
            }
            
            .slide.exiting {
                opacity: 0;
                transform: translateX(-100px);
            }
            
            /* Responsive design */
            @media (max-width: 768px) {
                .presentation-header {
                    padding: 10px 15px;
                }
                
                .slides-container {
                    padding: 20px;
                }
                
                .nav-btn {
                    padding: 10px 16px;
                    font-size: 12px;
                }
                
                .speaker-notes {
                    max-height: 40vh;
                }
            }
            
            /* Fullscreen mode */
            .presentation-container.fullscreen {
                position: fixed;
                top: 0;
                left: 0;
                z-index: 9999;
            }
            
            .presentation-container.fullscreen .presentation-header,
            .presentation-container.fullscreen .presentation-footer {
                background: rgba(0, 0, 0, 0.4);
            }
        `;
        
        super(template, styles);
        
        this.currentSlide = 0;
        this.totalSlides = 8;
        this.isFullscreen = false;
        this.startTime = null;
        this.timerInterval = null;
        this.slides = [];
        this.speakerNotesWindow = null;
        this.isSpeakerNotesOpen = false;
        
        this.setupEventListeners();
        this.setupKeyboardNavigation();
        this.startTimer();
        this.loadSlides();
    }
    
    setupEventListeners() {
        const prevBtn = this.shadowRoot.getElementById('prev-btn');
        const nextBtn = this.shadowRoot.getElementById('next-btn');
        const speakerNotesBtn = this.shadowRoot.getElementById('speaker-notes-btn');
        const fullscreenBtn = this.shadowRoot.getElementById('fullscreen-btn');
        const exitBtn = this.shadowRoot.getElementById('exit-btn');
        
        prevBtn.addEventListener('click', () => this.previousSlide());
        nextBtn.addEventListener('click', () => this.nextSlide());
        speakerNotesBtn.addEventListener('click', () => this.toggleSpeakerNotesWindow());
        fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        exitBtn.addEventListener('click', () => this.exitPresentation());

        document.addEventListener('fullscreenchange', () => {
            this.isFullscreen = !!document.fullscreenElement;
            const container = this.shadowRoot.querySelector('.presentation-container');
            if (container) {
                container.classList.toggle('fullscreen', this.isFullscreen);
            }
        });
        
        // Listen for messages from speaker notes window
        window.addEventListener('message', (event) => {
            if (event.origin !== window.location.origin) {
                return; // Security check
            }
            
            switch (event.data.type) {
                case 'speaker-notes-ready':
                    this.handleSpeakerNotesReady();
                    break;
                case 'speaker-notes-closed':
                    this.handleSpeakerNotesClosed();
                    break;
            }
        });
    }
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (event) => {
            if (!this.isActive()) return;
            
            switch (event.key) {
                case 'ArrowRight':
                case ' ':
                    event.preventDefault();
                    this.nextSlide();
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    this.previousSlide();
                    break;
                case 'Escape':
                    event.preventDefault();
                    this.exitPresentation();
                    break;
                case 'f':
                case 'F':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        this.toggleFullscreen();
                    }
                    break;
                case '0':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        this.toggleSpeakerNotesWindow();
                    }
                    break;
            }
        });
    }
    
    async loadSlides() {
        try {
            // Load presentation data from JSON file
            const response = await fetch('./presentation-data.json');
            if (!response.ok) {
                throw new Error(`Failed to load presentation data: ${response.status}`);
            }
            const presentationData = await response.json();
            
            this.presentationData = presentationData;
            this.totalSlides = presentationData.slides.length;
            
            const container = this.shadowRoot.getElementById('slides-container');
            
            // Create slides from JSON data
            for (let i = 0; i < presentationData.slides.length; i++) {
                const slideConfig = presentationData.slides[i];
                const slide = document.createElement('presentation-slide');
                
                // Set properties first (before adding to DOM)
                slide.slideIndex = i;
                slide.slideType = slideConfig.id;
                slide.title = slideConfig.title;
                slide.slideData = slideConfig;
                
                // Add to DOM
                container.appendChild(slide);
                
                // Add CSS classes after DOM insertion
                slide.classList.add('slide');
                if (i === 0) {
                    slide.classList.add('active');
                }
                
                this.slides.push(slide);
            }
            
            this.updateSlideCounter();
            this.updateProgress();
            
            // Load speaker notes for the first slide
            this.loadSlideNotes();
            
        } catch (error) {
            console.error('Error loading presentation slides:', error);
            // Fallback to hardcoded data if JSON loading fails
            this.loadFallbackSlides();
        }
    }
    
    loadFallbackSlides() {
        const slideData = [
            { component: 'title-slide', title: 'From Code to Chords' },
            { component: 'web-components-overview', title: 'What Are Web Components?' },
            { component: 'web-components-benefits', title: 'Why Web Components for Music?' },
            { component: 'architecture-overview', title: 'Component Architecture' },
            { component: 'component-categories', title: 'Component Categories' },
            { component: 'event-architecture', title: 'Event-Driven Architecture' },
            { component: 'live-demo', title: 'Live Demo: Building a Song' },
            { component: 'technical-future', title: 'Technical Innovation & Future' }
        ];
        
        const container = this.shadowRoot.getElementById('slides-container');
        
        for (let i = 0; i < slideData.length; i++) {
            const slide = document.createElement('presentation-slide');
            
            // Set properties first (before adding to DOM)
            slide.slideIndex = i;
            slide.slideType = slideData[i].component;
            slide.title = slideData[i].title;
            
            // Add to DOM
            container.appendChild(slide);
            
            // Add CSS classes after DOM insertion
            slide.classList.add('slide');
            if (i === 0) {
                slide.classList.add('active');
            }
            
            this.slides.push(slide);
        }
        
        this.updateSlideCounter();
        this.updateProgress();
        
        // Load speaker notes for the first slide
        this.loadSlideNotes();
    }
    
    nextSlide() {
        if (this.currentSlide < this.totalSlides - 1) {
            this.goToSlide(this.currentSlide + 1);
        }
    }
    
    previousSlide() {
        if (this.currentSlide > 0) {
            this.goToSlide(this.currentSlide - 1);
        }
    }
    
    goToSlide(index) {
        if (index < 0 || index >= this.totalSlides) return;
        
        const currentSlideElement = this.slides[this.currentSlide];
        const nextSlideElement = this.slides[index];
        
        // Exit current slide
        currentSlideElement.classList.remove('active');
        currentSlideElement.classList.add('exiting');
        
        // Enter next slide
        setTimeout(() => {
            currentSlideElement.classList.remove('exiting');
            nextSlideElement.classList.add('active');
            
            this.currentSlide = index;
            this.updateSlideCounter();
            this.updateProgress();
            this.updateNavigationButtons();
            this.loadSlideNotes();
            
            // Dispatch slide change event
            this.dispatchEvent(new CustomEvent('slide-changed', {
                detail: { 
                    currentSlide: this.currentSlide,
                    slideType: nextSlideElement.getAttribute('slide-type'),
                    title: nextSlideElement.getAttribute('title')
                }
            }));
            
            // Notify speaker notes window
            this.notifySpeakerNotesWindow({
                type: 'slide-changed',
                detail: {
                    currentSlide: this.currentSlide,
                    slideType: nextSlideElement.slideType || nextSlideElement.getAttribute('slide-type'),
                    title: nextSlideElement.title || nextSlideElement.getAttribute('title')
                }
            });
        }, 250);
    }
    
    updateSlideCounter() {
        const currentElement = this.shadowRoot.getElementById('current-slide');
        const totalElement = this.shadowRoot.getElementById('total-slides');
        
        currentElement.textContent = this.currentSlide + 1;
        totalElement.textContent = this.totalSlides;
    }
    
    updateProgress() {
        const progressFill = this.shadowRoot.getElementById('progress-fill');
        const progress = ((this.currentSlide + 1) / this.totalSlides) * 100;
        progressFill.style.width = `${progress}%`;
    }
    
    updateNavigationButtons() {
        const prevBtn = this.shadowRoot.getElementById('prev-btn');
        const nextBtn = this.shadowRoot.getElementById('next-btn');
        
        prevBtn.disabled = this.currentSlide === 0;
        nextBtn.disabled = this.currentSlide === this.totalSlides - 1;
    }
    
    loadSlideNotes() {
        const currentSlideElement = this.slides[this.currentSlide];
        if (!currentSlideElement) return;
        
        // Try to get slide type from property first, then fallback to attribute
        const slideType = currentSlideElement.slideType || currentSlideElement.getAttribute('slide-type');
        const notesContent = this.shadowRoot.getElementById('notes-content');
        
        if (!slideType || !notesContent) return;
        
        const speakerNotes = this.getSpeakerNotes(slideType);
        notesContent.innerHTML = speakerNotes;
    }
    
    getSpeakerNotes(slideType) {
        // Try to get notes from JSON data first
        if (this.presentationData && this.presentationData.slides) {
            const slideData = this.presentationData.slides.find(slide => slide.id === slideType);
            if (slideData && slideData.speakerNotes) {
                return this.formatSpeakerNotes(slideData.speakerNotes);
            }
        }
        
        // Fallback to hardcoded notes
        const notes = {
            'title-slide': `
                <p><strong>Opening Hook:</strong> "From Code to Chords - imagine building a professional music application using only web standards. No React, no Vue, no Angular - just pure web technologies."</p>
                <p><strong>Key Point:</strong> Introduce the concept of framework-free development</p>
            `,
            'web-components-overview': `
                <p><strong>Focus:</strong> Explain the three main Web Components technologies</p>
                <p><strong>Emphasize:</strong> Standards-based, browser-native technology</p>
                <p><strong>Analogy:</strong> Like building blocks that work everywhere</p>
            `,
            'web-components-benefits': `
                <p><strong>Music-Specific Benefits:</strong> Why Web Components are perfect for audio applications</p>
                <p><strong>Key Points:</strong> No framework overhead, native performance, modular architecture</p>
            `,
            'architecture-overview': `
                <p><strong>BaseComponent Pattern:</strong> Explain the inheritance hierarchy</p>
                <p><strong>Question:</strong> "Is BaseComponent a good idea?" - encourage discussion</p>
            `,
            'component-categories': `
                <p><strong>Visual Organization:</strong> Show how components are categorized by function</p>
                <p><strong>Highlight:</strong> Each category serves a specific musical purpose</p>
            `,
            'event-architecture': `
                <p><strong>Communication Pattern:</strong> CustomEvent-based messaging</p>
                <p><strong>Example:</strong> Chord selection updating multiple components</p>
            `,
            'live-demo': `
                <p><strong>Demo Flow:</strong> Start simple, build complexity</p>
                <p><strong>Interaction:</strong> Encourage audience participation</p>
                <p><strong>Fallback:</strong> Have backup if audio doesn't work</p>
            `,
            'technical-future': `
                <p><strong>Closing:</strong> "From Code to Chords - we've seen how Web Components enable sophisticated applications"</p>
                <p><strong>Future Vision:</strong> Standards-based, modular web development</p>
            `
        };
        
        return notes[slideType] || '<p>No notes available for this slide.</p>';
    }
    
    formatSpeakerNotes(notes) {
        let html = '';
        
        // Add opening hook if present
        if (notes.opening) {
            html += `<p><strong>Opening Hook:</strong> ${notes.opening}</p>`;
        }
        
        // Add focus points
        if (notes.focus) {
            html += `<p><strong>Focus:</strong> ${notes.focus}</p>`;
        }
        
        // Add key points
        if (notes.keyPoints) {
            html += `<p><strong>Key Points:</strong> ${notes.keyPoints}</p>`;
        }
        
        // Add key point (singular)
        if (notes.keyPoint) {
            html += `<p><strong>Key Point:</strong> ${notes.keyPoint}</p>`;
        }
        
        // Add emphasis
        if (notes.emphasize) {
            html += `<p><strong>Emphasize:</strong> ${notes.emphasize}</p>`;
        }
        
        // Add analogy
        if (notes.analogy) {
            html += `<p><strong>Analogy:</strong> ${notes.analogy}</p>`;
        }
        
        // Add question
        if (notes.question) {
            html += `<p><strong>Question:</strong> ${notes.question}</p>`;
        }
        
        // Add example
        if (notes.example) {
            html += `<p><strong>Example:</strong> ${notes.example}</p>`;
        }
        
        // Add interaction notes
        if (notes.interaction) {
            html += `<p><strong>Interaction:</strong> ${notes.interaction}</p>`;
        }
        
        // Add fallback notes
        if (notes.fallback) {
            html += `<p><strong>Fallback:</strong> ${notes.fallback}</p>`;
        }
        
        // Add closing notes
        if (notes.closing) {
            html += `<p><strong>Closing:</strong> ${notes.closing}</p>`;
        }
        
        // Add future vision
        if (notes.futureVision) {
            html += `<p><strong>Future Vision:</strong> ${notes.futureVision}</p>`;
        }
        
        // Add timing information
        if (notes.timing) {
            html += `<p><strong>Timing:</strong> ${notes.timing}</p>`;
        }
        
        // Add highlight
        if (notes.highlight) {
            html += `<p><strong>Highlight:</strong> ${notes.highlight}</p>`;
        }
        
        return html || '<p>No notes available for this slide.</p>';
    }
    
    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            
            const display = this.shadowRoot.getElementById('timer-display');
            display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }
    
    toggleFullscreen() {
        // Check actual fullscreen state instead of tracking our own
        if (!document.fullscreenElement) {
            this.requestFullscreen().then(() => {
                this.isFullscreen = true;
                this.shadowRoot.querySelector('.presentation-container').classList.add('fullscreen');
            }).catch(err => console.error('Fullscreen error:', err));
        } else {
            document.exitFullscreen().then(() => {
                this.isFullscreen = false;
                this.shadowRoot.querySelector('.presentation-container').classList.remove('fullscreen');
            }).catch(err => console.error('Exit fullscreen error:', err));
        }
    }
    
    toggleSpeakerNotesWindow() {
        if (this.speakerNotesWindow && !this.speakerNotesWindow.closed) {
            // Window is open, focus it
            this.speakerNotesWindow.focus();
        } else {
            // Open new speaker notes window
            this.openSpeakerNotesWindow();
        }
    }
    
    openSpeakerNotesWindow() {
        const width = Math.min(600, window.screen.width * 0.4);
        const height = Math.min(800, window.screen.height * 0.8);
        const left = window.screen.width - width - 50;
        const top = 50;
        
        this.speakerNotesWindow = window.open(
            './speaker-notes.html',
            'SpeakerNotes',
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,toolbar=no,menubar=no,location=no`
        );
        
        if (this.speakerNotesWindow) {
            this.isSpeakerNotesOpen = true;
            this.updateSpeakerNotesButton();
            
            // Send initial data when window is ready
            setTimeout(() => {
                this.notifySpeakerNotesWindow({
                    type: 'presentation-ready',
                    detail: {
                        currentSlide: this.currentSlide,
                        slideType: this.slides[this.currentSlide]?.slideType,
                        title: this.slides[this.currentSlide]?.title
                    }
                });
            }, 1000);
        }
    }
    
    handleSpeakerNotesReady() {
        // Send current slide data to the newly opened window
        this.notifySpeakerNotesWindow({
            type: 'slide-changed',
            detail: {
                currentSlide: this.currentSlide,
                slideType: this.slides[this.currentSlide]?.slideType,
                title: this.slides[this.currentSlide]?.title
            }
        });
    }
    
    handleSpeakerNotesClosed() {
        this.speakerNotesWindow = null;
        this.isSpeakerNotesOpen = false;
        this.updateSpeakerNotesButton();
    }
    
    notifySpeakerNotesWindow(message) {
        if (this.speakerNotesWindow && !this.speakerNotesWindow.closed) {
            try {
                this.speakerNotesWindow.postMessage(message, window.location.origin);
            } catch (error) {
                console.warn('Could not send message to speaker notes window:', error);
                this.handleSpeakerNotesClosed();
            }
        }
    }
    
    updateSpeakerNotesButton() {
        const btn = this.shadowRoot.getElementById('speaker-notes-btn');
        if (btn) {
            btn.textContent = this.isSpeakerNotesOpen ? '📝 Focus Notes' : '📝 Speaker Notes';
        }
    }
    
    toggleSpeakerNotes() {
        const notes = this.shadowRoot.getElementById('speaker-notes');
        notes.classList.toggle('visible');
    }
    
    exitPresentation() {
        // Notify speaker notes window to close
        this.notifySpeakerNotesWindow({
            type: 'presentation-exit'
        });
        
        this.dispatchEvent(new CustomEvent('presentation-exit', {
            detail: { currentSlide: this.currentSlide, duration: Date.now() - this.startTime }
        }));
    }
    
    isActive() {
        return document.body.contains(this);
    }
    
    disconnectedCallback() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }
}

customElements.define('gigso-presentation', GigsoPresentation);