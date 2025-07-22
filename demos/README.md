# Gigso Component Demos

This directory contains interactive demo pages for all Gigso music application components. Each demo provides a comprehensive showcase of the component's functionality, including interactive controls, API documentation, event logging, and usage examples.

## 🚀 Quick Start

1. **View the Demo Index**: Open `index.html` in your browser to see all available component demos
2. **Navigate to Specific Demos**: Click on any component card to view its dedicated demo page
3. **Interact with Components**: Use the controls provided to test component functionality
4. **Explore Documentation**: Switch between tabs to view API reference, events, and examples

## 📁 Demo Structure

Each component demo page includes:

### 🎯 Component Showcase
- **Live Component**: Interactive demonstration of the component
- **Visual Preview**: Component displayed in a dedicated container
- **Real-time Updates**: See changes as you interact with controls

### 🎛️ Interactive Controls
- **Component-specific Controls**: Tailored controls for each component's features
- **Real-time Feedback**: Status updates and event logging
- **Parameter Adjustment**: Modify component attributes and properties

### 📚 Documentation Tabs

#### Overview Tab
- Component purpose and functionality
- Key features and capabilities
- Integration patterns

#### API Reference Tab
- Available methods and properties
- Input/output specifications
- Configuration options

#### Events Tab
- Events dispatched by the component
- Events the component listens for
- Event data structures

#### Examples Tab
- Usage examples and code snippets
- Integration patterns
- Best practices

#### Event Log Tab
- Real-time event logging
- Component interaction history
- Debug information

## 🎵 Available Component Demos

### Music Creation Components
- **PianoRoll** (`piano-roll-demo.html`) - Visual timeline interface for chord progressions
- **ChordPalette** (`chord-palette-demo.html`) - Pre-defined chord library
- **AddChord** (`add-chord-demo.html`) - Custom chord creation form
- **GigsoKeyboard** (`gigso-keyboard-demo.html`) - Interactive piano keyboard
- **HandPan** (`hand-pan-demo.html`) - Touch-screen hand pan instrument
- **HandPanWrapper** (`hand-pan-wrapper-demo.html`) - Complete HandPan solution

### Instrument Components
- **Fretboard** (`fretboard-demo.html`) - Guitar fretboard visualization
- **ChordDiagram** (`chord-diagram-demo.html`) - Chord fingering diagrams
- **ChromaticTuner** (`chromatic-tuner-demo.html`) - Instrument tuning
- **ScaleKey** (`scale-key-demo.html`) - Scale and key selection

### Playback Controls
- **TransportControls** (`transport-controls-demo.html`) - Playback control container
- **PlayButton** (`play-button-demo.html`) - Playback initiation
- **StopButton** (`stop-button-demo.html`) - Playback stopping
- **LoopButton** (`loop-button-demo.html`) - Loop mode toggle

### Visual Feedback
- **CurrentChord** (`current-chord-demo.html`) - Current chord display
- **EQDisplay** (`eq-display-demo.html`) - Equalizer visualization
- **FrequencyMonitor** (`frequency-monitor-demo.html`) - Frequency analysis
- **VUMeter** (`vu-meter-demo.html`) - Volume unit meter

### Interface & Management
- **GigsoMenu** (`gigso-menu-demo.html`) - Component visibility toggles
- **RecordCollection** (`record-collection-demo.html`) - Song library management
- **GigsoLogo** (`gigso-logo-demo.html`) - Application logo

## 🛠️ Demo Features

### Interactive Controls
Each demo includes component-specific controls that allow you to:
- Modify component attributes
- Trigger component methods
- Test different configurations
- Simulate user interactions

### Real-time Event Logging
- **Event Tracking**: All component events are logged in real-time
- **Event Details**: View event data and timestamps
- **Event Types**: Different event types are color-coded
- **Debug Information**: Helpful for understanding component behavior

### Responsive Design
- **Mobile-friendly**: All demos work on mobile devices
- **Adaptive Layout**: Controls and documentation adapt to screen size
- **Touch Support**: Optimized for touch interactions

### Documentation Integration
- **Live Documentation**: Documentation is generated from component specs
- **API Reference**: Complete method and property documentation
- **Usage Examples**: Practical code examples
- **Integration Patterns**: How components work together

## 🔧 Technical Details

### Demo Generation
Demos are automatically generated using the `generate-demos.js` script in the root directory. The script:

1. **Reads Component Documentation**: Extracts information from `documents/components/` files
2. **Generates Controls**: Creates component-specific interactive controls
3. **Builds Event Listeners**: Sets up event handling for each component
4. **Creates Documentation**: Populates tabs with relevant information

### Template System
All demos use a shared template (`demo-template.html`) that provides:
- **Consistent Styling**: Unified visual design across all demos
- **Standard Layout**: Common structure for component showcase and controls
- **Tab System**: Organized documentation presentation
- **Event Logging**: Built-in event tracking and display

### Component Integration
Each demo:
- **Imports Component**: Loads the component JavaScript module
- **Creates Instance**: Instantiates the component in the demo container
- **Sets Up Controls**: Connects UI controls to component methods
- **Listens for Events**: Captures and logs component events

## 🎯 Usage Examples

### Testing Component Functionality
1. Open a component demo page
2. Use the interactive controls to modify component behavior
3. Observe the component's response in real-time
4. Check the event log to see what events are triggered

### Learning Component API
1. Navigate to the "API Reference" tab
2. Review available methods and properties
3. Use the controls to test different API calls
4. Check the event log for API interaction results

### Understanding Component Events
1. Switch to the "Events" tab to see event documentation
2. Interact with the component to trigger events
3. Monitor the "Event Log" tab for real-time event tracking
4. Analyze event data and timing

### Integration Planning
1. Review the "Examples" tab for usage patterns
2. Understand how components communicate via events
3. See integration examples with other components
4. Plan your component integration strategy

## 🚀 Getting Started with Development

### Running Demos Locally
1. **Start a Local Server**: Use a local web server to serve the demos
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

2. **Open Demo Index**: Navigate to `http://localhost:8000/demos/`

3. **Explore Components**: Click on component cards to view individual demos

### Adding New Component Demos
1. **Create Component Documentation**: Add a `.md` file to `documents/components/`
2. **Update Generator Script**: Add component configuration to `generate-demos.js`
3. **Run Generator**: Execute `node generate-demos.js` to create the demo
4. **Test Demo**: Open the generated demo page and verify functionality

### Customizing Demo Content
1. **Modify Template**: Edit `demo-template.html` for global changes
2. **Update Controls**: Modify `generateControls()` function for component-specific controls
3. **Enhance Scripts**: Update `generateEventListeners()` for custom event handling
4. **Regenerate Demos**: Run the generator script to apply changes

## 📝 Best Practices

### Demo Design
- **Keep it Simple**: Focus on core component functionality
- **Provide Context**: Explain what the component does and why
- **Show Real Usage**: Demonstrate practical use cases
- **Include Edge Cases**: Test boundary conditions and error states

### Documentation
- **Be Comprehensive**: Cover all public APIs and events
- **Provide Examples**: Include practical code snippets
- **Explain Integration**: Show how components work together
- **Keep it Updated**: Maintain documentation as components evolve

### User Experience
- **Responsive Design**: Ensure demos work on all devices
- **Clear Navigation**: Make it easy to find and use features
- **Visual Feedback**: Provide clear indication of component state
- **Error Handling**: Gracefully handle and display errors

## 🤝 Contributing

When contributing to the demo system:

1. **Follow the Template**: Use the existing demo template structure
2. **Test Thoroughly**: Ensure demos work across different browsers
3. **Update Documentation**: Keep component documentation current
4. **Maintain Consistency**: Follow established patterns and styling

## 📞 Support

For questions or issues with the demo system:

1. **Check Documentation**: Review component documentation first
2. **Test in Browser**: Verify the issue in different browsers
3. **Check Console**: Look for JavaScript errors in browser console
4. **Review Events**: Check the event log for debugging information

---

**🎵 Happy exploring!** Use these demos to understand, test, and integrate Gigso components into your music applications.