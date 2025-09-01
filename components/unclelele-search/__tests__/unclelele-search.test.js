import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';
import UncleleleSearch from '../unclelele-search.js';


describe('UncleleleSearch Component', () => {
    let search;

    beforeEach(() => {
        document.body.innerHTML = '';
        search = document.createElement('unclelele-search');
        document.body.appendChild(search);
    });

    afterEach(() => {
        if (search && search.parentNode) {
            search.parentNode.removeChild(search);
        }
    });

    describe('Initialization', () => {
        test('should render search interface', () => {
            const searchContainer = search.shadowRoot.querySelector('.search-container');
            const searchInput = search.shadowRoot.getElementById('search-input');
            const searchButton = search.shadowRoot.getElementById('search-btn');
            
            expect(searchContainer).toBeTruthy();
            expect(searchInput).toBeTruthy();
            expect(searchButton).toBeTruthy();
        });

        test('should render filter controls', () => {
            const difficultyFilter = search.shadowRoot.getElementById('difficulty-filter');
            const genreFilter = search.shadowRoot.getElementById('genre-filter');
            const keyFilter = search.shadowRoot.getElementById('key-filter');
            
            expect(difficultyFilter).toBeTruthy();
            expect(genreFilter).toBeTruthy();
            expect(keyFilter).toBeTruthy();
        });

        test('should display all songs initially', () => {
            const songCards = search.shadowRoot.querySelectorAll('.song-card');
            expect(songCards.length).toBe(6);
        });

        test('should show correct results count', () => {
            const resultsCount = search.shadowRoot.getElementById('results-count');
            expect(resultsCount.textContent).toContain('Showing all 6 songs');
        });
    });

    describe('Search Functionality', () => {
        test('should filter songs by title', () => {
            const searchInput = search.shadowRoot.getElementById('search-input');
            
            fireEvent.input(searchInput, { target: { value: 'Don\'t Stop' } });
            
            const songCards = search.shadowRoot.querySelectorAll('.song-card');
            expect(songCards.length).toBe(1);
            expect(songCards[0].querySelector('.song-title').textContent).toBe('Don\'t Stop Believin\'');
        });

        test('should filter songs by artist', () => {
            const searchInput = search.shadowRoot.getElementById('search-input');
            
            fireEvent.input(searchInput, { target: { value: 'journey' } });
            
            const songCards = search.shadowRoot.querySelectorAll('.song-card');
            expect(songCards.length).toBe(1);
            expect(songCards[0].querySelector('.song-artist').textContent).toBe('by Journey');
        });

        test('should handle search on Enter key', () => {
            const searchInput = search.shadowRoot.getElementById('search-input');
            searchInput.value = 'U2';
            
            fireEvent.keyDown(searchInput, { key: 'Enter' });
            
            const songCards = search.shadowRoot.querySelectorAll('.song-card');
            expect(songCards.length).toBe(1);
        });

        test('should handle search button click', () => {
            const searchInput = search.shadowRoot.getElementById('search-input');
            const searchButton = search.shadowRoot.getElementById('search-btn');
            
            searchInput.value = 'Marley';
            fireEvent.click(searchButton);
            
            const songCards = search.shadowRoot.querySelectorAll('.song-card');
            expect(songCards.length).toBe(1);
        });
    });

    describe('Filter Functionality', () => {
        test('should filter by difficulty', () => {
            const difficultyFilter = search.shadowRoot.getElementById('difficulty-filter');
            
            fireEvent.change(difficultyFilter, { target: { value: 'beginner' } });
            
            const songCards = search.shadowRoot.querySelectorAll('.song-card');
            expect(songCards.length).toBe(5);
            expect(songCards[0].textContent).toContain('Don\'t Stop Believin\'');
        });

        test('should filter by genre', () => {
            const genreFilter = search.shadowRoot.getElementById('genre-filter');
            
            fireEvent.change(genreFilter, { target: { value: 'folk' } });
            
            const songCards = search.shadowRoot.querySelectorAll('.song-card');
            expect(songCards.length).toBe(2);
        });

        test('should filter by key', () => {
            const keyFilter = search.shadowRoot.getElementById('key-filter');
            
            fireEvent.change(keyFilter, { target: { value: 'G' } });
            
            const songCards = search.shadowRoot.querySelectorAll('.song-card');
            expect(songCards.length).toBe(1);
            expect(songCards[0].textContent).toContain('Leaving on a Jet Plane');
        });

        test('should combine multiple filters', () => {
            const difficultyFilter = search.shadowRoot.getElementById('difficulty-filter');
            const genreFilter = search.shadowRoot.getElementById('genre-filter');
            
            fireEvent.change(difficultyFilter, { target: { value: 'beginner' } });
            fireEvent.change(genreFilter, { target: { value: 'rock' } });
            
            const songCards = search.shadowRoot.querySelectorAll('.song-card');
            expect(songCards.length).toBe(2);
        });

        test('should clear all filters', () => {
            const searchInput = search.shadowRoot.getElementById('search-input');
            const difficultyFilter = search.shadowRoot.getElementById('difficulty-filter');
            const clearButton = search.shadowRoot.getElementById('clear-filters');
            
            // Apply some filters
            searchInput.value = 'test';
            fireEvent.change(difficultyFilter, { target: { value: 'beginner' } });
            
            // Clear filters
            fireEvent.click(clearButton);
            
            expect(searchInput.value).toBe('');
            expect(difficultyFilter.value).toBe('');
            
            const songCards = search.shadowRoot.querySelectorAll('.song-card');
            expect(songCards.length).toBe(6); // All songs should be shown
        });
    });

    describe('Song Display', () => {
        test('should display song details correctly', () => {
            const firstCard = search.shadowRoot.querySelector('.song-card');
            
            expect(firstCard.querySelector('.song-title')).toBeTruthy();
            expect(firstCard.querySelector('.song-artist')).toBeTruthy();
            expect(firstCard.querySelector('.song-details')).toBeTruthy();
            expect(firstCard.querySelectorAll('.detail-tag').length).toBeGreaterThan(0);
        });

        test('should show no results message when no songs match', () => {
            const searchInput = search.shadowRoot.getElementById('search-input');
            
            fireEvent.input(searchInput, { target: { value: 'nonexistent song' } });
            
            const noResults = search.shadowRoot.querySelector('.no-results');
            expect(noResults).toBeTruthy();
            expect(noResults.textContent).toContain('No songs found');
        });

        test('should dispatch song-selected event on card click', () => {
            const eventSpy = jest.fn();
            search.addEventListener('song-selected', eventSpy);
            
            const firstCard = search.shadowRoot.querySelector('.song-card');
            fireEvent.click(firstCard);
            
            expect(eventSpy).toHaveBeenCalled();
            expect(eventSpy.mock.calls[0][0].detail.id).toBe('dont-stop-believin');
        });
    });

    describe('Navigation', () => {
        test('should dispatch navigate-back event on back button click', () => {
            const eventSpy = jest.fn();
            search.addEventListener('navigate-back', eventSpy);
            
            const backButton = search.shadowRoot.getElementById('back-home');
            fireEvent.click(backButton);
            
            expect(eventSpy).toHaveBeenCalled();
            expect(eventSpy.mock.calls[0][0].detail.to).toBe('home');
        });

        test('should open chord parser on button click', () => {
            const originalOpen = window.open;
            window.open = jest.fn();
            
            const chordParserBtn = search.shadowRoot.getElementById('chord-parser-btn');
            fireEvent.click(chordParserBtn);
            
            expect(window.open).toHaveBeenCalledWith('chord-chart-parser-demo.html', '_blank');
            
            window.open = originalOpen;
        });
    });

    describe('Results Count', () => {
        test('should update results count when filtering', () => {
            const resultsCount = search.shadowRoot.getElementById('results-count');
            const difficultyFilter = search.shadowRoot.getElementById('difficulty-filter');
            
            fireEvent.change(difficultyFilter, { target: { value: 'beginner' } });
            
            expect(resultsCount.textContent).toContain('Showing 5 of 6 songs');
        });

        test('should show all songs count when no filters applied', () => {
            const resultsCount = search.shadowRoot.getElementById('results-count');
            expect(resultsCount.textContent).toContain('Showing all 6 songs');
        });
    });

    describe('Responsive Design', () => {
        test('should have mobile responsive styles', () => {
            const styles = search.shadowRoot.querySelector('style');
            expect(styles.textContent).toContain('@media (max-width: 768px)');
            expect(styles.textContent).toContain('flex-direction: column');
        });
    });
});