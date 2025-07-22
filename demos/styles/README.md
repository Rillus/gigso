# Demo Styles Documentation

This directory contains the CSS styles for the Gigso component demo system. The styles are organized into modular files for better maintainability and reusability.

## 📁 File Structure

```
styles/
├── demo-main.css      # Main entry point - imports all other CSS files
├── demo-base.css      # Base styles, layout, and common components
├── demo-tabs.css      # Tab system styles
├── demo-tables.css    # API tables and structured content
├── demo-code.css      # Code blocks and syntax highlighting
├── demo-events.css    # Event logging and monitoring
└── README.md          # This documentation file
```

## 🎨 Style Organization

### `demo-main.css`
**Main entry point** that imports all other CSS files and provides:
- Global imports for all style modules
- Accessibility features (focus styles, reduced motion)
- Print styles for documentation
- High contrast mode support
- Loading state animations

### `demo-base.css`
**Foundation styles** including:
- CSS reset and base typography
- Layout containers and grid systems
- Component showcase sections
- Interactive controls and form elements
- Status messages and notifications
- Responsive design breakpoints

### `demo-tabs.css`
**Tab system** for documentation sections:
- Tab navigation styling
- Tab content transitions and animations
- Active state management
- Responsive tab behavior
- Hover effects and interactions

### `demo-tables.css`
**API documentation tables**:
- Structured table layouts
- API method, property, and event tables
- Code highlighting within tables
- Responsive table behavior
- Hover effects and row highlighting

### `demo-code.css`
**Code blocks and syntax highlighting**:
- Dark theme code blocks
- Language-specific color coding
- Inline code styling
- Copy button functionality
- Syntax highlighting classes
- Responsive code display

### `demo-events.css`
**Event logging system**:
- Event log container styling
- Event type color coding
- Timestamp and metadata display
- Event filtering controls
- Statistics and metrics display
- Scrollbar customization

## 🚀 Usage

### Including Styles in Demo Pages
All demo pages automatically include the main CSS file:

```html
<link rel="stylesheet" href="styles/demo-main.css">
```

### Customizing Styles
To modify styles for specific components:

1. **Global Changes**: Edit the appropriate CSS file in this directory
2. **Component-Specific**: Add inline styles or component-specific CSS classes
3. **Theme Overrides**: Use CSS custom properties for theming

### Adding New Style Modules
1. Create a new CSS file (e.g., `demo-new-feature.css`)
2. Add the import to `demo-main.css`:
   ```css
   @import url('./demo-new-feature.css');
   ```
3. Document the new module in this README

## 🎯 Design System

### Color Palette
- **Primary**: `#667eea` (Blue gradient)
- **Secondary**: `#764ba2` (Purple gradient)
- **Success**: `#4caf50` (Green)
- **Warning**: `#ff9800` (Orange)
- **Error**: `#f44336` (Red)
- **Info**: `#2196f3` (Blue)
- **Neutral**: `#6c757d` (Gray)

### Typography
- **Font Family**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Base Size**: `14px`
- **Line Height**: `1.5`
- **Headings**: Weight `300` for large headings, `600` for section headers

### Spacing
- **Base Unit**: `8px`
- **Container Padding**: `30px` (desktop), `15px` (mobile)
- **Section Margins**: `30px` between sections
- **Component Padding**: `40px` (desktop), `20px` (mobile)

### Border Radius
- **Small**: `4px` (buttons, inputs)
- **Medium**: `8px` (cards, containers)
- **Large**: `12px` (main sections)
- **Extra Large**: `16px` (page sections)

### Shadows
- **Light**: `0 2px 8px rgba(0,0,0,0.1)` (tables, small elements)
- **Medium**: `0 4px 12px rgba(0,0,0,0.15)` (cards, hover states)
- **Heavy**: `0 8px 32px rgba(0,0,0,0.1)` (main sections)

## 📱 Responsive Design

### Breakpoints
- **Mobile**: `< 768px`
- **Tablet**: `768px - 1024px`
- **Desktop**: `> 1024px`

### Mobile Optimizations
- Single column layouts
- Reduced padding and margins
- Touch-friendly button sizes
- Simplified navigation
- Optimized typography scaling

## ♿ Accessibility Features

### Focus Management
- Visible focus indicators
- Keyboard navigation support
- Logical tab order
- Skip links for main content

### Color and Contrast
- WCAG 2.1 AA compliant contrast ratios
- High contrast mode support
- Color-independent information
- Semantic color usage

### Motion and Animation
- Reduced motion support
- Respects user preferences
- Non-disruptive animations
- Clear loading states

## 🛠️ Development Guidelines

### CSS Best Practices
1. **Modular Organization**: Keep styles in logical, focused files
2. **Naming Conventions**: Use BEM methodology for component classes
3. **Specificity**: Avoid overly specific selectors
4. **Performance**: Minimize CSS file size and complexity
5. **Maintainability**: Use consistent patterns and documentation

### Adding New Components
1. **Base Styles**: Add to `demo-base.css` for common patterns
2. **Component-Specific**: Create new CSS file for complex components
3. **Documentation**: Update this README with new patterns
4. **Testing**: Verify across different screen sizes and browsers

### Customization Points
- **CSS Custom Properties**: Use for themeable values
- **Component Classes**: Extend existing patterns
- **Utility Classes**: Add for common styling needs
- **Override Classes**: Provide for specific customization

## 🔧 Build Process

### CSS Processing
The CSS files are designed to work directly in browsers without preprocessing, but can be optimized with:

1. **Minification**: Remove whitespace and comments
2. **Concatenation**: Combine all files into one
3. **Autoprefixing**: Add vendor prefixes
4. **Compression**: Gzip for production

### Development Workflow
1. Edit individual CSS files
2. Test changes in browser
3. Regenerate demo pages if needed
4. Update documentation
5. Commit changes

## 📚 Resources

### CSS References
- [CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
- [CSS Flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [CSS Media Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries)

### Design System Resources
- [Material Design](https://material.io/design)
- [Bootstrap](https://getbootstrap.com/docs/5.0/getting-started/introduction/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Accessibility Guidelines
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Accessibility Initiative](https://www.w3.org/WAI/)

---

**🎨 Happy styling!** This modular CSS system provides a solid foundation for the Gigso component demo system while maintaining flexibility for future enhancements.