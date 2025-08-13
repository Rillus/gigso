import BaseComponent from '../base-component.js';
import UkuleleSongLibrary from '../../ukulele-song-library.js';

export default class UncleleleSearch extends BaseComponent {
    constructor() {
        const template = `
            <div class="search-container">
                <div class="search-header">
                    <h2>🔍 Find Your Next Favorite Song</h2>
                    <div class="header-buttons">
                        <button class="tool-btn" id="chord-parser-btn">📝 Add New Song</button>
                        <button class="back-btn" id="back-home">← Back to Home</button>
                    </div>
                </div>
                
                <div class="search-controls">
                    <div class="search-input-group">
                        <input type="text" id="search-input" placeholder="Search songs, artists, or genres..." class="search-input">
                        <button id="search-btn" class="search-button">Search</button>
                    </div>
                    
                    <div class="filter-group">
                        <select id="difficulty-filter" class="filter-select">
                            <option value="">All Difficulties</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                        
                        <select id="genre-filter" class="filter-select">
                            <option value="">All Genres</option>
                            <option value="folk">Folk</option>
                            <option value="pop">Pop</option>
                            <option value="rock">Rock</option>
                            <option value="indie">Indie</option>
                            <option value="alternative">Alternative</option>
                            <option value="classic">Classic</option>
                        </select>
                        
                        <select id="key-filter" class="filter-select">
                            <option value="">All Keys</option>
                            <option value="C">Key of C</option>
                            <option value="G">Key of G</option>
                            <option value="D">Key of D</option>
                            <option value="A">Key of A</option>
                            <option value="Am">Key of Am</option>
                            <option value="Em">Key of Em</option>
                            <option value="F">Key of F</option>
                        </select>
                    </div>
                </div>
                
                <div class="results-info">
                    <span id="results-count"></span>
                    <button id="clear-filters" class="clear-btn">Clear Filters</button>
                </div>
                
                <div class="songs-grid" id="songs-grid">
                    <!-- Song cards will be populated here -->
                </div>
            </div>
        `;
        
        const styles = `
            .search-container {
                background: rgba(255,255,255,0.95);
                border-radius: 15px;
                padding: 30px;
                margin: 20px 0;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            
            .search-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                flex-wrap: wrap;
                gap: 15px;
            }
            
            .search-header h2 {
                color: var(--unclelele-primary, #2E8B57);
                margin: 0;
                font-size: 1.8em;
            }
            
            .header-buttons {
                display: flex;
                gap: 10px;
                align-items: center;
            }
            
            .back-btn, .tool-btn {
                border: none;
                padding: 10px 20px;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s;
                text-decoration: none;
                font-size: 0.9em;
            }
            
            .back-btn {
                background: var(--unclelele-secondary, #98D8C8);
                color: var(--unclelele-primary, #2E8B57);
            }
            
            .tool-btn {
                background: var(--unclelele-accent, #F7931E);
                color: white;
            }
            
            .back-btn:hover, .tool-btn:hover {
                transform: translateY(-2px);
            }
            
            .back-btn:hover {
                box-shadow: 0 4px 12px rgba(46, 139, 87, 0.3);
            }
            
            .tool-btn:hover {
                box-shadow: 0 4px 12px rgba(247, 147, 30, 0.3);
            }
            
            .search-controls {
                margin-bottom: 20px;
            }
            
            .search-input-group {
                display: flex;
                gap: 10px;
                margin-bottom: 15px;
            }
            
            .search-input {
                flex: 1;
                padding: 15px;
                border: 2px solid #ddd;
                border-radius: 8px;
                font-size: 1em;
                transition: border-color 0.2s;
            }
            
            .search-input:focus {
                outline: none;
                border-color: var(--unclelele-accent, #F7931E);
            }
            
            .search-button {
                background: var(--unclelele-accent, #F7931E);
                color: white;
                border: none;
                padding: 15px 25px;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .search-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(247, 147, 30, 0.3);
            }
            
            .filter-group {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }
            
            .filter-select {
                padding: 10px 15px;
                border: 2px solid #ddd;
                border-radius: 8px;
                background: white;
                font-size: 0.9em;
                cursor: pointer;
                transition: border-color 0.2s;
            }
            
            .filter-select:focus {
                outline: none;
                border-color: var(--unclelele-accent, #F7931E);
            }
            
            .results-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding: 10px 0;
                border-bottom: 1px solid #eee;
            }
            
            .clear-btn {
                background: transparent;
                color: #666;
                border: 1px solid #ddd;
                padding: 5px 15px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.9em;
                transition: all 0.2s;
            }
            
            .clear-btn:hover {
                background: #f5f5f5;
                border-color: #aaa;
            }
            
            .songs-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
            }
            
            .song-card {
                background: var(--unclelele-warm, #FFF8DC);
                border: 1px solid #e0e0e0;
                border-radius: 10px;
                padding: 20px;
                cursor: pointer;
                transition: all 0.2s;
                border-left: 4px solid var(--unclelele-accent, #F7931E);
            }
            
            .song-card:hover {
                transform: translateY(-3px);
                box-shadow: 0 6px 20px rgba(0,0,0,0.15);
                border-left-color: var(--unclelele-primary, #2E8B57);
            }
            
            .song-title {
                font-size: 1.2em;
                font-weight: bold;
                color: var(--unclelele-primary, #2E8B57);
                margin: 0 0 5px 0;
            }
            
            .song-artist {
                color: #666;
                font-style: italic;
                margin: 0 0 10px 0;
            }
            
            .song-details {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
                margin-bottom: 10px;
            }
            
            .detail-tag {
                background: rgba(46, 139, 87, 0.1);
                color: var(--unclelele-primary, #2E8B57);
                padding: 3px 8px;
                border-radius: 4px;
                font-size: 0.8em;
                font-weight: bold;
            }
            
            .difficulty-beginner { background: rgba(34, 197, 94, 0.2); color: #059669; }
            .difficulty-intermediate { background: rgba(247, 147, 30, 0.2); color: #D97706; }
            .difficulty-advanced { background: rgba(239, 68, 68, 0.2); color: #DC2626; }
            
            .song-preview {
                color: #555;
                font-size: 0.9em;
                margin-top: 10px;
            }
            
            .no-results {
                text-align: center;
                color: #666;
                font-size: 1.1em;
                margin: 40px 0;
            }
            
            @media (max-width: 768px) {
                .search-header {
                    flex-direction: column;
                    text-align: center;
                }
                
                .header-buttons {
                    flex-direction: column;
                    gap: 15px;
                }
                
                .filter-group {
                    flex-direction: column;
                }
                
                .filter-select {
                    width: 100%;
                }
                
                .results-info {
                    flex-direction: column;
                    gap: 10px;
                    text-align: center;
                }
                
                .songs-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
        
        super(template, styles);
        
        this.songs = UkuleleSongLibrary.songs;
        this.filteredSongs = [...this.songs];
        
        this.setupEventListeners();
        this.renderSongs();
        this.updateResultsCount();
    }
    
    setupEventListeners() {
        const backBtn = this.shadowRoot.getElementById('back-home');
        const chordParserBtn = this.shadowRoot.getElementById('chord-parser-btn');
        const searchBtn = this.shadowRoot.getElementById('search-btn');
        const searchInput = this.shadowRoot.getElementById('search-input');
        const difficultyFilter = this.shadowRoot.getElementById('difficulty-filter');
        const genreFilter = this.shadowRoot.getElementById('genre-filter');
        const keyFilter = this.shadowRoot.getElementById('key-filter');
        const clearFiltersBtn = this.shadowRoot.getElementById('clear-filters');
        
        backBtn.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('navigate-back', { 
                detail: { to: 'home' },
                bubbles: true 
            }));
        });
        
        chordParserBtn.addEventListener('click', () => {
            window.open('chord-chart-parser-demo.html', '_blank');
        });
        
        searchBtn.addEventListener('click', () => this.performSearch());
        
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
        
        searchInput.addEventListener('input', () => this.performSearch());
        
        [difficultyFilter, genreFilter, keyFilter].forEach(filter => {
            filter.addEventListener('change', () => this.performSearch());
        });
        
        clearFiltersBtn.addEventListener('click', () => {
            searchInput.value = '';
            difficultyFilter.value = '';
            genreFilter.value = '';
            keyFilter.value = '';
            this.performSearch();
        });
    }
    
    performSearch() {
        const query = this.shadowRoot.getElementById('search-input').value.toLowerCase();
        const difficulty = this.shadowRoot.getElementById('difficulty-filter').value;
        const genre = this.shadowRoot.getElementById('genre-filter').value;
        const key = this.shadowRoot.getElementById('key-filter').value;
        
        this.filteredSongs = this.songs.filter(song => {
            const matchesQuery = !query || 
                song.title.toLowerCase().includes(query) ||
                song.artist.toLowerCase().includes(query) ||
                (song.genre && song.genre.toLowerCase().includes(query)) ||
                (song.tags && song.tags.some(tag => tag.toLowerCase().includes(query)));
            
            const matchesDifficulty = !difficulty || song.difficulty === difficulty;
            const matchesGenre = !genre || song.genre === genre;
            const matchesKey = !key || song.key === key;
            
            return matchesQuery && matchesDifficulty && matchesGenre && matchesKey;
        });
        
        this.renderSongs();
        this.updateResultsCount();
    }
    
    renderSongs() {
        const grid = this.shadowRoot.getElementById('songs-grid');
        
        if (this.filteredSongs.length === 0) {
            grid.innerHTML = '<div class="no-results">No songs found matching your criteria. Try adjusting your search or filters.</div>';
            return;
        }
        
        grid.innerHTML = this.filteredSongs.map(song => `
            <div class="song-card" data-song-id="${song.id}">
                <h3 class="song-title">${song.title}</h3>
                <p class="song-artist">by ${song.artist}</p>
                <div class="song-details">
                    <span class="detail-tag difficulty-${song.difficulty}">${song.difficulty}</span>
                    <span class="detail-tag">Key of ${song.key}</span>
                    <span class="detail-tag">${song.genre}</span>
                    ${song.tempo ? `<span class="detail-tag">${song.tempo} BPM</span>` : ''}
                </div>
                <div class="song-preview">
                    ${song.chordProgression ? `Chords: ${song.chordProgression.slice(0, 4).join(' - ')}${song.chordProgression.length > 4 ? '...' : ''}` : ''}
                </div>
            </div>
        `).join('');
        
        // Add click listeners to song cards
        grid.querySelectorAll('.song-card').forEach(card => {
            card.addEventListener('click', () => {
                const songId = card.getAttribute('data-song-id');
                this.dispatchEvent(new CustomEvent('song-selected', {
                    detail: { id: songId },
                    bubbles: true
                }));
            });
        });
    }
    
    updateResultsCount() {
        const countElement = this.shadowRoot.getElementById('results-count');
        const count = this.filteredSongs.length;
        const total = this.songs.length;
        
        if (count === total) {
            countElement.textContent = `Showing all ${total} songs`;
        } else {
            countElement.textContent = `Showing ${count} of ${total} songs`;
        }
    }
}

customElements.define('unclelele-search', UncleleleSearch);