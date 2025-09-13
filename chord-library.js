export default class chordLibrary {
  static chords = {
    'A': {
        'ukulele': {
            'positions': [
              2, 1, 0, 0
          ],
            'fingering': [2, 1, null, null],
            'difficulty': 'beginner',
            'name': 'Open A'
      },
      'guitar': {
          'positions': [
              0, 0, 2, 2, 2, 0
          ],
            'fingering': [null, null, 2, 2, 2, null],
            'difficulty': 'beginner',
            'name': 'Open A'
      },
      'mandolin': {
        'positions': [
            2, 2, 4, 5
        ],
            'fingering': [2, 2, 4, 5],
            'difficulty': 'intermediate',
            'name': 'A Major'
      }
    },
    'Am': {
        'ukulele': {
            'positions': [
                2, 0, 0, 0
            ],
            'fingering': [2, null, null, null],
            'difficulty': 'beginner',
            'name': 'Open Am'
        },
        'guitar': {
            'positions': [
                0, 0, 2, 2, 1, 0
            ],
            'fingering': [null, null, 2, 2, 1, null],
            'difficulty': 'beginner',
            'name': 'Open Am'
        },
        'mandolin': {
            'positions': [
                2, 2, 3, 5
            ],
            'fingering': [2, 2, 3, 5],
            'difficulty': 'intermediate',
            'name': 'Am'
        }
    },
    'Am7': {
        'ukulele': {
            'positions': [
                0, 0, 0, 0
            ],
        },
        'guitar': {
            'positions': [
                0, 0, 2, 0, 1, 0
            ]
        },
        'mandolin': {
            'positions': [
                2, 2, 3, 3
            ]
        }
    },
    'Bm': {
        'ukulele': {
            'positions': [
                4, 2, 2, 2
            ]
        },
        'guitar': {
            'positions': [
                0, 2, 4, 4, 3, 2
            ]
        },
        'mandolin': {
            'positions': [
                null, 0, 2, 2
            ]
        }
    },
    'C': {
        'ukulele': {
            'positions': [
                0, 0, 0, 3
            ],
        },
        'guitar': {
            'positions': [
                0, 3, 2, 0, 1, 0
            ]
        },
        'mandolin': {
            'positions': [
                0, 2, 3, 0
            ]
        }
    },
    'Cm': {
        'ukulele': {
            'positions': [
                0, 3, 3, 3
            ]
        },
        'guitar': {
            'positions': [
                null, 3, 5, 5, 4, 3
            ]
        },
        'mandolin': {
            'positions': [
                0, 1, 3, 3
            ]
        }
    },
    'Dm': {
        'ukulele': {
            'positions': [
                2, 2, 1, 0
            ],
        },
        'guitar': {
            'positions': [
                0, 0, 0, 2, 3, 1
            ]
        },
        'mandolin': {
            'positions': [
                null, 0, 0, 1
            ]
        }
    },
    'D7': {
        'ukulele': {
            'positions': [
                2, 0, 2, 0
            ],
        },
        'guitar': {
            'positions': [
                0, 0, 0, 2, 1, 2
            ]
        },
        'mandolin': {
            'positions': [
                null, 0, 3, 2
            ]
        }
    },
    'Em': {
        'ukulele': {
            'positions': [
                0, 4, 3, 2
            ],
        },
        'guitar': {
            'positions': [
                0, 2, 2, 0, 0, 0
            ]
        },
        'mandolin': {
            'positions': [
                0, 2, 2, 0
            ]
        }
    },
    'F': {
        'ukulele': {
            'positions': [
                2, 0, 1, 0
            ],
        },
        'guitar': {
            'positions': [
                0, 3, 3, 2, 1, 1
            ]
        },
        'mandolin': {
            'positions': [
                5, 3, 0, 1
            ]
        }
    },
    'G': {
        'ukulele': {
            'positions': [
                0, 2, 3, 2
            ],
        },
        'guitar': {
            'positions': [
                3, 2, 0, 0, 3, 3
            ]
        },
        'mandolin': {
            'positions': [
                0, 0, 2, 3
            ]
        }
    },
  };

  // Phase 3 Enhanced Methods for Multi-Instrument Support

  /**
   * Get all available chords for a specific instrument
   * @param {string} instrument - Instrument type
   * @returns {Array} Array of chord names
   */
  static getChordsForInstrument(instrument) {
    const chords = [];
    for (const [chordName, chordData] of Object.entries(this.chords)) {
      if (chordData[instrument]) {
        chords.push(chordName);
      }
    }
    return chords;
  }

  /**
   * Get chord data for a specific instrument and chord
   * @param {string} chordName - Name of the chord
   * @param {string} instrument - Instrument type
   * @returns {Object|null} Chord data or null if not found
   */
  static getChordData(chordName, instrument) {
    const chord = this.chords[chordName];
    if (!chord || !chord[instrument]) {
      return null;
    }
    return chord[instrument];
  }

  /**
   * Get chords by difficulty level for an instrument
   * @param {string} instrument - Instrument type
   * @param {string} difficulty - Difficulty level ('beginner', 'intermediate', 'advanced')
   * @returns {Array} Array of chord names
   */
  static getChordsByDifficulty(instrument, difficulty) {
    const chords = [];
    for (const [chordName, chordData] of Object.entries(this.chords)) {
      if (chordData[instrument] && chordData[instrument].difficulty === difficulty) {
        chords.push(chordName);
      }
    }
    return chords;
  }

  /**
   * Check if a chord exists for an instrument
   * @param {string} chordName - Name of the chord
   * @param {string} instrument - Instrument type
   * @returns {boolean} Whether the chord exists
   */
  static hasChord(chordName, instrument) {
    return this.chords[chordName] && this.chords[chordName][instrument];
  }

  /**
   * Get all supported instruments
   * @returns {Array} Array of instrument types
   */
  static getSupportedInstruments() {
    const instruments = new Set();
    for (const chordData of Object.values(this.chords)) {
      for (const instrument of Object.keys(chordData)) {
        instruments.add(instrument);
      }
    }
    return Array.from(instruments);
  }

  /**
   * Get chord variations for an instrument
   * @param {string} chordName - Name of the chord
   * @param {string} instrument - Instrument type
   * @returns {Array} Array of chord variations
   */
  static getChordVariations(chordName, instrument) {
    const chord = this.chords[chordName];
    if (!chord || !chord[instrument]) {
      return [];
    }
    
    // For now, return the single variation. This can be extended later
    return [{
      name: chord[instrument].name || chordName,
      positions: chord[instrument].positions,
      fingering: chord[instrument].fingering,
      difficulty: chord[instrument].difficulty
    }];
  }

  /**
   * Transpose chord positions for a different key
   * @param {Array} positions - Original chord positions
   * @param {number} semitones - Number of semitones to transpose
   * @returns {Array} Transposed positions
   */
  static transposeChordPositions(positions, semitones) {
    return positions.map(pos => {
      if (pos === null) return null;
      return pos + semitones;
    });
  }

  /**
   * Get chord notes for a specific instrument
   * @param {string} chordName - Name of the chord
   * @param {string} instrument - Instrument type
   * @param {Array} tuning - Instrument tuning
   * @returns {Array} Array of note names
   */
  static getChordNotes(chordName, instrument, tuning) {
    const chordData = this.getChordData(chordName, instrument);
    if (!chordData) return [];

    const notes = [];
    const positions = chordData.positions;
    
    for (let i = 0; i < positions.length; i++) {
      if (positions[i] !== null) {
        const openNote = tuning[i];
        const note = this.transposeNote(openNote, positions[i]);
        notes.push(note);
      }
    }
    
    return notes;
  }

  /**
   * Transpose a note by a number of semitones
   * @param {string} note - Note name
   * @param {number} semitones - Number of semitones to transpose
   * @returns {string} Transposed note
   */
  static transposeNote(note, semitones) {
    const chromaticScale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteIndex = chromaticScale.indexOf(note);
    if (noteIndex === -1) return note;
    
    const newIndex = (noteIndex + semitones) % 12;
    return chromaticScale[newIndex];
  }
};