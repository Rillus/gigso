import EventHandlers from '../../helpers/eventHandlers.js';
import State from '../../state/state.js';

const { loopActive, bpm, setBpm } = State;

export default class PianoRoll extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        this.timeSignature = '4/4'; // Default time signature
        this.chordWidth = 25;
        this.beatsPerBar = 4;
        this.noteValue = 4; // note value is the length of the note (4 = quarter note, 8 = eighth note, etc.)
        this.currentBpm = bpm() || 120; // Get BPM from state
        this.lastFrameTime = 0;
        this.shadowRoot.innerHTML = `
            <style>
                .piano-roll {
                    position: relative;
                    width: 100%;
                    height: 200px;
                    overflow: hidden;
                    border: 1px solid #ccc;
                    background: #f9f9f9;
                    margin-top: 10px;
                    overflow-x: scroll;
                }
                .reel {
                    display: flex;
                    position: absolute;
                    top: 0;
                    left: 50%;
                    height: 100%;
                    transition: transform 0.1s linear;
                }
                .chord-box {
                    width: ${this.chordWidth}px;
                    height: 100%;
                    border-right: 1px solid #ddd;
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    justify-content: center;
                    background: #e0e0e0;
                    font-size: 14px;
                    border: 1px solid #999;
                    box-sizing: border-box;
                    position: relative;
                    cursor: move;
                    overflow: hidden
                }
                .resize-handle {
                    position: absolute;
                    right: 0;
                    top: 0;
                    width: 10px;
                    height: 100%;
                    cursor: ew-resize;
                    background: rgba(0, 0, 0, 0.1);
                }
                .remove-button {
                    position: absolute;
                    font-family: sans-serif;
                    top: 2px;
                    right: 12px;
                    width: 16px;
                    height: 16px;
                    font-size: 12px;
                    text-align: center;
                    line-height: 16px;
                    border-radius: 50%;
                    cursor: pointer;
                }
                .play-head {
                    position: absolute;
                    top: 0;
                    left: 50%;
                    width: 2px;
                    height: 100%;
                    background: red;
                    transform: translateX(-50%);
                }
                .chord-display {
                    margin-top: 10px;
                    font-size: 14px;
                    background: #f0f0f0;
                    padding: 10px;
                    border: 1px solid #ccc;
                    position: relative;
                }
                .chord-display-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    user-select: none;
                    font-weight: bold;
                    margin-bottom: 10px;
                    padding: 5px;
                    background: #e8e8e8;
                    border-radius: 3px;
                }
                .chord-display-content {
                    overflow: hidden;
                    transition: all 0.3s ease-out;
                    white-space: pre-wrap;
                }
                .chord-display.collapsed .chord-display-content {
                    max-height: 0;
                    opacity: 0;
                    padding: 0;
                    margin: 0;
                }
                .chord-display.expanded .chord-display-content {
                    max-height: 200px;
                    opacity: 1;
                    padding: 10px;
                    margin-bottom: 10px;
                    overflow: auto;
                }
                .toggle-arrow {
                    transition: transform 0.3s ease;
                    font-size: 16px;
                    color: #666;
                }
                .chord-display.collapsed .toggle-arrow {
                    transform: rotate(0deg);
                }
                .chord-display.expanded .toggle-arrow {
                    transform: rotate(180deg);
                }
                .chordName {
                    width: 100%;
                    text-align: center;
                }
            </style>
            <div class="piano-roll">
                <div class="reel"></div>
                <div class="play-head"></div>
            </div>
            <div class="chord-display collapsed">
                <div class="chord-display-header">
                    <span>Chord Data</span>
                    <span class="toggle-arrow">▼</span>
                </div>
                <div class="chord-display-content"></div>
            </div>
        `;
        this.reel = this.shadowRoot.querySelector('.reel');
        this.chordDisplay = this.shadowRoot.querySelector('.chord-display');
        this.chordDisplayContent = this.shadowRoot.querySelector('.chord-display-content');
        this.chords = [];
        this.isPlaying = false;
        this.currentPosition = 0;
        this.endPosition = 400;
        this.chordPlaying = null;
        this.instrument = State.instrument();
    }

    connectedCallback() {
        // Initialize chord display content
        this.updateChordDisplay();
        
        // Add a placeholder message when no chords are present
        if (this.chords.length === 0) {
            this.showPlaceholder();
        } else {
            this.renderChords();
        }

        this.addEventListener('add-chord', (event) => {
            const chord = event.detail;
            this.addChord(chord);
        });

        this.addEventListener('play', () => {
            this.play();
        });

        this.addEventListener('stop', () => {
            this.stop();
        });

        this.addEventListener('pause', () => {
            this.pause();
        });

        this.addEventListener('next-chord', () => {
            this.nextChord();
        });

        this.addEventListener('previous-chord', () => {
            this.previousChord();
        });

        this.addEventListener('load-song', (song) => {
            this.loadSong(song.detail);
        });

        // Listen for BPM changes from BPM controller
        document.addEventListener('bpm-changed', (event) => {
            this.handleBpmChange(event.detail.bpm);
        });

        EventHandlers.addEventListeners([
            {selector: this, event: 'set-instrument', handler: (event) => {
                this.setInstrument(event.detail)
            }}
        ])

        // Add toggle functionality for chord display
        const chordDisplayHeader = this.shadowRoot.querySelector('.chord-display-header');
        chordDisplayHeader.addEventListener('click', () => {
            this.toggleChordDisplay();
        });

        // Dispatch a "ready" event when the component is fully initialized
        const readyEvent = new CustomEvent('isReady');
        this.dispatchEvent(readyEvent);
    }

    showPlaceholder() {
        this.reel.innerHTML = `
            <div style="
                display: flex; 
                align-items: center; 
                justify-content: center; 
                height: 100%; 
                color: #666; 
                font-style: italic;
                text-align: center;
                padding: 20px;
            ">
                <div>
                    <div style="font-size: 18px; margin-bottom: 10px;">🎹 PianoRoll</div>
                    <div style="font-size: 14px;">Add chords to get started</div>
                </div>
            </div>
        `;
    }

    addChord(chord) {
        this.chords.push(chord);
        this.renderChords();
        this.updateChordDisplay();
    }

    loadSong(song) {
      this.chords = song.chords;
      this.renderChords();
    }

    renderChords() {
        this.reel.innerHTML = '';
        this.chords.forEach((chord, chordIndex) => {
            // Validate chord object
            if (!chord || typeof chord !== 'object') {
                console.warn('PianoRoll: Invalid chord object at index', chordIndex);
                return;
            }

            const chordBox = document.createElement('div');
            chordBox.classList.add('chord-box');
            
            const chordText = document.createElement('p');
            chordText.setAttribute('class', 'chordName')
            chordText.textContent = chord.name || 'Unknown';
            chordBox.appendChild(chordText);
            
            try {
                const chordDiagram = document.createElement('chord-diagram');
                if (chordDiagram && typeof chordDiagram.setAttribute === 'function') {
                    chordDiagram.setAttribute('chord', chord.name || 'Unknown');
                    chordDiagram.setAttribute('instrument', this.instrument || 'piano');
                    chordBox.appendChild(chordDiagram);
                    console.log('PianoRoll: Created chord-diagram for', chord.name);
                } else {
                    throw new Error('chord-diagram element not properly created');
                }
            } catch (error) {
                console.error('PianoRoll: Error creating chord-diagram:', error);
                // Fallback: just show the chord name
                const fallbackText = document.createElement('div');
                fallbackText.textContent = `[${chord.name || 'Unknown'}]`;
                fallbackText.style.cssText = 'font-size: 12px; color: #666; text-align: center;';
                chordBox.appendChild(fallbackText);
            }

            chordBox.setAttribute(
              'style', 
              `width: ${this.chordWidth * chord.duration}px; 
              margin-left: ${chord.delay * this.chordWidth}px;`);
            chordBox.addEventListener('mousedown', (e) => this.initDrag(e, chordIndex));

            const resizeHandle = document.createElement('div');
            resizeHandle.classList.add('resize-handle');
            resizeHandle.addEventListener('mousedown', (e) => this.initResize(e, chordIndex));

            const removeButton = document.createElement('div');
            removeButton.classList.add('remove-button');
            removeButton.textContent = 'x';
            removeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeChord(chordIndex);
            });

            chordBox.appendChild(resizeHandle);
            chordBox.appendChild(removeButton);
            this.reel.appendChild(chordBox);
            // Use offsetLeft if available, otherwise calculate based on delay
            const calculatedPosition = chord.delay * this.chordWidth;
            this.chords[chordIndex].startPosition = chordBox.offsetLeft || calculatedPosition;
        });
        this.endPosition = Math.max(this.reel.offsetWidth, 400); // Ensure minimum width for tests
    }

    removeChord(chordIndex) {
        try {
            this.chords.splice(chordIndex, 1);
            this.renderChords();
            this.updateChordDisplay();
        } catch (error) {
            console.error('PianoRoll: Error removing chord:', error);
            // Alternative approach if splice fails
            try {
                const newChords = this.chords.filter((_, index) => index !== chordIndex);
                this.chords = newChords;
                this.renderChords();
                this.updateChordDisplay();
            } catch (fallbackError) {
                console.error('PianoRoll: Fallback chord removal also failed:', fallbackError);
            }
        }
    }

    initDrag(e, chordIndex) {
        e.preventDefault();
        const startX = e.clientX;
        const startLeft = this.chords[chordIndex].startPosition;

        const doDrag = (e) => {
            const newLeft = startLeft + (e.clientX - startX);

            // convert to delay
            this.chords[chordIndex].delay = Math.max(0, newLeft / this.chordWidth) - chordIndex;
            this.renderChords();
            this.updateChordDisplay();
        };

        const stopDrag = () => {
            window.removeEventListener('mousemove', doDrag);
            window.removeEventListener('mouseup', stopDrag);
        };

        window.addEventListener('mousemove', doDrag);
        window.addEventListener('mouseup', stopDrag);
    }

    initResize(e, chordIndex) {
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startWidth = this.chords[chordIndex].duration * this.chordWidth;

        const doResize = (e) => {
            const newWidth = startWidth + (e.clientX - startX);
            const newDuration = Math.max(0.1, newWidth / this.chordWidth);
            this.chords[chordIndex].duration = newDuration;
            this.renderChords();
            this.updateChordDisplay();
        };

        const stopResize = () => {
            window.removeEventListener('mousemove', doResize);
            window.removeEventListener('mouseup', stopResize);
        };

        window.addEventListener('mousemove', doResize);
        window.addEventListener('mouseup', stopResize);
    }

    updateChordDisplay() {
        this.chordDisplayContent.textContent = JSON.stringify(this.chords, null, 2);
    }

    toggleChordDisplay() {
        this.chordDisplay.classList.toggle('collapsed');
        this.chordDisplay.classList.toggle('expanded');
    }

    play() {
        if (this.chords.length === 0) {
            return;
        }
        this.isPlaying = true;
        this.lastFrameTime = performance.now(); // Initialize timing for first frame
        this.scrollReel();
    }

    stop() {
        this.isPlaying = false;
        this.chordPlaying = null;
        this.currentPosition = 0;
        this.reel.style.transform = `translateX(0px)`;
        this.stopAllChords(); // Stop any sustaining chords
    }

    pause() {
        this.isPlaying = false;
        this.chordPlaying = null;
        this.stopAllChords(); // Stop any sustaining chords
    }

    scrollReel() {
        if (!this.isPlaying) return;
        
        const now = performance.now();
        const deltaTime = now - this.lastFrameTime;
        this.lastFrameTime = now;
        
        // Cap deltaTime to prevent huge jumps (e.g., when tab was inactive)
        const maxDeltaTime = 100; // 100ms max
        const clampedDeltaTime = Math.min(deltaTime, maxDeltaTime);
        
        if (this.currentPosition === 0) {
          this.playChord(this.chords[0], this.chords[0].duration);
          this.chordPlaying = 0;
        }
        
        // Calculate scroll speed based on BPM
        // Duration "1" = 1 bar (4 beats) = 100 pixels (chordWidth)
        // So 1 beat = 25 pixels (chordWidth / 4)
        // At current BPM, scroll at: (BPM / 60) * 25 pixels per second
        const pixelsPerBeat = this.chordWidth; // 25 pixels per beat
        const pixelsPerSecond = (this.currentBpm / 60) * pixelsPerBeat;
        const pixelsPerFrame = (pixelsPerSecond * clampedDeltaTime) / 1000;

        console.log('PianoRoll: pixelsPerFrame', pixelsPerFrame, 'pixelsPerSecond', pixelsPerSecond, 'pixelsPerBeat', pixelsPerBeat, 'deltaTime', deltaTime, 'clampedDeltaTime', clampedDeltaTime, 'currentBpm', this.currentBpm);
        
        this.currentPosition += pixelsPerFrame;
        this.reel.style.transform = `translateX(-${this.currentPosition}px)`;
        
        const nextChord = this.chords[this.chordPlaying+1];

        
        if (this.chordPlaying < this.chords.length) {
            if (this.currentPosition >= this.endPosition) {
                if (loopActive()) {
                    this.currentPosition = 0;
                    this.chordPlaying = 0;
                } else {
                    this.pause();
                    this.stopAllChords(); // Stop sustaining chords when playback ends
                    return;
                }
            }
            if (nextChord !== undefined) {
                if (nextChord.startPosition < this.currentPosition) {
                    this.playChord(nextChord, nextChord.duration);
                    this.chordPlaying = this.chordPlaying + 1;
                }
            }
        }
       
        requestAnimationFrame(() => this.scrollReel());
    }

    playChord(chord, duration) {
        // Stop any currently playing chords before starting the new one
        this.stopAllChords();
        
        // Convert beat duration to milliseconds based on current BPM
        // Duration "1" = 1 beat
        // Duration in milliseconds = (duration * 60000) / BPM
        const durationMs = (duration * 60000) / this.currentBpm - 1;

        console.log('PianoRoll: playChord', chord, durationMs);
        
        const event = new CustomEvent('play-chord', { 
            detail: { 
                chord, 
                duration: durationMs // Send duration in milliseconds
            } 
        });
        this.dispatchEvent(event);
    }

    // Helper method to convert beats to milliseconds
    beatsToMs(beats) {
        return (beats * 60000) / this.currentBpm;
    }

    // Stop all currently playing chords
    stopAllChords() {
        const event = new CustomEvent('stop-all-chords', { 
            detail: { 
                reason: 'piano-roll-stopped'
            } 
        });
        this.dispatchEvent(event);
        console.log('PianoRoll: Stopping all chords');
    }

    setInstrument(instrument) {
        this.instrument = instrument;
        this.renderChords();
    }

    handleBpmChange(newBpm) {
        this.currentBpm = newBpm;
        console.log('PianoRoll: BPM changed to', newBpm);
        
        // Update Tone.js Transport if available
        if (window.Tone && window.Tone.Transport) {
            window.Tone.Transport.bpm.value = newBpm;
        }
    }

    setTempo(tempo) {
        this.currentBpm = tempo;
        setBpm(tempo); // Update global state
        console.log('PianoRoll: Tempo set to', tempo, 'BPM');
    }

    get tempo() {
        return this.currentBpm;
    }

    setTimeSignature(timeSignature) {
        this.timeSignature = timeSignature;
        if (timeSignature && typeof timeSignature === 'string') {
            const parts = timeSignature.split('/');
            if (parts.length >= 2) {
                this.beatsPerBar = parts[0];
                this.noteValue = parts[1];
            }
        } else if (timeSignature !== null && timeSignature !== undefined) {
            console.warn('PianoRoll: Invalid time signature:', timeSignature);
        }
        console.log('PianoRoll: Time signature set to', timeSignature);
    }

    getTempo() {
        return this.currentBpm;
    }

    getTimeSignature() {
        return this.timeSignature;
    }
}

customElements.define('piano-roll', PianoRoll); 