/**
 * Note Color Utilities
 * 
 * Provides consistent color handling for musical notes across all components.
 * Based on the rainbow spectrum note color system documented in NOTE-COLOR-SYSTEM.md
 */

/**
 * Get the base note letter from a note string (removes sharps, flats, and octave numbers)
 * @param {string} note - Note string (e.g., "C4", "F#", "Bb3")
 * @returns {string} Base note letter (A-G)
 */
export function getBaseNote(note) {
    if (!note || typeof note !== 'string') {
        return 'C'; // Default fallback
    }
    
    // Extract just the base note letter (first character)
    const baseNote = note.charAt(0).toUpperCase();
    
    // Validate it's a valid note
    if (!/^[A-G]$/.test(baseNote)) {
        return 'C'; // Default fallback
    }
    
    return baseNote;
}

/**
 * Check if a note is sharp
 * @param {string} note - Note string 
 * @returns {boolean} True if note contains sharp symbol
 */
export function isSharp(note) {
    return note && note.includes('#');
}

/**
 * Check if a note is flat
 * @param {string} note - Note string
 * @returns {boolean} True if note contains flat symbol  
 */
export function isFlat(note) {
    return note && note.includes('b');
}

/**
 * Check if a note is natural (no sharp or flat)
 * @param {string} note - Note string
 * @returns {boolean} True if note is natural
 */
export function isNatural(note) {
    return note && !isSharp(note) && !isFlat(note);
}

/**
 * Get the CSS custom property name for a note color
 * @param {string} note - Note string
 * @returns {string} CSS custom property name (e.g., "--colour-C")
 */
export function getNoteColorProperty(note) {
    const baseNote = getBaseNote(note);
    return `--colour-${baseNote}`;
}

/**
 * Get the computed color value for a note from CSS custom properties
 * @param {string} note - Note string
 * @returns {string} Hex color value
 */
export function getNoteColor(note) {
    const property = getNoteColorProperty(note);
    
    try {
        const color = getComputedStyle(document.documentElement)
            .getPropertyValue(property)
            .trim();
        
        return color || '#cccccc'; // Fallback gray if color not found
    } catch (error) {
        console.warn('Note Color Utils: Error getting color for note:', note, error);
        return '#cccccc'; // Fallback gray
    }
}

/**
 * Apply note color styling to an HTML element
 * @param {HTMLElement} element - Element to style
 * @param {string} note - Note string
 * @param {Object} options - Styling options
 */
export function applyNoteColor(element, note, options = {}) {
    if (!element || !note) return;
    
    const {
        useBackground = true,
        useTextColor = false,
        applySharpFlatStyling = true,
        customOpacity = null
    } = options;
    
    const baseNote = getBaseNote(note);
    const colorProperty = `var(--colour-${baseNote})`;
    
    // Apply base color
    if (useBackground) {
        element.style.background = colorProperty;
    }
    
    if (useTextColor) {
        element.style.color = colorProperty;
    }
    
    // Apply opacity if specified
    if (customOpacity !== null) {
        element.style.opacity = customOpacity;
    }
    
    // Apply sharp/flat visual treatments
    if (applySharpFlatStyling) {
        if (isSharp(note)) {
            // Sharp: lighten with white box-shadow
            element.style.boxShadow = 'inset 0 0 20px rgba(255, 255, 255, 0.5)';
            element.classList.add('note-sharp');
        } else if (isFlat(note)) {
            // Flat: darken with black box-shadow  
            element.style.boxShadow = 'inset 0 0 20px rgba(0, 0, 0, 0.3)';
            element.classList.add('note-flat');
        } else {
            // Natural: remove any box-shadow
            element.style.boxShadow = '';
            element.classList.add('note-natural');
        }
    }
    
    // Add note-specific CSS class for additional styling
    element.classList.add(`note-${baseNote.toLowerCase()}`);
    element.setAttribute('data-note', note);
}

/**
 * Apply note color styling specifically for minor variations
 * @param {HTMLElement} element - Element to style
 * @param {string} note - Note string
 * @param {Object} options - Additional options
 */
export function applyMinorNoteColor(element, note, options = {}) {
    applyNoteColor(element, note, {
        customOpacity: 0.8,
        ...options
    });
    
    // Add minor-specific styling
    element.style.textShadow = '1px 1px 1px #000';
    element.classList.add('note-minor');
}

/**
 * Remove all note color styling from an element
 * @param {HTMLElement} element - Element to clean
 */
export function removeNoteColor(element) {
    if (!element) return;
    
    // Remove inline styles
    element.style.background = '';
    element.style.color = '';
    element.style.opacity = '';
    element.style.boxShadow = '';
    element.style.textShadow = '';
    
    // Remove note-related CSS classes
    const classesToRemove = [
        'note-sharp', 'note-flat', 'note-natural', 'note-minor',
        'note-c', 'note-d', 'note-e', 'note-f', 'note-g', 'note-a', 'note-b'
    ];
    
    classesToRemove.forEach(className => {
        element.classList.remove(className);
    });
    
    // Remove data attribute
    element.removeAttribute('data-note');
}

/**
 * Get CSS class names for a note
 * @param {string} note - Note string
 * @returns {Array<string>} Array of CSS class names
 */
export function getNoteClasses(note) {
    const baseNote = getBaseNote(note);
    const classes = [`note-${baseNote.toLowerCase()}`];
    
    if (isSharp(note)) {
        classes.push('note-sharp');
    } else if (isFlat(note)) {
        classes.push('note-flat');
    } else {
        classes.push('note-natural');
    }
    
    return classes;
}

/**
 * Create CSS for note colors (for use in component stylesheets)
 * @param {string} selector - CSS selector to apply colors to
 * @returns {string} CSS rules string
 */
export function generateNoteColorCSS(selector = '.note') {
    const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    
    let css = '';
    
    notes.forEach(note => {
        css += `
${selector}[data-note*="${note}"] {
    background: var(--colour-${note});
}

${selector}[data-note*="${note}#"] {
    background: var(--colour-${note});
    box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.5);
}

${selector}[data-note*="${note}b"] {
    background: var(--colour-${note});
    box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.3);
}
        `;
    });
    
    return css;
}

/**
 * Batch apply note colors to multiple elements
 * @param {Array<{element: HTMLElement, note: string}>} elementNoteMap - Array of element-note pairs
 * @param {Object} options - Styling options
 */
export function applyNoteColorsToElements(elementNoteMap, options = {}) {
    if (!Array.isArray(elementNoteMap)) return;
    
    elementNoteMap.forEach(({ element, note }) => {
        if (element && note) {
            applyNoteColor(element, note, options);
        }
    });
}

/**
 * Get all unique notes from an array and their colors
 * @param {Array<string>} notes - Array of note strings
 * @returns {Array<{note: string, color: string, baseNote: string}>} Note color mapping
 */
export function getNoteColorMapping(notes) {
    if (!Array.isArray(notes)) return [];
    
    const uniqueNotes = [...new Set(notes)];
    
    return uniqueNotes.map(note => ({
        note,
        color: getNoteColor(note),
        baseNote: getBaseNote(note),
        isSharp: isSharp(note),
        isFlat: isFlat(note),
        isNatural: isNatural(note)
    }));
}

/**
 * Create a color legend for a set of notes
 * @param {Array<string>} notes - Array of note strings
 * @param {HTMLElement} container - Container element for the legend
 */
export function createNoteColorLegend(notes, container) {
    if (!container || !Array.isArray(notes)) return;
    
    const mapping = getNoteColorMapping(notes);
    
    container.innerHTML = '';
    container.className = 'note-color-legend';
    
    mapping.forEach(({ note, color }) => {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `
            <span class="legend-color" style="background-color: ${color}"></span>
            <span class="legend-note">${note}</span>
        `;
        
        container.appendChild(legendItem);
    });
}

// Default export object with all utilities
export default {
    getBaseNote,
    isSharp,
    isFlat,
    isNatural,
    getNoteColorProperty,
    getNoteColor,
    applyNoteColor,
    applyMinorNoteColor,
    removeNoteColor,
    getNoteClasses,
    generateNoteColorCSS,
    applyNoteColorsToElements,
    getNoteColorMapping,
    createNoteColorLegend
};