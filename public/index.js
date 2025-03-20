var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
function formatCSSDeclarations(css) {
  // Remove comments - using a more robust regex that supports multi-line comments
  css = css.replace(/\/\*[\s\S]*?\*\//g, "");
  // Split declarations into individual lines
  let declarations = css.split(";");
  // Trim whitespace from each declaration
  declarations = declarations.map((declaration) => declaration.trim());
  // Remove any empty lines
  declarations = declarations.filter((declaration) => declaration.length > 0);
  // Join the declarations back together, formatted with indentation and line breaks
  let formattedCSS = declarations.join(";\n    ");
  // Add a line break at the end, if there are any declarations
  if (formattedCSS.length > 0) {
    formattedCSS += ";";
  }
  return formattedCSS;
}
// Add px to rem conversion function
function convertPxToRem(value) {
  // Check if the value ends with px
  if (typeof value === "string" && value.endsWith("px")) {
    // Extract the numeric part
    const numericValue = parseFloat(value);
    // Convert to rem (1rem = 16px)
    const remValue = (numericValue / 16).toFixed(3);
    return `${remValue}rem`;
  }
  return value;
}
function parseFigmaCSS(css) {
  const formattedCSS = formatCSSDeclarations(css);
  const properties = {};
  const unsupportedProperties = [];
  const cssLines = formattedCSS.split(";\n    ");
  const includeDimensions =
    !document.getElementById("include-dimensions").checked;
  const convertToRem = document.getElementById("convert-to-rem").checked;

  // List of supported properties
  const supportedProperties = {
    // Layout properties
    display: true,
    "flex-direction": true,
    "justify-content": true,
    "align-items": true,
    "flex-wrap": true,
    gap: true,
    order: true,
    flex: true,
    "flex-grow": true,
    "flex-shrink": true,
    "flex-basis": true,
    "align-self": true,

    // Spacing properties
    margin: true,
    "margin-top": true,
    "margin-right": true,
    "margin-bottom": true,
    "margin-left": true,
    padding: true,
    "padding-top": true,
    "padding-right": true,
    "padding-bottom": true,
    "padding-left": true,

    // Size properties
    width: true,
    height: true,
    "min-width": true,
    "min-height": true,
    "max-width": true,
    "max-height": true,

    // Typography properties
    "font-size": true,
    "line-height": true,
    "font-weight": true,
    "font-style": true,
    "text-align": true,
    "letter-spacing": true,
    "text-transform": true,
    "text-decoration": true,
    "word-break": true,
    "word-wrap": true,
    "white-space": true,
    color: true,

    // Background properties
    background: true,
    "background-color": true,
    "background-image": true,
    "background-position": true,
    "background-size": true,
    "background-repeat": true,
    "background-attachment": true,
    "background-clip": true,
    "backdrop-filter": true,

    // Border properties
    border: true,
    "border-width": true,
    "border-style": true,
    "border-color": true,
    "border-radius": true,
    "border-top": true,
    "border-right": true,
    "border-bottom": true,
    "border-left": true,
    "border-top-left-radius": true,
    "border-top-right-radius": true,
    "border-bottom-left-radius": true,
    "border-bottom-right-radius": true,

    // Effect properties
    opacity: true,
    "box-shadow": true,
    transform: true,
    transition: true,
    cursor: true,
    filter: true,
    "mix-blend-mode": true,
    "backdrop-filter": true,

    // Position properties
    position: true,
    top: true,
    right: true,
    bottom: true,
    left: true,
    "z-index": true,
    overflow: true,
    "overflow-x": true,
    "overflow-y": true,

    // Grid properties
    "grid-template-columns": true,
    "grid-template-rows": true,
    "grid-column": true,
    "grid-row": true,
    "grid-area": true,
    "grid-gap": true,
    "grid-row-gap": true,
    "grid-column-gap": true,

    // Animation properties
    animation: true,
    "animation-name": true,
    "animation-duration": true,
    "animation-timing-function": true,
    "animation-delay": true,
    "animation-iteration-count": true,
    "animation-direction": true,
    "animation-fill-mode": true,
    "animation-play-state": true,
  };

  cssLines.forEach((line) => {
    const [property, value] = line.split(":").map((s) => s.trim());
    if (property && value) {
      // Skip font-feature-settings as it's not supported
      if (property === "font-feature-settings") {
        unsupportedProperties.push({ property, value });
        return;
      }

      // Skip width and height if they're disabled
      if (
        !includeDimensions &&
        (property === "width" || property === "height")
      ) {
        return;
      }

      // Check if property is supported
      if (!supportedProperties[property]) {
        unsupportedProperties.push({ property, value });
        return;
      }

      // Handle CSS variables properly - don't extract the absolute value,
      // preserve the entire var() expression
      let finalValue = value;

      // For properties like padding that can have multiple values with vars
      if (["padding", "margin"].includes(property)) {
        // Special processing for padding with variables
        if (finalValue.includes("var(")) {
          // Try to handle the complex case with a pattern match
          const paddingPattern = /var\(--[^,]+,\s*([^)]+)\)/g;
          let simplifiedValue = finalValue;
          let match;

          // Replace all var(--name, value) with just the fallback value
          while ((match = paddingPattern.exec(finalValue)) !== null) {
            if (match[1]) {
              simplifiedValue = simplifiedValue.replace(
                match[0],
                match[1].trim()
              );
            }
          }

          // Now process with the simplified value that uses fallbacks
          const paddingValues = simplifiedValue.split(" ").map((v) => v.trim());

          // Standard padding property is still set with original value (with variables)
          properties[property] = finalValue;

          // Also set the individual sides with processed values for better flexibility
          if (
            property === "padding" &&
            paddingValues.length >= 1 &&
            paddingValues.length <= 4
          ) {
            switch (paddingValues.length) {
              case 1:
                properties["padding-top"] = paddingValues[0];
                properties["padding-right"] = paddingValues[0];
                properties["padding-bottom"] = paddingValues[0];
                properties["padding-left"] = paddingValues[0];
                break;
              case 2:
                properties["padding-top"] = paddingValues[0];
                properties["padding-right"] = paddingValues[1];
                properties["padding-bottom"] = paddingValues[0];
                properties["padding-left"] = paddingValues[1];
                break;
              case 3:
                properties["padding-top"] = paddingValues[0];
                properties["padding-right"] = paddingValues[1];
                properties["padding-bottom"] = paddingValues[2];
                properties["padding-left"] = paddingValues[1];
                break;
              case 4:
                properties["padding-top"] = paddingValues[0];
                properties["padding-right"] = paddingValues[1];
                properties["padding-bottom"] = paddingValues[2];
                properties["padding-left"] = paddingValues[3];
                break;
            }
          }
          return;
        }
      }

      // Only convert to rem if it's not a var() expression
      if (!finalValue.includes("var(") && convertToRem) {
        finalValue = convertPxToRem(finalValue);
      }

      // Handle special cases for certain properties
      if (property.startsWith("border")) {
        if (property === "border-radius") {
          const borderRadiusValues = finalValue.split(" ").map((s) => s.trim());
          switch (borderRadiusValues.length) {
            case 1:
              properties["border-top-left-radius"] = borderRadiusValues[0];
              properties["border-top-right-radius"] = borderRadiusValues[0];
              properties["border-bottom-left-radius"] = borderRadiusValues[0];
              properties["border-bottom-right-radius"] = borderRadiusValues[0];
              break;
            case 2:
              properties["border-top-left-radius"] = borderRadiusValues[0];
              properties["border-top-right-radius"] = borderRadiusValues[1];
              properties["border-bottom-left-radius"] = borderRadiusValues[0];
              properties["border-bottom-right-radius"] = borderRadiusValues[1];
              break;
            case 3:
              properties["border-top-left-radius"] = borderRadiusValues[0];
              properties["border-top-right-radius"] = borderRadiusValues[1];
              properties["border-bottom-left-radius"] = borderRadiusValues[2];
              properties["border-bottom-right-radius"] = borderRadiusValues[1];
              break;
            case 4:
              properties["border-top-left-radius"] = borderRadiusValues[0];
              properties["border-top-right-radius"] = borderRadiusValues[1];
              properties["border-bottom-right-radius"] = borderRadiusValues[2];
              properties["border-bottom-left-radius"] = borderRadiusValues[3];
              break;
            default:
              console.error(
                "Unexpected number of border-radius values:",
                borderRadiusValues
              );
          }
        } else if (property === "border") {
          const [width, style, color] = finalValue
            .split(" ")
            .map((s) => s.trim());
          properties["border-top-width"] = width;
          properties["border-top-style"] = style;
          properties["border-top-color"] = color;
          properties["border-right-width"] = width;
          properties["border-right-style"] = style;
          properties["border-right-color"] = color;
          properties["border-bottom-width"] = width;
          properties["border-bottom-style"] = style;
          properties["border-bottom-color"] = color;
          properties["border-left-width"] = width;
          properties["border-left-style"] = style;
          properties["border-left-color"] = color;
        } else {
          const side = property.split("-")[1];
          const [width, style, color] = finalValue
            .split(" ")
            .map((s) => s.trim());
          properties[`border-${side}-width`] = width;
          properties[`border-${side}-style`] = style;
          properties[`border-${side}-color`] = color;
        }
      } else if (property === "gap") {
        properties["grid-row-gap"] = finalValue;
        properties["grid-column-gap"] = finalValue;
      } else if (property === "padding" && !finalValue.includes("var(")) {
        const paddingValues = finalValue.split(" ").map((s) => s.trim());
        switch (paddingValues.length) {
          case 1:
            properties["padding-top"] = paddingValues[0];
            properties["padding-right"] = paddingValues[0];
            properties["padding-bottom"] = paddingValues[0];
            properties["padding-left"] = paddingValues[0];
            break;
          case 2:
            properties["padding-top"] = paddingValues[0];
            properties["padding-right"] = paddingValues[1];
            properties["padding-bottom"] = paddingValues[0];
            properties["padding-left"] = paddingValues[1];
            break;
          case 3:
            properties["padding-top"] = paddingValues[0];
            properties["padding-right"] = paddingValues[1];
            properties["padding-bottom"] = paddingValues[2];
            properties["padding-left"] = paddingValues[1];
            break;
          case 4:
            properties["padding-top"] = paddingValues[0];
            properties["padding-right"] = paddingValues[1];
            properties["padding-bottom"] = paddingValues[2];
            properties["padding-left"] = paddingValues[3];
            break;
          default:
            console.error(
              "Unexpected number of padding values:",
              paddingValues
            );
        }
      } else if (property === "background") {
        if (finalValue.startsWith("linear-gradient")) {
          // Convert Figma gradient to Webflow format
          const gradient = finalValue.replace("180deg", "to bottom");
          properties["background-image"] = gradient;
        } else {
          // Assume it's a simple color value
          properties["background-color"] = finalValue;
        }
      } else {
        properties[property] = finalValue;
      }
    }
  });

  // Log unsupported properties if any
  if (unsupportedProperties.length > 0) {
    console.log("Unsupported properties:", unsupportedProperties);
    webflow.notify({
      type: "Info",
      message: `Some properties were not supported: ${unsupportedProperties
        .map((p) => p.property)
        .join(", ")}`,
    });
  }

  return properties;
}

// Add paste event listener to textarea
document.getElementById("figma-css").addEventListener("paste", (e) => {
  // Let the default paste behavior happen
  // The textarea will be populated with the pasted content
});

// Rename apply-styles to paste-and-apply
document.getElementById("paste-and-apply").addEventListener("click", () =>
  __awaiter(this, void 0, void 0, function* () {
    try {
      // Get the selected element
      const selectedElement = yield webflow.getSelectedElement();
      if (!selectedElement) {
        webflow.notify({
          type: "Error",
          message: "No element selected. Please select an element first.",
        });
        return;
      }

      // Get current breakpoint
      const currentBreakpoint = yield webflow.getMediaQuery();
      console.log("Current breakpoint:", currentBreakpoint);

      // Get the Figma CSS from the textarea
      const figmaCSS = document.getElementById("figma-css").value;
      if (!figmaCSS.trim()) {
        webflow.notify({
          type: "Error",
          message: "Please paste some CSS to apply.",
        });
        return;
      }

      // Parse the Figma CSS
      const parsedStyles = parseFigmaCSS(figmaCSS);
      console.log("Parsed styles:", parsedStyles);

      if (Object.keys(parsedStyles).length === 0) {
        webflow.notify({
          type: "Error",
          message: "No valid CSS properties found to apply.",
        });
        return;
      }

      // Get the element style
      console.log("Getting element styles...");
      const styles = yield selectedElement.getStyles();

      // Check validation flag first
      if (!window.cssValidationPassed) {
        console.log("Validation failed, not applying styles");
        return;
      }

      // Continue with style application only if validation passed
      let primaryStyle;
      if (styles && styles.length > 0) {
        primaryStyle = styles[0];
      } else {
        console.error("No styles found for element");
        webflow.notify({
          type: "Error",
          message: "No styles found for selected element.",
        });
        return;
      }

      try {
        // Get current style name
        const styleName = yield primaryStyle.getName();
        console.log("Updating style:", styleName);

        // Start applying the CSS
        console.log("Parsing CSS:", figmaCSS);
        const parsedCSS = parseFigmaCSS(figmaCSS);

        // Now apply each property
        for (const property in parsedCSS) {
          // Only set if property exists and has a value
          if (parsedCSS[property]) {
            try {
              console.log(
                `Setting ${property} to ${parsedCSS[property]} on breakpoint ${currentBreakpoint}`
              );
              yield primaryStyle.setProperty(property, parsedCSS[property], {
                breakpoint: currentBreakpoint,
              });
            } catch (propError) {
              console.error(`Error setting property ${property}:`, propError);
            }
          }
        }

        // Save the style
        console.log("Saving style...");
        yield primaryStyle.save();

        // Force a refresh of the element styles
        console.log("Saving element...");
        yield selectedElement.save();

        // Only show success message if validation passed
        if (window.cssValidationPassed) {
          webflow.notify({
            type: "Success",
            message: "Styles applied successfully!",
          });
        }
      } catch (error) {
        console.error("Error applying styles:", error);
        webflow.notify({
          type: "Error",
          message: "Failed to apply some styles. Please check your CSS.",
        });
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      webflow.notify({
        type: "Error",
        message: "An unexpected error occurred. Please try again.",
      });
    }
  })
);
