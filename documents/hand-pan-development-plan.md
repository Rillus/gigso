# HandPan Development Plan

## Overview
This document outlines the feature-first development approach for the HandPan component, breaking down implementation into phases with clear priorities, testing strategies, and acceptance criteria.

## Development Phases

### Phase 1: Core Foundation (MVP)
**Priority: Critical**  
**Timeline: 1-2 days**

#### Features
1. **Basic Component Structure**
   - Extend BaseComponent
   - Basic circular layout with 8 tone fields
   - Shadow DOM with isolated styles
   - Component registration

2. **Simple Audio Integration**
   - Basic Tone.js synthesiser (not hand pan specific yet)
   - Single note playback on touch/click
   - Basic visual feedback (active state)

3. **D Minor Key Only**
   - Hard-coded D minor note layout
   - 8 notes: D4, A3, A4, F3, F4, D3, D4, A3
   - No key changing functionality yet

#### Acceptance Criteria
- [ ] Component renders with circular layout
- [ ] 8 tone fields visible and clickable
- [ ] Touch/click triggers note playback
- [ ] Visual feedback shows active state
- [ ] All tests pass
- [ ] No console errors

#### Tests to Write First (TDD)
```javascript
// Component structure
test('should render hand pan with 8 tone fields', () => {
  const handPan = document.createElement('hand-pan');
  document.body.appendChild(handPan);
  
  const toneFields = handPan.shadowRoot.querySelectorAll('.tone-field');
  expect(toneFields.length).toBe(8);
});

// Audio integration
test('should play note when tone field is clicked', () => {
  const handPan = document.createElement('hand-pan');
  document.body.appendChild(handPan);
  
  const mockSynth = { triggerAttackRelease: jest.fn() };
  handPan.synth = mockSynth;
  
  const firstField = handPan.shadowRoot.querySelector('.tone-field');
  fireEvent.click(firstField);
  
  expect(mockSynth.triggerAttackRelease).toHaveBeenCalled();
});

// Visual feedback
test('should show active state when tone field is clicked', () => {
  const handPan = document.createElement('hand-pan');
  document.body.appendChild(handPan);
  
  const firstField = handPan.shadowRoot.querySelector('.tone-field');
  fireEvent.click(firstField);
  
  expect(firstField).toHaveClass('active');
});
```

---

### Phase 2: Hand Pan Timbre & Multi-touch ✅
**Priority: High**  
**Timeline: 1-2 days**  
**Status: COMPLETE**

#### Features
1. **Hand Pan-Specific Audio**
   - Custom synthesiser with triangle oscillator
   - Long attack, medium decay, low sustain, long release
   - Natural note decay simulation
   - Subtle reverb effect

2. **Multi-touch Support**
   - Multiple simultaneous touches
   - Touch event handling (touchstart, touchend)
   - Mouse fallback for desktop
   - Touch area optimisation

3. **Enhanced Visual Feedback**
   - Ripple effect on touch
   - Smooth animations
   - Better active state styling

#### Acceptance Criteria
- [x] Audio sounds like a hand pan (warm, metallic, resonant)
- [x] Multiple notes can play simultaneously
- [x] Touch events work on mobile devices
- [x] Mouse clicks work on desktop
- [x] Visual feedback is smooth and responsive
- [x] No audio clipping or distortion

#### Tests to Write
```javascript
// Multi-touch support
test('should support multiple simultaneous touches', () => {
  const handPan = document.createElement('hand-pan');
  document.body.appendChild(handPan);
  
  const fields = handPan.shadowRoot.querySelectorAll('.tone-field');
  fireEvent.touchStart(fields[0]);
  fireEvent.touchStart(fields[1]);
  
  const activeFields = handPan.shadowRoot.querySelectorAll('.tone-field.active');
  expect(activeFields.length).toBe(2);
});

// Audio timbre
test('should use hand pan synthesiser settings', () => {
  const handPan = document.createElement('hand-pan');
  document.body.appendChild(handPan);
  
  expect(handPan.synth.oscillator.type).toBe('triangle');
  expect(handPan.synth.envelope.release).toBeGreaterThan(1.5);
});
```

---

### Phase 3: Key & Scale System ✅
**Priority: High**  
**Timeline: 1-2 days**  
**Status: COMPLETE**

#### Features
1. **Key Changing** ✅
   - Support for D, F, G, A, C keys
   - Scale types: minor, major, pentatonic
   - Dynamic note layout updates
   - Key indicator in centre

2. **Event System Integration** ✅
   - `set-key` event handling
   - `key-changed` event dispatching
   - Integration with existing event system
   - State management integration

3. **Note Layout Management** ✅
   - Note mapping for each key/scale combination
   - Automatic layout recalculation
   - Visual updates when key changes

4. **Error Handling** ✅
   - Graceful handling of invalid keys and scales
   - Fallback to default D minor when errors occur
   - Robust error recovery for scale utilities

#### Acceptance Criteria
- [x] Can change between D, F, G, A, C keys
- [x] Can change between minor, major, pentatonic scales
- [x] Note layout updates correctly for each key/scale
- [x] Events are dispatched correctly
- [x] Key indicator shows current key/scale
- [x] No audio glitches during key changes
- [x] Error handling for invalid inputs
- [x] Graceful fallback to defaults

#### Tests to Write
```javascript
// Key changing
test('should change key when set-key event received', () => {
  const handPan = document.createElement('hand-pan');
  document.body.appendChild(handPan);
  
  handPan.dispatchEvent(new CustomEvent('set-key', {
    detail: { key: 'F', scale: 'major' }
  }));
  
  expect(handPan.currentKey).toBe('F');
  expect(handPan.currentScale).toBe('major');
});

// Note layout updates
test('should update note layout when key changes', () => {
  const handPan = document.createElement('hand-pan');
  document.body.appendChild(handPan);
  
  const originalNotes = [...handPan.notes];
  handPan.changeKey('F', 'major');
  
  expect(handPan.notes).not.toEqual(originalNotes);
});
```

---

### Phase 4: Polish & Performance
**Priority: Medium**  
**Timeline: 1 day**

#### Features
1. **Performance Optimisation**
   - Efficient touch event handling
   - Optimised CSS animations
   - Memory management for synthesiser
   - Reduced audio latency

2. **Visual Polish**
   - Metallic appearance
   - Responsive scaling
   - Accessibility improvements
   - Mobile optimisation

3. **Error Handling**
   - Graceful audio context handling
   - Touch event fallbacks
   - Loading states
   - Error recovery

#### Acceptance Criteria
- [ ] Audio latency < 50ms
- [ ] Smooth 60fps animations
- [ ] Works on all supported browsers
- [ ] Responsive on mobile devices
- [ ] Graceful error handling
- [ ] No memory leaks

#### Tests to Write
```javascript
// Performance
test('should handle rapid touch events efficiently', () => {
  const handPan = document.createElement('hand-pan');
  document.body.appendChild(handPan);
  
  const startTime = performance.now();
  
  // Simulate rapid touches
  for (let i = 0; i < 10; i++) {
    const field = handPan.shadowRoot.querySelector('.tone-field');
    fireEvent.touchStart(field);
  }
  
  const endTime = performance.now();
  expect(endTime - startTime).toBeLessThan(100);
});

// Error handling
test('should handle audio context errors gracefully', () => {
  const handPan = document.createElement('hand-pan');
  document.body.appendChild(handPan);
  
  // Mock audio context error
  handPan.synth.triggerAttackRelease = jest.fn().mockImplementation(() => {
    throw new Error('Audio context error');
  });
  
  const field = handPan.shadowRoot.querySelector('.tone-field');
  expect(() => fireEvent.click(field)).not.toThrow();
});
```

---

### Phase 5: Advanced Features (Future)
**Priority: Low**  
**Timeline: Future iterations**

#### Features
1. **Pressure Sensitivity**
   - Touch pressure detection
   - Velocity-sensitive playback
   - Dynamic volume control

2. **Recording & Integration**
   - Record hand pan performances
   - Integration with PianoRoll
   - Export to song format

3. **Customisation**
   - User-defined tunings
   - Custom note arrangements
   - Theming options

4. **Effects & Processing**
   - Reverb and delay effects
   - EQ and filtering
   - Stereo positioning

## Implementation Strategy

### File Structure
```
components/hand-pan/
├── __tests__/
│   └── hand-pan.test.js
├── hand-pan.js
└── hand-pan.css
```

### Development Approach
1. **TDD First**: Write tests before implementation
2. **Phase by Phase**: Complete each phase before moving to next
3. **Integration Testing**: Test with existing components
4. **Performance Monitoring**: Measure and optimise throughout

### Key Decisions to Make
1. **Note Layout Algorithm**: How to calculate tone field positions
2. **Audio Synthesiser**: Exact Tone.js configuration
3. **Touch Handling**: Touch vs mouse event strategy
4. **State Management**: How to integrate with global state
5. **Styling Approach**: CSS Grid vs Flexbox for layout

### Risk Mitigation
1. **Audio Context**: Handle browser audio context restrictions
2. **Touch Events**: Ensure cross-browser compatibility
3. **Performance**: Monitor for memory leaks and latency
4. **Mobile**: Test on various mobile devices and browsers

## Success Metrics

### Technical Metrics
- Audio latency < 50ms
- Touch response time < 100ms
- Memory usage < 50MB
- Test coverage > 90%

### User Experience Metrics
- Intuitive touch interaction
- Authentic hand pan sound
- Smooth visual feedback
- Responsive design

### Integration Metrics
- Seamless integration with existing components
- No breaking changes to existing functionality
- Consistent event communication
- Proper state management

## Next Steps

1. **Start with Phase 1**: Implement basic component structure
2. **Write tests first**: Follow TDD approach
3. **Iterate quickly**: Build, test, refine
4. **Get feedback**: Test with users early
5. **Document progress**: Update specification as needed

This plan ensures we build a solid foundation and add features incrementally, following the project's established patterns and quality standards. 