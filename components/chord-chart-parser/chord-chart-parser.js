import BaseComponent from '../base-component.js';

const template = `
    <div class="chord-chart-parser">
        <div class="input-section">
            <h3>Chord Chart Parser</h3>
            <textarea 
                id="chord-chart-input" 
                placeholder="Paste your chord chart here..."
                rows="20"
                cols="80"
            ></textarea>
            <div class="controls">
                <button id="parse-btn">Parse to JSON Format</button>
                <button id="clear-btn">Clear</button>
            </div>
        </div>
        
        <div class="output-section">
            <h4>Song Metadata</h4>
            <div class="metadata-inputs">
                <input type="text" id="song-title" placeholder="Song Title">
                <input type="text" id="artist" placeholder="Artist">
                <input type="text" id="key" placeholder="Key (e.g., C)">
                <select id="difficulty">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                </select>
                <input type="text" id="genre" placeholder="Genre">
                <input type="number" id="tempo" placeholder="Tempo (BPM)" min="60" max="200">
                <input type="text" id="strumming-pattern" placeholder="Strumming Pattern (e.g., D-U-D-U)">
            </div>
            
            <h4>Parsed Lyrics</h4>
            <textarea 
                id="parsed-output" 
                rows="20"
                cols="80"
                readonly
            ></textarea>
            
            <h4>Full JSON Object</h4>
            <textarea 
                id="json-output" 
                rows="10"
                cols="80"
                readonly
            ></textarea>
            
            <button id="copy-json">Copy JSON</button>
        </div>
    </div>
`;

const styles = `
    .chord-chart-parser {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;
    }
    
    .input-section, .output-section {
        display: flex;
        flex-direction: column;
    }
    
    textarea {
        font-family: monospace;
        font-size: 14px;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
        resize: vertical;
        margin-bottom: 15px;
    }
    
    .controls {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
    }
    
    button {
        padding: 10px 15px;
        background: #007acc;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    }
    
    button:hover {
        background: #005999;
    }
    
    .metadata-inputs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-bottom: 20px;
    }
    
    .metadata-inputs input,
    .metadata-inputs select {
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;
    }
    
    h3, h4 {
        color: #333;
        margin-bottom: 15px;
    }
    
    @media (max-width: 900px) {
        .chord-chart-parser {
            grid-template-columns: 1fr;
        }
        
        .metadata-inputs {
            grid-template-columns: 1fr;
        }
    }
`;

export default class ChordChartParser extends BaseComponent {
    constructor() {
        super(template, styles);
        this.addEventListeners();
    }
    
    addEventListeners() {
        const parseBtn = this.shadowRoot.getElementById('parse-btn');
        const clearBtn = this.shadowRoot.getElementById('clear-btn');
        const copyBtn = this.shadowRoot.getElementById('copy-json');
        
        parseBtn.addEventListener('click', () => this.parseChordChart());
        clearBtn.addEventListener('click', () => this.clearInputs());
        copyBtn.addEventListener('click', () => this.copyJson());
    }
    
    parseChordChart() {
        const input = this.shadowRoot.getElementById('chord-chart-input').value;
        if (!input.trim()) return;
        
        const parsedLyrics = this.convertToUkuleleFormat(input);
        const chordProgression = this.extractChordProgression(input);
        
        this.shadowRoot.getElementById('parsed-output').value = parsedLyrics;
        
        // Generate full JSON object
        const songData = this.generateSongObject(parsedLyrics, chordProgression);
        this.shadowRoot.getElementById('json-output').value = JSON.stringify(songData, null, 2);
    }
    
    convertToUkuleleFormat(input) {
        const lines = input.split('\n');
        const result = [];
        let currentSection = '';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();
            
            // Skip empty lines initially, we'll add them back strategically
            if (!trimmedLine) {
                continue;
            }
            
            // Detect section headers like [Verse 1], [Chorus], etc.
            if (trimmedLine.match(/^\[.*\]$/)) {
                if (result.length > 0) {
                    // Add two blank lines before new section (unless it's the first section)
                    result.push('');
                    result.push('');
                }
                result.push(trimmedLine);
                currentSection = trimmedLine;
                continue;
            }
            
            // Check if this is a chord line (contains chord symbols)
            const isChordLine = this.isChordLine(trimmedLine);
            const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
            const nextLineTrimmed = nextLine.trim();
            const isNextLineLyrics = nextLineTrimmed && !this.isChordLine(nextLineTrimmed) && !nextLineTrimmed.match(/^\[.*\]$/);
            
            if (isChordLine && isNextLineLyrics) {
                // This is a chord line followed by lyrics - merge them (preserve original spacing)
                const mergedLine = this.mergeChordAndLyricLine(line, nextLine);
                result.push(mergedLine);
                i++; // Skip the next line since we processed it
            } else if (isChordLine) {
                // This is a chord line without lyrics (like instrumental sections)
                result.push(this.convertChordOnlyLine(trimmedLine));
            } else {
                // This is a regular lyric line or other text
                result.push(trimmedLine);
            }
        }
        
        // Join and clean up excessive line breaks
        let finalResult = result.join('\n');
        
        // Replace any triple or more line breaks with just double line breaks
        finalResult = finalResult.replace(/\n{3,}/g, '\n\n');
        
        return finalResult;
    }
    
    isChordLine(line) {
        // A line is considered a chord line if it contains chord symbols
        // Common chord patterns: C, G, Am, F, D7, etc.
        const chordPattern = /\b[A-G](m|maj|min|dim|aug|\d+|sus[24]?|add\d+|#|b)*\b/g;
        const chords = line.match(chordPattern) || [];
        const nonChordText = line.replace(chordPattern, '').trim();
        
        // If the line has chords and minimal other text, it's likely a chord line
        return chords.length > 0 && (nonChordText.length < line.length / 2 || nonChordText === '');
    }
    
    mergeChordAndLyricLine(chordLine, lyricLine) {
        const chords = [];
        const positions = [];
        
        // Extract chord positions and names from the original chord line (with spaces)
        const chordPattern = /\b[A-G](m|maj|min|dim|aug|\d+|sus[24]?|add\d+|#|b)*\b/g;
        let match;
        
        while ((match = chordPattern.exec(chordLine)) !== null) {
            chords.push(match[0]);
            positions.push(match.index);
        }
        
        // Sort chords by position (in case they're not in order)
        const chordsAndPositions = chords.map((chord, i) => ({
            chord,
            position: positions[i]
        })).sort((a, b) => a.position - b.position);
        
        // Start with the lyric line, trimming it for processing
        let result = lyricLine.trim();
        
        // Insert chords at their exact positions from the chord line, working backwards
        for (let i = chordsAndPositions.length - 1; i >= 0; i--) {
            const { chord, position } = chordsAndPositions[i];
            
            // The position in the chord line corresponds directly to the character position
            // we want in the final result
            let insertPos = Math.min(position, result.length);
            
            const chordTag = `{${chord}}`;
            result = result.slice(0, insertPos) + chordTag + result.slice(insertPos);
        }
        
        return result;
    }
    
    convertChordOnlyLine(line) {
        // Convert chord-only lines to the {chord} format
        const chordPattern = /\b[A-G](m|maj|min|dim|aug|\d+|sus[24]?|add\d+|#|b)*\b/g;
        return line.replace(chordPattern, '{$&}');
    }
    
    extractChordProgression(input) {
        const chordPattern = /\b[A-G](m|maj|min|dim|aug|\d+|sus[24]?|add\d+|#|b)*\b/g;
        const allChords = input.match(chordPattern) || [];
        
        // Get unique chords in order of appearance
        const uniqueChords = [];
        for (const chord of allChords) {
            if (!uniqueChords.includes(chord)) {
                uniqueChords.push(chord);
            }
        }
        
        return uniqueChords;
    }
    
    generateSongObject(lyrics, chordProgression) {
        // Get metadata from form inputs
        const title = this.shadowRoot.getElementById('song-title').value || 'Untitled Song';
        const artist = this.shadowRoot.getElementById('artist').value || 'Unknown Artist';
        const key = this.shadowRoot.getElementById('key').value || 'C';
        const difficulty = this.shadowRoot.getElementById('difficulty').value || 'beginner';
        const genre = this.shadowRoot.getElementById('genre').value || 'folk';
        const tempo = parseInt(this.shadowRoot.getElementById('tempo').value) || 120;
        const strummingPattern = this.shadowRoot.getElementById('strumming-pattern').value || 'D-D-U-U-D-U';
        
        // Generate ID from title
        const id = title.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-');
        
        return {
            id,
            title,
            artist,
            key,
            difficulty,
            genre,
            tempo,
            chordProgression,
            strummingPattern,
            strummingNotes: 'Adjust tempo and dynamics as needed',
            tags: [difficulty + '-friendly'],
            lyrics: lyrics
        };
    }
    
    clearInputs() {
        this.shadowRoot.getElementById('chord-chart-input').value = '';
        this.shadowRoot.getElementById('parsed-output').value = '';
        this.shadowRoot.getElementById('json-output').value = '';
        
        // Clear metadata inputs
        this.shadowRoot.getElementById('song-title').value = '';
        this.shadowRoot.getElementById('artist').value = '';
        this.shadowRoot.getElementById('key').value = '';
        this.shadowRoot.getElementById('genre').value = '';
        this.shadowRoot.getElementById('tempo').value = '';
        this.shadowRoot.getElementById('strumming-pattern').value = '';
        this.shadowRoot.getElementById('difficulty').selectedIndex = 0;
    }
    
    async copyJson() {
        const jsonOutput = this.shadowRoot.getElementById('json-output').value;
        if (!jsonOutput) return;
        
        try {
            await navigator.clipboard.writeText(jsonOutput);
            
            // Provide visual feedback
            const btn = this.shadowRoot.getElementById('copy-json');
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            btn.style.background = '#28a745';
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '#007acc';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
        }
    }
}

customElements.define('chord-chart-parser', ChordChartParser);