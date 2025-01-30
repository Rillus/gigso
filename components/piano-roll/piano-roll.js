import State from '../../state/state.js';

const { loopActive } = State;

export default class PianoRoll extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        this.chordWidth = 100;
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
                    white-space: pre-wrap;
                    background: #f0f0f0;
                    padding: 10px;
                    border: 1px solid #ccc;
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
            <div class="chord-display"></div>
        `;
        this.reel = this.shadowRoot.querySelector('.reel');
        this.chordDisplay = this.shadowRoot.querySelector('.chord-display');
        this.chords = [];
        this.isPlaying = false;
        this.currentPosition = 0;
        this.endPosition = 400;
        this.chordPlaying = null
    }

    connectedCallback() {
        this.renderChords();

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
        })

        // Dispatch a "ready" event when the component is fully initialized
        const readyEvent = new CustomEvent('isReady');
        this.dispatchEvent(readyEvent);
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
            const chordBox = document.createElement('div');
            chordBox.classList.add('chord-box');
            
            const chordText = document.createElement('p');
            chordText.setAttribute('class', 'chordName')
            chordText.textContent = chord.name;
            chordBox.appendChild(chordText);
            const chordDiagram = document.createElement('chord-diagram');
            chordDiagram.setAttribute('chord', chord.name)
            chordBox.appendChild(chordDiagram);

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
            this.chords[chordIndex].startPosition = chordBox.offsetLeft;
        });
        this.endPosition = this.reel.offsetWidth;
    }

    removeChord(chordIndex) {
        this.chords.splice(chordIndex, 1);
        this.renderChords();
        this.updateChordDisplay();
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
        this.chordDisplay.textContent = JSON.stringify(this.chords, null, 2);
    }

    play() {
        if (this.chords.length === 0) {
            return;
        }
        this.isPlaying = true;
        this.scrollReel();
    }

    stop() {
        this.isPlaying = false;
        this.chordPlaying = null;
        this.currentPosition = 0;
        this.reel.style.transform = `translateX(0px)`;
    }

    pause() {
        this.isPlaying = false;
        this.chordPlaying = null;
    }

    scrollReel() {
        if (!this.isPlaying) return;
        if (this.currentPosition === 0) {
          this.playChord(this.chords[0], this.chords[0].duration);
          this.chordPlaying = 0;
        }
        this.currentPosition += 1;
        this.reel.style.transform = `translateX(-${this.currentPosition}px)`;
        
        const nextChord = this.chords[this.chordPlaying+1];

        
        if (this.chordPlaying < this.chords.length) {
            if (this.currentPosition >= this.endPosition) {
                if (loopActive()) {
                    this.currentPosition = 0;
                    this.chordPlaying = 0;
                } else {
                    this.pause();
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
        const event = new CustomEvent('play-chord', { detail: { chord, duration } });
        this.dispatchEvent(event);
    }
}

customElements.define('piano-roll', PianoRoll); 