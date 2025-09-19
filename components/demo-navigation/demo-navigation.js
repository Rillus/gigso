export default class DemoNavigation extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    height: 100%;
                }
                
                .demo-nav {
                    background: #f8f9fa;
                    border-right: 1px solid #e9ecef;
                    height: 100%;
                    overflow-y: auto;
                    padding: 20px 0;
                    min-width: 280px;
                    max-width: 320px;
                }
                
                .nav-header {
                    padding: 0 20px 20px;
                    border-bottom: 1px solid #e9ecef;
                    margin-bottom: 20px;
                }
                
                .nav-title {
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: #08113e;
                    margin: 0 0 8px 0;
                }
                
                .nav-subtitle {
                    font-size: 0.9rem;
                    color: #6c757d;
                    margin: 0;
                }
                
                .nav-category {
                    margin-bottom: 25px;
                }
                
                .category-title {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #495057;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    padding: 0 20px 8px;
                    margin: 0;
                    border-bottom: 1px solid #dee2e6;
                }
                
                .nav-links {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                
                .nav-item {
                    margin: 0;
                }
                
                .nav-link {
                    display: block;
                    padding: 10px 20px;
                    color: #495057;
                    text-decoration: none;
                    font-size: 0.9rem;
                    transition: all 0.2s ease;
                    border-left: 3px solid transparent;
                }
                
                .nav-link:hover {
                    background: rgba(13, 201, 187, 0.1);
                    color: #0DC9BB;
                    border-left-color: #0DC9BB;
                }
                
                .nav-link.active {
                    background: rgba(13, 201, 187, 0.15);
                    color: #0DC9BB;
                    border-left-color: #0DC9BB;
                    font-weight: 500;
                }
                
                .nav-link-icon {
                    margin-right: 8px;
                    font-size: 1rem;
                }
                
                .nav-link-text {
                    display: inline-block;
                    vertical-align: middle;
                }
                
                .nav-footer {
                    padding: 20px;
                    border-top: 1px solid #e9ecef;
                    margin-top: 20px;
                }
                
                .nav-footer-link {
                    display: block;
                    padding: 8px 0;
                    color: #6c757d;
                    text-decoration: none;
                    font-size: 0.85rem;
                    transition: color 0.2s ease;
                }
                
                .nav-footer-link:hover {
                    color: #0DC9BB;
                }
                
                .nav-footer-link.home {
                    font-weight: 500;
                    color: #08113e;
                }
                
                .nav-footer-link.home:hover {
                    color: #0DC9BB;
                }
                
                @media (max-width: 768px) {
                    .demo-nav {
                        min-width: 100%;
                        max-width: 100%;
                        border-right: none;
                        border-bottom: 1px solid #e9ecef;
                        height: auto;
                        max-height: 300px;
                    }
                }
            </style>
            
            <nav class="demo-nav">
                <div class="nav-header">
                    <h2 class="nav-title">🎵 Component Demos</h2>
                    <p class="nav-subtitle">Explore all available components</p>
                </div>
                
                <div class="nav-category">
                    <h3 class="category-title">🎹 Music Creation</h3>
                    <ul class="nav-links">
                        <li class="nav-item">
                            <a href="piano-roll-demo.html" class="nav-link" data-demo="piano-roll">
                                <span class="nav-link-icon">🎹</span>
                                <span class="nav-link-text">PianoRoll</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="chord-palette-demo.html" class="nav-link" data-demo="chord-palette">
                                <span class="nav-link-icon">🎼</span>
                                <span class="nav-link-text">ChordPalette</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="add-chord-demo.html" class="nav-link" data-demo="add-chord">
                                <span class="nav-link-icon">➕</span>
                                <span class="nav-link-text">AddChord</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="gigso-keyboard-demo.html" class="nav-link" data-demo="gigso-keyboard">
                                <span class="nav-link-icon">🎹</span>
                                <span class="nav-link-text">GigsoKeyboard</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="hand-pan-demo.html" class="nav-link" data-demo="hand-pan">
                                <span class="nav-link-icon">🥁</span>
                                <span class="nav-link-text">HandPan</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="hand-pan-wrapper-demo.html" class="nav-link" data-demo="hand-pan-wrapper">
                                <span class="nav-link-icon">🥁</span>
                                <span class="nav-link-text">HandPanWrapper</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="chord-wheel-demo.html" class="nav-link" data-demo="chord-wheel">
                                <span class="nav-link-icon">🎡</span>
                                <span class="nav-link-text">ChordWheel</span>
                            </a>
                        </li>
                    </ul>
                </div>
                
                <div class="nav-category">
                    <h3 class="category-title">🎸 Instruments</h3>
                    <ul class="nav-links">
                        <li class="nav-item">
                            <a href="fretboard-demo.html" class="nav-link" data-demo="fretboard">
                                <span class="nav-link-icon">🎸</span>
                                <span class="nav-link-text">Fretboard</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="chord-diagram-demo.html" class="nav-link" data-demo="chord-diagram">
                                <span class="nav-link-icon">📊</span>
                                <span class="nav-link-text">ChordDiagram</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="chromatic-tuner-demo.html" class="nav-link" data-demo="chromatic-tuner">
                                <span class="nav-link-icon">🎵</span>
                                <span class="nav-link-text">ChromaticTuner</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="scale-key-demo.html" class="nav-link" data-demo="scale-key">
                                <span class="nav-link-icon">🎼</span>
                                <span class="nav-link-text">ScaleKey</span>
                            </a>
                        </li>
                    </ul>
                </div>
                
                <div class="nav-category">
                    <h3 class="category-title">⏯️ Playback Controls</h3>
                    <ul class="nav-links">
                        <li class="nav-item">
                            <a href="transport-controls-demo.html" class="nav-link" data-demo="transport-controls">
                                <span class="nav-link-icon">⏯️</span>
                                <span class="nav-link-text">TransportControls</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="play-button-demo.html" class="nav-link" data-demo="play-button">
                                <span class="nav-link-icon">▶️</span>
                                <span class="nav-link-text">PlayButton</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="stop-button-demo.html" class="nav-link" data-demo="stop-button">
                                <span class="nav-link-icon">⏹️</span>
                                <span class="nav-link-text">StopButton</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="loop-button-demo.html" class="nav-link" data-demo="loop-button">
                                <span class="nav-link-icon">🔁</span>
                                <span class="nav-link-text">LoopButton</span>
                            </a>
                        </li>
                    </ul>
                </div>
                
                <div class="nav-category">
                    <h3 class="category-title">📊 Visual Feedback</h3>
                    <ul class="nav-links">
                        <li class="nav-item">
                            <a href="current-chord-demo.html" class="nav-link" data-demo="current-chord">
                                <span class="nav-link-icon">🎵</span>
                                <span class="nav-link-text">CurrentChord</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="eq-display-demo.html" class="nav-link" data-demo="eq-display">
                                <span class="nav-link-icon">📊</span>
                                <span class="nav-link-text">EQDisplay</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="frequency-monitor-demo.html" class="nav-link" data-demo="frequency-monitor">
                                <span class="nav-link-icon">📈</span>
                                <span class="nav-link-text">FrequencyMonitor</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="vu-meter-demo.html" class="nav-link" data-demo="vu-meter">
                                <span class="nav-link-icon">📊</span>
                                <span class="nav-link-text">VUMeter</span>
                            </a>
                        </li>
                    </ul>
                </div>
                
                <div class="nav-category">
                    <h3 class="category-title">🔧 Interface & Management</h3>
                    <ul class="nav-links">
                        <li class="nav-item">
                            <a href="gigso-menu-demo.html" class="nav-link" data-demo="gigso-menu">
                                <span class="nav-link-icon">☰</span>
                                <span class="nav-link-text">GigsoMenu</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="record-collection-demo.html" class="nav-link" data-demo="record-collection">
                                <span class="nav-link-icon">📚</span>
                                <span class="nav-link-text">RecordCollection</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="gigso-logo-demo.html" class="nav-link" data-demo="gigso-logo">
                                <span class="nav-link-icon">🎵</span>
                                <span class="nav-link-text">GigsoLogo</span>
                            </a>
                        </li>
                    </ul>
                </div>
                
                <div class="nav-category">
                    <h3 class="category-title">🌟 Special Features</h3>
                    <ul class="nav-links">
                        <li class="nav-item">
                            <a href="unclelele.html" class="nav-link" data-demo="unclelele">
                                <span class="nav-link-icon">🎵</span>
                                <span class="nav-link-text">Unclelele Workshop</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="chord-chart-parser-demo.html" class="nav-link" data-demo="chord-chart-parser">
                                <span class="nav-link-icon">📝</span>
                                <span class="nav-link-text">Chord Chart Parser</span>
                            </a>
                        </li>
                    </ul>
                </div>
                
                <div class="nav-footer">
                    <a href="index.html" class="nav-footer-link home">🏠 Back to Gigso Home</a>
                    <a href="demos.html" class="nav-footer-link">📚 All Demos Overview</a>
                    <a href="all-together-demo.html" class="nav-footer-link">🎵 Full Application Demo</a>
                </div>
            </nav>
        `;
        
        this.currentDemo = this.getCurrentDemoFromUrl();
        this.setupEventListeners();
        this.highlightCurrentDemo();
    }
    
    connectedCallback() {
        // Update current demo when component is connected
        this.currentDemo = this.getCurrentDemoFromUrl();
        this.highlightCurrentDemo();
    }
    
    getCurrentDemoFromUrl() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        
        // Extract demo name from filename (e.g., "piano-roll-demo.html" -> "piano-roll")
        if (filename && filename.includes('-demo.html')) {
            return filename.replace('-demo.html', '');
        }
        
        return null;
    }
    
    highlightCurrentDemo() {
        // Remove active class from all links
        const allLinks = this.shadowRoot.querySelectorAll('.nav-link');
        allLinks.forEach(link => link.classList.remove('active'));
        
        // Add active class to current demo link
        if (this.currentDemo) {
            const currentLink = this.shadowRoot.querySelector(`[data-demo="${this.currentDemo}"]`);
            if (currentLink) {
                currentLink.classList.add('active');
            }
        }
    }
    
    setupEventListeners() {
        // Handle navigation link clicks
        const navLinks = this.shadowRoot.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Add a small delay to show the click feedback
                setTimeout(() => {
                    // Navigation will happen naturally via href
                }, 150);
            });
        });
        
        // Listen for URL changes (for single-page app navigation if needed)
        window.addEventListener('popstate', () => {
            this.currentDemo = this.getCurrentDemoFromUrl();
            this.highlightCurrentDemo();
        });
    }
}

customElements.define('demo-navigation', DemoNavigation);
