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
    }
    
    connectedCallback() {
        // Load slides when component is connected to DOM
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
                    event.preventDefault();
                    this.toggleFullscreen();
                    break;
                case 'n':
                case 'N':
                    event.preventDefault();
                    this.toggleSpeakerNotesWindow();
                    break;
            }
        });
    }
    
    setupUrlNavigation() {
        // Listen for browser back/forward buttons
        window.addEventListener('popstate', (event) => {
            this.loadSlideFromUrl();
        });
        
        // Check for slide parameter in URL after slides are loaded
        this.loadSlideFromUrl();
    }
    
    loadSlideFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const slideParam = urlParams.get('slide');
        
        if (slideParam) {
            const slideIndex = parseInt(slideParam) - 1; // Convert to 0-based index
            if (slideIndex >= 0 && slideIndex < this.totalSlides) {
                // Use setTimeout to ensure slides are loaded first
                setTimeout(() => {
                    this.goToSlide(slideIndex);
                }, 100);
            }
        }
    }
    
    updateUrlForSlide(slideIndex) {
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('slide', (slideIndex + 1).toString()); // Convert to 1-based for URL
        
        // Update URL without triggering page reload
        window.history.pushState({ slideIndex }, '', newUrl);
    }
    
    async loadSlides() {
        try {
            // Use embedded presentation data instead of loading from file
            const presentationData = this.getPresentationData();
            
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
                
                // Also set as attributes for better compatibility
                slide.setAttribute('slide-type', slideConfig.id);
                slide.setAttribute('title', slideConfig.title);
                
                console.log('🎵 Main Presentation: Created slide', i, 'with slideType:', slideConfig.id, 'title:', slideConfig.title);
                
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
            
            // Setup URL navigation after slides are loaded
            this.setupUrlNavigation();
            
        } catch (error) {
            console.error('Error loading presentation slides:', error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
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
        
        // Setup URL navigation after slides are loaded
        this.setupUrlNavigation();
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
                    slideType: nextSlideElement.getAttribute('slide-type') || nextSlideElement.slideType,
                    title: nextSlideElement.getAttribute('title') || nextSlideElement.title
                }
            }));
            
            // Notify speaker notes window
            console.log('🎵 Main Presentation: nextSlideElement:', nextSlideElement);
            console.log('🎵 Main Presentation: nextSlideElement.slideType:', nextSlideElement.slideType);
            console.log('🎵 Main Presentation: nextSlideElement.getAttribute("slide-type"):', nextSlideElement.getAttribute('slide-type'));
            console.log('🎵 Main Presentation: nextSlideElement.title:', nextSlideElement.title);
            console.log('🎵 Main Presentation: nextSlideElement.getAttribute("title"):', nextSlideElement.getAttribute('title'));
            
            // Prioritize attribute over property for better compatibility
            const slideType = nextSlideElement.getAttribute('slide-type') || nextSlideElement.slideType;
            const title = nextSlideElement.getAttribute('title') || nextSlideElement.title;
            
            console.log('🎵 Main Presentation: Final slideType:', slideType, 'title:', title);
            
            this.notifySpeakerNotesWindow({
                type: 'slide-changed',
                detail: {
                    currentSlide: this.currentSlide,
                    slideType: slideType,
                    title: title
                }
            });
            
            // Update URL to reflect current slide
            this.updateUrlForSlide(this.currentSlide);
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
                        slideType: this.slides[this.currentSlide]?.getAttribute('slide-type') || this.slides[this.currentSlide]?.slideType,
                        title: this.slides[this.currentSlide]?.getAttribute('title') || this.slides[this.currentSlide]?.title
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
                slideType: this.slides[this.currentSlide]?.getAttribute('slide-type') || this.slides[this.currentSlide]?.slideType,
                title: this.slides[this.currentSlide]?.getAttribute('title') || this.slides[this.currentSlide]?.title
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
    
    getPresentationData() {
        // Embedded presentation data to avoid Cloudflare Pages static file serving issues
        return {
            "slides": [
                {
                    "id": "title-slide",
                    "title": "From Code to Chords",
                    "content": {
                        "type": "title",
                        "mainTitle": "From Code to Chords",
                        "subtitle": "Building a Web-Based Music Maker Without Frameworks",
                        "author": "Riley Ramone",
                        "date": "September 16th, 2025"
                    },
                    "speakerNotes": {
                        "opening": "Good afternoon John Lewis! How are we doing out there? When I first started making websites, none of this would have been possible. This is a story about the web, music and how far we've come, and what's possible now.<br><br>I'm Riley and I've been making websites for over 20 years. I also love listening to and playing music when I'm not coding. While I'm not what most people would call a proper musician, I am in a band: the John Lewis Partnership Ukulele Band (Also known as The PUB), and they'll feature in this story a bit.",
                        "keyPoint": "Introduce the concept of framework-free development<br>• Show the audience what's possible<br>• Build credibility",
                        "timing": "1 minute for introduction and context setting"
                    }
                },
                {
                    "id": "the-noisy-web",
                    "title": "The Noisy Web",
                    "content": {
                        "type": "bullets",
                        "mainTitle": "The Noisy Web",
                        "bullets": [
                            {"text": "CD-ROMs were introduced", "highlight": "1985"},
                            {"text": "Adobe Flash launched", "highlight": "1996"},
                            {"text": "Safari implements the HTML5 Audio element", "highlight": "2008"},
                            {"text": "Chrome implements the Web Audio API", "highlight": "2011"},
                            {"text": "The first web-based DAW was created", "highlight": "2013"},
                            {"text": "Adobe Flash discontinued", "highlight": "2020"}
                        ]
                    },
                    "speakerNotes": {
                        "focus": "The Web used to be a very loud place",
                        "keyPoints": "The Web used to be a very loud place, and although we have audio and video, it tends to be within the context of audio and video players now.",
                        "timing": "2-3 minutes to explain each concept with examples"
                    }
                },
                {
                    "id": "web-components-overview",
                    "title": "What Are Web Components?",
                    "content": {
                        "type": "bullets",
                        "mainTitle": "What Are Web Components?",
                        "bullets": [
                            {"text": "Encapsulation: Shadow DOM isolates styles and markup", "highlight": "Encapsulation"},
                            {"text": "Reusability: Custom elements work across any framework", "highlight": "Reusability"},
                            {"text": "Standards-based: Built on web standards, no external dependencies", "highlight": "Standards-based"},
                            {"text": "Composability: Components combine to build complex applications", "highlight": "Composability"}
                        ]
                    },
                    "speakerNotes": {
                        "focus": "Explain the three main Web Components technologies:<br>• Custom Elements<br>• Shadow DOM<br>• HTML Templates",
                        "keyPoints": "Custom Elements are the building blocks of Web Components. Shadow DOM is used to encapsulate the styles and markup of the component. HTML Templates are used to create the markup of the component.",
                        "emphasize": "Standards-based, browser-native technology<br><br>No frameworks needed!",
                        "timing": "3-4 minutes to explain each concept with examples"
                    }
                },
                {
                    "id": "web-components-benefits",
                    "title": "Why Web Components for Music?",
                    "content": {
                        "type": "bullets",
                        "mainTitle": "Why Web Components for Music?",
                        "bullets": [
                            {"text": "Modularity: Each instrument/control is a separate component", "highlight": "Modularity"},
                            {"text": "Interoperability: Components communicate via standard events", "highlight": "Interoperability"},
                            {"text": "Performance: Native browser APIs, no framework overhead", "highlight": "Performance"},
                            {"text": "Audio-First: Direct access to Web Audio API for real-time audio", "highlight": "Audio-First"}
                        ]
                    },
                    "speakerNotes": {
                        "focus": "Music-Specific Benefits: Why Web Components are perfect for audio applications",
                        "keyPoints": "No framework overhead, native performance, modular architecture",
                        "timing": "4-5 minutes with audio examples if possible"
                    }
                },
                {
                    "id": "web-audio-api",
                    "title": "Web Audio API",
                    "content": {
                        "type": "code",
                        "mainTitle": "Web Audio API",
                        "codeBlock": "const context = new window.AudioContext();\n\nconst successNoise = context.createOscillator();\nsuccessNoise.frequency = \"600\";\nsuccessNoise.type = \"sine\";\nsuccessNoise.frequency.exponentialRampToValueAtTime(\n  800,\n  context.currentTime + 0.05\n);\nsuccessNoise.frequency.exponentialRampToValueAtTime(\n  1000,\n  context.currentTime + 0.15\n);\n\nsuccessGain = context.createGain();\nsuccessGain.gain.exponentialRampToValueAtTime(\n  0.01,\n  context.currentTime + 0.3\n);\n\nsuccessFilter = context.createBiquadFilter(\"bandpass\");\nsuccessFilter.Q = 0.01;\n\nsuccessNoise\n  .connect(successFilter)\n  .connect(successGain)\n  .connect(context.destination);\nsuccessNoise.start();\nsuccessNoise.stop(context.currentTime + 0.2);",
                        "question": "🤔 Is there a more developer-friendly option?"
                    },
                    "speakerNotes": {
                        "focus": "Web Audio API: Explain the Web Audio API",
                        "keyPoints": "Talk through code line by line. You can see what it's doing through... I got this from a tutorial, so I've not fully assimilated it myself.",
                        "example": "Playing a success noise",
                        "timing": "3-4 minutes with live demonstration if possible"
                    }
                },
                {
                    "id": "tone-js",
                    "title": "Tone.js",
                    "content": {
                        "type": "code",
                        "mainTitle": "Tone.js",
                        "codeBlock": "const synth = new Tone.Synth({\n  oscillator: { type: \"sine\" },\n  envelope: {\n    attack: 0.01,\n    decay: 0.1,\n    sustain: 0.1,\n    release: 0.15,\n  },\n}).toDestination();\n\nconst now = Tone.now();\n\n// You can also use note names like \"C4\"\nsynth.triggerAttack(600, now);\nsynth.frequency.exponentialRampTo(1000, 0.15, now);\nsynth.triggerRelease(now + 0.2);"
                    },
                    "speakerNotes": {
                        "focus": "Tone.js: Show the simplified version",
                        "example": "Same sound, much cleaner code",
                        "keyPoints": "This is a lot easier to read, and although the implementation and results are slightly different, it sounds a bit nicer to me. Also note the comment, where I mention you can use note names. If we wanted to play a middle C (C4) in native code, we'd need to use its frequency in Hz, which is 261.626 Hz.",
                        "timing": "2-3 minutes to show the comparison"
                    }
                },
                {
                    "id": "event-architecture",
                    "title": "Event-Driven Architecture",
                    "content": {
                        "type": "bullets-with-code",
                        "mainTitle": "Event-Driven Architecture",
                        "bullets": [
                            {"text": "CustomEvent: Components communicate via standard events", "highlight": "CustomEvent"},
                            {"text": "Centralised State: Single source of truth for application state", "highlight": "Centralized State"},
                            {"text": "Real-time Updates: Changes propagate across all components", "highlight": "Real-time Updates"},
                            {"text": "Example: Chord selection updates multiple components simultaneously", "highlight": "Example"}
                        ],
                        "codeBlock": "this.dispatchEvent(new CustomEvent('chord-selected', {\n  detail: { chord: 'Cmaj7', notes: ['C', 'E', 'G', 'B'] }\n}));"
                    },
                    "speakerNotes": {
                        "focus": "Communication Pattern: CustomEvent-based messaging",
                        "example": "Chord selection updating multiple components",
                        "timing": "4-5 minutes with live demonstration if possible"
                    }
                },
                {
                    "id": "hand-pan",
                    "title": "Hand Pan",
                    "content": {
                        "type": "demo",
                        "mainTitle": "Hand Pan",
                        "demoType": "hand-pan"
                    },
                    "speakerNotes": {
                        "focus": "Hand Pan: Show the Hand Pan component",
                        "interaction": "Encourage audience participation. Note the touch interaction, and the ability to mute and unmute the audio. Also note the key and scale selection, and the size selection.",
                        "fallback": "Have backup if audio doesn't work. Also note the event logging, and the ability to clear the event log.",
                        "timing": "2-3 minutes for interactive demonstration"
                    }
                },
                {
                    "id": "gigso-demo",
                    "title": "Gigso Demo",
                    "content": {
                        "type": "demo",
                        "mainTitle": "Gigso Demo",
                        "demoType": "gigso"
                    },
                    "speakerNotes": {
                        "interaction": "So, this is Gigso. It's a web-based application that allows users to compose and play music. It's a work in progress, but you can see the components in action.<br><br>- Start with the keyboard<br>- Add a couple of chords<br>- note the chord box, so we can see how to play the chords on guitar<br>- So here's a chord progression I saved earlier. Radiohed's Creep. Let's see how it sounds.<br>- play 4 chords and loop via loop pedal.<br>- So I thought this would be pretty useful for The Partner Ukulele Band: we could share songs via here and have a nice little library of songs to play. Let's update the instrument to ukulele and see how that sounds next. (play the four chords in to the looper on the uke)<br>- If you're anything like me, you have a mandolin that yougot one year for your birthday, and you don't play it very often because there aren't many mandolin tabs or chord sheets online. What if you could play the chords on the mandolin? (play the four chords on the mandolin)<br>- I'd got about this far when my sister asked if I wanted to support my neices and teach some ukulele lessons at a day festival called Priory Live in Orpington to raise money for the Orpington May Queen, and as I already had some of the framework and components, my alter ego Unclelele was born, which I was able to set up within about a day. What of we take the chords from here and put them into the Gigso Piano Roll?<br>- show moving chords around",
                        "timing": "2-3 minutes for interactive demonstration"
                    }
                },
                {
                    "id": "development-methodology",
                    "title": "Development Methodology",
                    "content": {
                        "type": "bullets",
                        "mainTitle": "Development Methodology",
                        "bullets": [
                            {"text": "AI chat and auto-complete", "highlight": "Phase 1"},
                            {"text": "Background agents", "highlight": "Phase 2"},
                            {"text": "Specification driven development", "highlight": "Phase 3"}
                        ]
                    },
                    "speakerNotes": {
                        "keyPoints": "Starting in January, the first couple of components were built using AI chat and auto-complete. This allowed me to learn about Web Components, and set up event and state management.<br>When Cursor released Background Agents around May/June of this year, I set up deployment from the main branch via cloudflare pages, so I could request changes via Background agents, and review, merge and deploy via the Github web interface. This was much more akin to vibe coding than traditional development, with less code oversight.<br>More recently, I've been using specification driven development, writing the specifications first, and then the implementation. I've been broadly using Claude Code to write the specifications, and then let it auto-run the implementation, and making sure we have good test coverage in place. Then for more fine-grained tweaks and design changes, I've been jumping back into Cursor.",
                        "timing": "4-5 minutes with audio examples if possible"
                    }
                },
                {
                    "id": "technical-future",
                    "title": "Future Development",
                    "content": {
                        "type": "bullets",
                        "mainTitle": "Future Development",
                        "bullets": [
                            {"text": "Play samples, create drum machine", "highlight": "Samples"},
                            {"text": "Live input recording and looping for building up songs", "highlight": "Looper"},
                            {"text": "Import/export MIDI files, MIDI controller support", "highlight": "MIDI"},
                            {"text": "Assisted composition", "highlight": "AI"},
                            {"text": "Real-time, multi-user", "highlight": "Collaboration"},
                            {"text": "Native app?", "highlight": "Mobile"}
                        ]
                    },
                    "speakerNotes": {
                        "focus": "Future Development: What's next for the project",
                        "keyPoints": "MIDI import/export capabilities, AI-assisted composition features, collaborative real-time editing, mobile app development, and also due to the modular nature of these components, we could remix it to support all sorts of workflows and use cases.",
                        "timing": "3-4 minutes to wrap up and inspire"
                    }
                },
                {
                    "id": "closing-slide",
                    "title": "Thank you, and good night!",
                    "content": {
                        "type": "title",
                        "mainTitle": "Thank you, and good night!",
                        "subtitle": "gigso.net",
                        "author": "Riley Ramone",
                        "date": "September 16th, 2025"
                    },
                    "speakerNotes": {
                        "closing": "Thank you for coming to my gig. I hope you've enjoyed it. If you have any questions, please feel free to ask on Slack, as we're out of time now. The website is Gogso.net if you'd like to play - there's a link at the bottom to the GitHub repository - please fork or contribute to it if you'd like to. Finally, please search for \"ukulele\" on Partner Choice to find out more about The Partner Ukulele Band. We're playing a gig on the 11th December at Drummond Base for the early lunch sitting, so come and say hi!",
                        "timing": "1 minute for closing"
                    }
                }
            ],
            "metadata": {
                "totalSlides": 8,
                "presentationTitle": "From Code to Chords: Building a Web-Based Music Maker Without Frameworks",
                "author": "Riley Ramone",
                "date": "September 16th, 2025",
                "version": "1.0.0",
                "lastUpdated": "2025-01-27"
            }
        };
    }
}

customElements.define('gigso-presentation', GigsoPresentation);