const fs = require('fs');
const path = require('path');

// Component configurations
const components = [
    {
        name: 'HandPan',
        icon: '🥁',
        description: 'Interactive hand pan (hang drum) instrument for touch-screen play with soothing synthesized tones',
        file: 'components/hand-pan/hand-pan.js',
        demoFile: 'demos/hand-pan-demo.html'
    },
    {
        name: 'HandPanWrapper',
        icon: '🥁',
        description: 'Complete drop-in wrapper component with audio management, key selection, size controls, and event logging',
        file: 'components/hand-pan-wrapper/hand-pan-wrapper.js',
        demoFile: 'demos/hand-pan-wrapper-demo.html'
    },
    {
        name: 'Fretboard',
        icon: '🎸',
        description: 'Interactive guitar fretboard component for chord and scale visualization',
        file: 'components/fretboard/fretboard.js',
        demoFile: 'demos/fretboard-demo.html'
    },
    {
        name: 'PianoRoll',
        icon: '🎹',
        description: 'Visual timeline interface for arranging and playing chord progressions',
        file: 'components/piano-roll/piano-roll.js',
        demoFile: 'demos/piano-roll-demo.html'
    },
    {
        name: 'ChordPalette',
        icon: '🎼',
        description: 'Pre-defined chord library for quick chord selection',
        file: 'components/chord-palette/chord-palette.js',
        demoFile: 'demos/chord-palette-demo.html'
    },
    {
        name: 'AddChord',
        icon: '➕',
        description: 'Form interface for creating custom chords',
        file: 'components/add-chord/add-chord.js',
        demoFile: 'demos/add-chord-demo.html'
    },
    {
        name: 'GigsoKeyboard',
        icon: '🎹',
        description: 'Interactive piano keyboard for note playback and visual feedback',
        file: 'components/gigso-keyboard/gigso-keyboard.js',
        demoFile: 'demos/gigso-keyboard-demo.html'
    },
    {
        name: 'CurrentChord',
        icon: '🎵',
        description: 'Displays the currently selected or playing chord',
        file: 'components/current-chord/current-chord.js',
        demoFile: 'demos/current-chord-demo.html'
    },
    {
        name: 'ChordDiagram',
        icon: '📊',
        description: 'Visual representation of chord fingerings',
        file: 'components/chord-diagram/chord-diagram.js',
        demoFile: 'demos/chord-diagram-demo.html'
    },
    {
        name: 'TransportControls',
        icon: '⏯️',
        description: 'Container component for playback control buttons',
        file: 'components/transport-controls/transport-controls.js',
        demoFile: 'demos/transport-controls-demo.html'
    },
    {
        name: 'PlayButton',
        icon: '▶️',
        description: 'Initiates playback of the current song',
        file: 'components/play-button/play-button.js',
        demoFile: 'demos/play-button-demo.html'
    },
    {
        name: 'StopButton',
        icon: '⏹️',
        description: 'Stops playback and resets to beginning',
        file: 'components/stop-button/stop-button.js',
        demoFile: 'demos/stop-button-demo.html'
    },
    {
        name: 'LoopButton',
        icon: '🔁',
        description: 'Toggles loop playback mode',
        file: 'components/loop-button/loop-button.js',
        demoFile: 'demos/loop-button-demo.html'
    },
    {
        name: 'RecordCollection',
        icon: '📚',
        description: 'Displays and loads songs from the song library',
        file: 'components/record-collection/record-collection.js',
        demoFile: 'demos/record-collection-demo.html'
    },
    {
        name: 'GigsoMenu',
        icon: '☰',
        description: 'Toggle interface for showing/hiding components',
        file: 'components/gigso-menu/gigso-menu.js',
        demoFile: 'demos/gigso-menu-demo.html'
    },
    {
        name: 'ChromaticTuner',
        icon: '🎵',
        description: 'Chromatic tuner for instrument tuning',
        file: 'components/chromatic-tuner/chromatic-tuner.js',
        demoFile: 'demos/chromatic-tuner-demo.html'
    },
    {
        name: 'EQDisplay',
        icon: '📊',
        description: 'Equalizer display component',
        file: 'components/eq-display/eq-display.js',
        demoFile: 'demos/eq-display-demo.html'
    },
    {
        name: 'FrequencyMonitor',
        icon: '📈',
        description: 'Frequency monitoring and analysis component',
        file: 'components/frequency-monitor/frequency-monitor.js',
        demoFile: 'demos/frequency-monitor-demo.html'
    },
    {
        name: 'GigsoLogo',
        icon: '🎵',
        description: 'Gigso application logo component',
        file: 'components/gigso-logo/gigso-logo.js',
        demoFile: 'demos/gigso-logo-demo.html'
    },
    {
        name: 'ScaleKey',
        icon: '🎼',
        description: 'Scale and key selection component',
        file: 'components/scale-key/scale-key.js',
        demoFile: 'demos/scale-key-demo.html'
    },
    {
        name: 'VUMeter',
        icon: '📊',
        description: 'Volume unit meter for audio visualization',
        file: 'components/vu-meter/vu-meter.js',
        demoFile: 'demos/vu-meter-demo.html'
    }
];

// Read template
const template = fs.readFileSync('demo-template.html', 'utf8');

// Create demos directory if it doesn't exist
if (!fs.existsSync('demos')) {
    fs.mkdirSync('demos');
}

// Generate demo pages for each component
components.forEach(component => {
    console.log(`Generating demo for ${component.name}...`);
    
    // Read component documentation if it exists
    let overviewContent = '';
    let apiContent = '';
    let eventsContent = '';
    let examplesContent = '';
    
    const docPath = `documents/components/${component.name.toLowerCase().replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-')}.md`;
    
    if (fs.existsSync(docPath)) {
        const docContent = fs.readFileSync(docPath, 'utf8');
        
        // Extract sections from documentation
        const sections = docContent.split(/(?=^## )/m);
        
        sections.forEach(section => {
            if (section.includes('## Overview') || section.includes('## Purpose')) {
                overviewContent = section.replace(/^## [^\n]+\n/, '');
            } else if (section.includes('## Inputs') || section.includes('## Properties')) {
                apiContent += section;
            } else if (section.includes('## Events') || section.includes('## Outputs')) {
                eventsContent += section;
            } else if (section.includes('## Integration') || section.includes('## Usage')) {
                examplesContent += section;
            }
        });
    }
    
    // Generate component-specific controls
    const controls = generateControls(component);
    
    // Generate component-specific script
    const script = generateScript(component);
    
    // Replace template placeholders
    let demoContent = template
        .replace(/{{COMPONENT_NAME}}/g, component.name)
        .replace(/{{COMPONENT_ICON}}/g, component.icon)
        .replace(/{{COMPONENT_DESCRIPTION}}/g, component.description)
        .replace(/{{OVERVIEW_CONTENT}}/g, overviewContent || `<p>${component.description}</p>`)
        .replace(/{{API_CONTENT}}/g, apiContent || '<p>API documentation will be available soon.</p>')
        .replace(/{{EVENTS_CONTENT}}/g, eventsContent || '<p>Events documentation will be available soon.</p>')
        .replace(/{{EXAMPLES_CONTENT}}/g, examplesContent || '<p>Usage examples will be available soon.</p>')
        .replace(/{{COMPONENT_SCRIPT}}/g, script);
    
    // Insert controls into the template
    const controlsMatch = demoContent.match(/<div class="controls-grid" id="controls-grid">\s*<!-- Controls will be inserted here -->\s*<\/div>/);
    if (controlsMatch) {
        demoContent = demoContent.replace(
            controlsMatch[0],
            `<div class="controls-grid" id="controls-grid">\n${controls}\n</div>`
        );
    }
    
    // Insert component into the template
    const componentMatch = demoContent.match(/<div class="component-container" id="component-container">\s*<!-- Component will be inserted here -->\s*<\/div>/);
    if (componentMatch) {
        const componentTag = component.name.toLowerCase().replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-');
        demoContent = demoContent.replace(
            componentMatch[0],
            `<div class="component-container" id="component-container">\n<${componentTag} id="demo-component"></${componentTag}>\n</div>`
        );
    }
    
    // Write demo file
    fs.writeFileSync(component.demoFile, demoContent);
    console.log(`✓ Generated ${component.demoFile}`);
});

function generateControls(component) {
    const componentName = component.name.toLowerCase().replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-');
    
    switch (component.name) {
        case 'HandPan':
            return `
                <div class="control-group">
                    <label for="key-select">Key:</label>
                    <select id="key-select">
                        <option value="C">C</option>
                        <option value="D" selected>D</option>
                        <option value="E">E</option>
                        <option value="F">F</option>
                        <option value="G">G</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                    </select>
                </div>
                <div class="control-group">
                    <label for="scale-select">Scale:</label>
                    <select id="scale-select">
                        <option value="major">Major</option>
                        <option value="minor" selected>Minor</option>
                    </select>
                </div>
                <div class="control-group">
                    <label for="size-select">Size:</label>
                    <select id="size-select">
                        <option value="small">Small</option>
                        <option value="medium" selected>Medium</option>
                        <option value="large">Large</option>
                    </select>
                </div>
                <div class="control-group">
                    <label>Actions:</label>
                    <button id="mute-btn">Mute</button>
                    <button id="unmute-btn" class="secondary">Unmute</button>
                </div>
            `;
            
        case 'Fretboard':
            return `
                <div class="control-group">
                    <label for="instrument-select">Instrument:</label>
                    <select id="instrument-select">
                        <option value="guitar" selected>Guitar (6-string)</option>
                        <option value="ukulele">Ukulele (4-string)</option>
                        <option value="mandolin">Mandolin (8-string)</option>
                    </select>
                </div>
                <div class="control-group">
                    <label for="chord-select">Chord:</label>
                    <select id="chord-select">
                        <option value="">-- Select Chord --</option>
                        <option value="C">C Major</option>
                        <option value="Am">A Minor</option>
                        <option value="F">F Major</option>
                        <option value="G">G Major</option>
                    </select>
                </div>
                <div class="control-group">
                    <label for="scale-root">Scale Root:</label>
                    <select id="scale-root">
                        <option value="">-- Select Root --</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                        <option value="E">E</option>
                        <option value="F">F</option>
                        <option value="G">G</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                    </select>
                </div>
                <div class="control-group">
                    <label for="scale-type">Scale Type:</label>
                    <select id="scale-type">
                        <option value="">-- Select Scale --</option>
                        <option value="major">Major</option>
                        <option value="naturalMinor">Natural Minor</option>
                        <option value="pentatonicMajor">Pentatonic Major</option>
                        <option value="pentatonicMinor">Pentatonic Minor</option>
                    </select>
                </div>
                <div class="control-group">
                    <label>Actions:</label>
                    <button id="clear-display">Clear Display</button>
                    <button id="update-range" class="secondary">Update Range</button>
                </div>
            `;
            
        case 'PianoRoll':
            return `
                <div class="control-group">
                    <label for="tempo-input">Tempo (BPM):</label>
                    <input type="number" id="tempo-input" value="120" min="60" max="200">
                </div>
                <div class="control-group">
                    <label for="time-signature">Time Signature:</label>
                    <select id="time-signature">
                        <option value="4/4" selected>4/4</option>
                        <option value="3/4">3/4</option>
                        <option value="6/8">6/8</option>
                    </select>
                </div>
                <div class="control-group">
                    <label>Actions:</label>
                    <button id="play-roll">Play</button>
                    <button id="stop-roll" class="secondary">Stop</button>
                    <button id="clear-roll">Clear</button>
                </div>
            `;
            
        case 'ChordPalette':
            return `
                <div class="control-group">
                    <label for="category-select">Category:</label>
                    <select id="category-select">
                        <option value="major">Major</option>
                        <option value="minor">Minor</option>
                        <option value="diminished">Diminished</option>
                        <option value="augmented">Augmented</option>
                    </select>
                </div>
                <div class="control-group">
                    <label for="root-select">Root Note:</label>
                    <select id="root-select">
                        <option value="C">C</option>
                        <option value="D">D</option>
                        <option value="E">E</option>
                        <option value="F">F</option>
                        <option value="G">G</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                    </select>
                </div>
                <div class="control-group">
                    <label>Actions:</label>
                    <button id="add-chord">Add to Progression</button>
                    <button id="clear-progression" class="secondary">Clear Progression</button>
                </div>
            `;
            
        case 'GigsoKeyboard':
            return `
                <div class="control-group">
                    <label for="octave-select">Octave:</label>
                    <select id="octave-select">
                        <option value="3">Octave 3</option>
                        <option value="4" selected>Octave 4</option>
                        <option value="5">Octave 5</option>
                    </select>
                </div>
                <div class="control-group">
                    <label for="keyboard-size">Size:</label>
                    <select id="keyboard-size">
                        <option value="small">Small</option>
                        <option value="medium" selected>Medium</option>
                        <option value="large">Large</option>
                    </select>
                </div>
                <div class="control-group">
                    <label>Actions:</label>
                    <button id="play-scale">Play Scale</button>
                    <button id="stop-keys" class="secondary">Stop All</button>
                </div>
            `;
            
        case 'TransportControls':
            return `
                <div class="control-group">
                    <label for="playback-speed">Playback Speed:</label>
                    <select id="playback-speed">
                        <option value="0.5">0.5x</option>
                        <option value="1" selected>1x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2">2x</option>
                    </select>
                </div>
                <div class="control-group">
                    <label>Actions:</label>
                    <button id="play-transport">Play</button>
                    <button id="pause-transport">Pause</button>
                    <button id="stop-transport" class="secondary">Stop</button>
                    <button id="loop-transport">Loop</button>
                </div>
            `;
            
        default:
            return `
                <div class="control-group">
                    <label>Actions:</label>
                    <button id="test-component">Test Component</button>
                    <button id="reset-component" class="secondary">Reset</button>
                </div>
            `;
    }
}

function generateScript(component) {
    const componentName = component.name.toLowerCase().replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-');
    
    return `
    <script type="module">
        import './${component.file}';
        
        document.addEventListener('DOMContentLoaded', function() {
            const component = document.getElementById('demo-component');
            
            // Component-specific event listeners
            ${generateEventListeners(component)}
            
            // Log component initialization
            logEvent('${component.name} component initialized', 'success');
            updateStatus('${component.name} component ready for interaction');
        });
    </script>
    `;
}

function generateEventListeners(component) {
    const componentName = component.name.toLowerCase().replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-');
    
    switch (component.name) {
        case 'HandPan':
            return `
                // HandPan specific controls
                const keySelect = document.getElementById('key-select');
                const scaleSelect = document.getElementById('scale-select');
                const sizeSelect = document.getElementById('size-select');
                const muteBtn = document.getElementById('mute-btn');
                const unmuteBtn = document.getElementById('unmute-btn');
                
                keySelect.addEventListener('change', (e) => {
                    component.setAttribute('key', e.target.value);
                    logEvent('Key changed to ' + e.target.value, 'info');
                    updateStatus('HandPan key updated to ' + e.target.value);
                });
                
                scaleSelect.addEventListener('change', (e) => {
                    component.setAttribute('scale', e.target.value);
                    logEvent('Scale changed to ' + e.target.value, 'info');
                    updateStatus('HandPan scale updated to ' + e.target.value);
                });
                
                sizeSelect.addEventListener('change', (e) => {
                    component.setAttribute('size', e.target.value);
                    logEvent('Size changed to ' + e.target.value, 'info');
                    updateStatus('HandPan size updated to ' + e.target.value);
                });
                
                muteBtn.addEventListener('click', () => {
                    component.dispatchEvent(new CustomEvent('mute'));
                    logEvent('HandPan muted', 'warning');
                    updateStatus('HandPan audio muted');
                });
                
                unmuteBtn.addEventListener('click', () => {
                    component.dispatchEvent(new CustomEvent('unmute'));
                    logEvent('HandPan unmuted', 'success');
                    updateStatus('HandPan audio unmuted');
                });
                
                // Listen for HandPan events
                component.addEventListener('note-played', (e) => {
                    logEvent('Note played: ' + e.detail.note, 'success');
                });
                
                component.addEventListener('key-changed', (e) => {
                    logEvent('Key changed: ' + e.detail.key + ' ' + e.detail.scale, 'info');
                });
            `;
            
        case 'Fretboard':
            return `
                // Fretboard specific controls
                const instrumentSelect = document.getElementById('instrument-select');
                const chordSelect = document.getElementById('chord-select');
                const scaleRoot = document.getElementById('scale-root');
                const scaleType = document.getElementById('scale-type');
                const clearDisplayBtn = document.getElementById('clear-display');
                const updateRangeBtn = document.getElementById('update-range');
                
                instrumentSelect.addEventListener('change', (e) => {
                    component.setInstrument(e.target.value);
                    logEvent('Instrument changed to ' + e.target.value, 'info');
                    updateStatus('Instrument updated to ' + e.target.value);
                });
                
                chordSelect.addEventListener('change', (e) => {
                    if (e.target.value) {
                        component.displayChord(e.target.value);
                        logEvent('Chord displayed: ' + e.target.value, 'success');
                        updateStatus('Displaying ' + e.target.value + ' chord');
                        scaleRoot.value = '';
                        scaleType.value = '';
                    }
                });
                
                function updateScale() {
                    const root = scaleRoot.value;
                    const type = scaleType.value;
                    
                    if (root && type) {
                        component.displayScale(root, type);
                        logEvent('Scale displayed: ' + root + ' ' + type, 'success');
                        updateStatus('Displaying ' + root + ' ' + type + ' scale');
                        chordSelect.value = '';
                    }
                }
                
                scaleRoot.addEventListener('change', updateScale);
                scaleType.addEventListener('change', updateScale);
                
                clearDisplayBtn.addEventListener('click', () => {
                    component.clearDisplay();
                    chordSelect.value = '';
                    scaleRoot.value = '';
                    scaleType.value = '';
                    logEvent('Display cleared', 'info');
                    updateStatus('Display cleared');
                });
                
                updateRangeBtn.addEventListener('click', () => {
                    component.setFretRange(0, 12);
                    logEvent('Fret range updated', 'info');
                    updateStatus('Fret range updated to 0-12');
                });
                
                // Listen for fretboard events
                component.addEventListener('note-click', (e) => {
                    logEvent('Note clicked: ' + e.detail.note, 'success');
                });
            `;
            
        case 'PianoRoll':
            return `
                // PianoRoll specific controls
                const tempoInput = document.getElementById('tempo-input');
                const timeSignature = document.getElementById('time-signature');
                const playRollBtn = document.getElementById('play-roll');
                const stopRollBtn = document.getElementById('stop-roll');
                const clearRollBtn = document.getElementById('clear-roll');
                
                tempoInput.addEventListener('change', (e) => {
                    component.setTempo(parseInt(e.target.value));
                    logEvent('Tempo changed to ' + e.target.value + ' BPM', 'info');
                    updateStatus('Tempo updated to ' + e.target.value + ' BPM');
                });
                
                timeSignature.addEventListener('change', (e) => {
                    component.setTimeSignature(e.target.value);
                    logEvent('Time signature changed to ' + e.target.value, 'info');
                    updateStatus('Time signature updated to ' + e.target.value);
                });
                
                playRollBtn.addEventListener('click', () => {
                    component.play();
                    logEvent('PianoRoll playback started', 'success');
                    updateStatus('PianoRoll playing');
                });
                
                stopRollBtn.addEventListener('click', () => {
                    component.stop();
                    logEvent('PianoRoll playback stopped', 'warning');
                    updateStatus('PianoRoll stopped');
                });
                
                clearRollBtn.addEventListener('click', () => {
                    component.clear();
                    logEvent('PianoRoll cleared', 'info');
                    updateStatus('PianoRoll cleared');
                });
            `;
            
        default:
            return `
                // Generic component controls
                const testBtn = document.getElementById('test-component');
                const resetBtn = document.getElementById('reset-component');
                
                testBtn.addEventListener('click', () => {
                    logEvent('${component.name} component tested', 'success');
                    updateStatus('${component.name} component test completed');
                });
                
                resetBtn.addEventListener('click', () => {
                    logEvent('${component.name} component reset', 'info');
                    updateStatus('${component.name} component reset');
                });
                
                // Listen for component events
                component.addEventListener('*', (e) => {
                    logEvent('Event: ' + e.type, 'info');
                });
            `;
    }
}

console.log('Demo generation complete!');
console.log(`Generated ${components.length} demo pages in the 'demos' directory.`);