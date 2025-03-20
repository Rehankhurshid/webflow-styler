document.addEventListener("DOMContentLoaded", function () {
  const cssTextArea = document.getElementById("figma-css");

  if (!cssTextArea) {
    console.error("CSS textarea not found");
    return;
  }

  // Configure CSS Lint rules
  const cssLintRules = {
    important: false,
    "adjoining-classes": false,
    "known-properties": false,
    "box-sizing": false,
    "box-model": false,
    "overqualified-elements": false,
    "display-property-grouping": false,
    "bulletproof-font-face": false,
    "compatible-vendor-prefixes": false,
    "regex-selectors": false,
    errors: false,
    "duplicate-background-images": false,
    "duplicate-properties": false,
    "empty-rules": false,
    "selector-max-approaching": false,
    gradients: false,
    "fallback-colors": false,
    "font-sizes": false,
    "font-faces": false,
    floats: false,
    "star-property-hack": false,
    "outline-none": false,
    import: false,
    ids: false,
    "underscore-property-hack": false,
    "rules-count": false,
    "qualified-headings": false,
    "selector-max": false,
    shorthand: false,
    "text-indent": false,
    "unique-headings": false,
    "universal-selector": false,
    "unqualified-attributes": false,
    "vendor-prefix": false,
    "zero-units": false,
  };

  // Initialize CodeMirror with simpler options
  const editor = CodeMirror.fromTextArea(cssTextArea, {
    mode: {
      name: "text/css",
      colorKeywords: [
        "red",
        "blue",
        "green",
        "yellow",
        "black",
        "white",
        "orange",
        "purple",
        "cyan",
        "magenta",
        "transparent",
      ],
      allowVars: true, // Allow CSS variables
      inDeclarationList: true, // Allow for just declarations without selectors
    },
    theme: "material-darker",
    lineNumbers: false,
    lineWrapping: true,
    indentUnit: 2,
    smartIndent: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    lint: {
      // Re-enable linting with custom options
      options: {
        rules: cssLintRules,
        // Add ignored patterns for CSS variables
        ignore: [/var\(--[\w-]+\)/],
      },
      // Custom linting function that handles declaration lists
      getAnnotations: function (text, options, editor) {
        // Check if this looks like just declarations
        const isDeclarationList =
          !text.includes("{") &&
          !text.includes("}") &&
          /^[\s\S]*?:[^;]*;/m.test(text);

        // If it's just declarations, don't show any errors
        if (isDeclarationList) {
          return [];
        }

        // Otherwise, use the default linter
        return CodeMirror.lint.css(text, options, editor);
      },
    },
    styleActiveLine: true,
    scrollbarStyle: "null",
    viewportMargin: 10, // Limit to avoid layout issues
    extraKeys: {
      "Ctrl-Space": "autocomplete",
      Tab: function (cm) {
        if (cm.somethingSelected()) {
          cm.indentSelection("add");
        } else {
          cm.replaceSelection("  ", "end");
        }
      },
    },
  });

  // Set a fixed height instead of auto
  editor.setSize("auto", "120px");

  // Apply simpler custom styles
  customizeEditorStyles();

  // Add event listeners for editor
  editor.on("change", function () {
    // Update the textarea value when editor content changes
    editor.save();
  });

  // Expose editor to global scope for other scripts to use
  window.cssEditor = editor;

  // Add custom CSS with simplified styling
  function customizeEditorStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .CodeMirror {
        background-color: rgba(22, 22, 26, 0.98);
        color: rgba(240, 240, 240, 0.95);
        border: 1px solid rgba(60, 63, 68, 0.6);
        border-radius: 4px;
        font-family: 'Roboto Mono', monospace;
        font-size: 11.5px;
        height: 120px; /* Fixed height */
        box-shadow: inset 0px 1px 1px -1px rgba(0,0,0,0.133);
      }
      
      /* Simple fix for scrolling */
      .CodeMirror-hscrollbar, 
      .CodeMirror-vscrollbar {
        display: none !important;
      }
      
      /* Hide gutters */
      .CodeMirror-gutters {
        display: none !important;
      }
      
      /* Updated property and value colors */
      .cm-s-material-darker .cm-property { color: rgb(235, 235, 235); } /* properties - light gray */
      .cm-s-material-darker .cm-atom { color: rgb(99, 212, 137); } /* values - green */
      .cm-s-material-darker .cm-number { color: rgb(99, 212, 137); } /* numbers - green */
      .cm-s-material-darker .cm-def { color: #82AAFF; }
      .cm-s-material-darker .cm-variable { color: rgb(99, 212, 137); } /* CSS variables - green */
      .cm-s-material-darker .cm-variable-2 { color: rgb(99, 212, 137); }
      .cm-s-material-darker .cm-variable-3 { color: rgb(99, 212, 137); }
      .cm-s-material-darker .cm-string { color: rgb(99, 212, 137); }
      .cm-s-material-darker .cm-string-2 { color: rgb(99, 212, 137); }
      .cm-s-material-darker .cm-punctuation { color: rgba(240, 240, 240, 0.7); }
      .cm-s-material-darker .cm-operator { color: rgba(240, 240, 240, 0.7); }
      .cm-s-material-darker .cm-meta { color: #ff5252; } /* 'var' remains red */
      .cm-s-material-darker .cm-bracket { color: rgba(240, 240, 240, 0.7); }
      .cm-s-material-darker .cm-comment { color: #546E7A; }
      .cm-s-material-darker .cm-keyword { color: rgb(99, 212, 137); } /* keywords - green */
      .cm-s-material-darker .cm-tag { color: #ff5252; } /* tags remain red */
      
      /* CSS-specific styles */
      .cm-s-material-darker .cm-qualifier { color: rgb(99, 212, 137); }
      .cm-s-material-darker .cm-builtin { color: rgb(99, 212, 137); }
      .cm-s-material-darker .cm-error { color: #ff5252; }
      
      /* Special case for color values */
      .cm-s-material-darker .cm-atom[style*="color:#"] { color: #ff5252 !important; }
      
      /* Handle specific color keywords - keeping color names red for distinction */
      .cm-s-material-darker span.cm-atom:contains("red"), 
      .cm-s-material-darker span.cm-atom:contains("blue"),
      .cm-s-material-darker span.cm-atom:contains("green"),
      .cm-s-material-darker span.cm-atom:contains("yellow"),
      .cm-s-material-darker span.cm-atom:contains("black"),
      .cm-s-material-darker span.cm-atom:contains("white") {
        color: #ff5252 !important;
      }
      
      /* Ensure values like transparent remain green */
      .cm-s-material-darker span.cm-atom:contains("transparent"),
      .cm-s-material-darker span.cm-atom:contains("center"),
      .cm-s-material-darker span.cm-atom:contains("flex"),
      .cm-s-material-darker span.cm-atom:contains("initial"),
      .cm-s-material-darker span.cm-atom:contains("none") {
        color: rgb(99, 212, 137) !important;
      }
      
      /* CSS Variables styling */
      .cm-s-material-darker span.cm-def:contains("var") {
        color: rgb(99, 212, 137) !important;
      }
      
      /* Style for CSS variable dashes */
      .cm-s-material-darker .cm-variable-3:contains("--") {
        color: #ff5252 !important;
      }
      
      /* Handle missing declarations list highlighting */
      .CodeMirror-line span[role="presentation"] > span:first-child:not(.cm-atom):not(.cm-tag):not(.cm-qualifier) {
        color: rgb(235, 235, 235); /* Apply property color to unparsed lines in declaration lists */
      }
      
      /* Selection and cursor */
      .CodeMirror-selected { background-color: rgba(72, 86, 110, 0.35); }
      .CodeMirror-activeline-background { background-color: rgba(45, 50, 60, 0.5); }
      .CodeMirror-cursor { border-left: 2px solid rgba(255, 255, 255, 0.8); }
    `;
    document.head.appendChild(style);

    // Add script to further customize specific tokens
    const customScript = document.createElement("script");
    customScript.textContent = `
      // Run after a short delay to ensure CodeMirror is initialized
      setTimeout(() => {
        if (window.cssEditor) {
          // Find all color value tokens and adjust their color
          const content = window.cssEditor.getWrapperElement();
          
          // Simple observer to watch for changes and update colors
          const observer = new MutationObserver(() => {
            // Find color values
            content.querySelectorAll('.cm-atom').forEach(atom => {
              // Set colors based on content
              const text = atom.textContent.toLowerCase();
              if (['red','blue','green','yellow','black','white','purple','orange'].includes(text)) {
                atom.style.color = '#ff5252';
              } else if (['transparent','center','flex','none','initial','inherit'].includes(text)) {
                atom.style.color = 'rgb(99, 212, 137)';
              }
            });
            
            // Handle CSS variable syntax
            content.querySelectorAll('span').forEach(span => {
              // Style variable function (var)
              if (span.textContent === 'var') {
                span.style.color = 'rgb(99, 212, 137)';
              }
              
              // Style variable names (--variable-name)
              if (span.textContent.startsWith('--')) {
                span.style.color = '#ff5252';
              }
              
              // Style declaration properties
              const line = span.closest('.CodeMirror-line');
              if (line && !line.textContent.includes('{') && !line.textContent.includes('}')) {
                const hasColon = line.textContent.includes(':');
                if (hasColon) {
                  const colonIndex = line.textContent.indexOf(':');
                  const lineStart = line.querySelector('span[role="presentation"] > span:first-child');
                  if (lineStart && lineStart.textContent.length <= colonIndex) {
                    lineStart.style.color = 'rgb(235, 235, 235)'; // property color
                  }
                }
              }
            });
          });
          
          // Start observing
          observer.observe(content, { childList: true, subtree: true });
          
          // Initial run
          observer.disconnect();
          observer.observe(content, { childList: true, subtree: true });
        }
      }, 200);
    `;
    document.head.appendChild(customScript);
  }
});
