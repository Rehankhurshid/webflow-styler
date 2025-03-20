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

// CSS Processing Functions
function formatCSSDeclarations(css) {
  // Remove all types of comments (single-line and multi-line)
  css = css.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "");

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

function parseFigmaCSS(css) {
  // Remove comments and clean up the CSS
  css = css.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "");

  const properties = {};
  const declarations = css
    .split(";")
    .map((decl) => decl.trim())
    .filter((decl) => decl.length > 0);

  // Helper function to clean var() expressions
  function cleanVarExpression(value) {
    const varMatch = value.match(/var\((.*?),\s*(.*?)\)/);
    if (varMatch) {
      // Return the fallback value, removing any extra spaces
      return varMatch[2].trim();
    }
    return value;
  }

  declarations.forEach((declaration) => {
    const [property, value] = declaration.split(":").map((s) => s.trim());
    if (property && value) {
      if (property.startsWith("border")) {
        if (property === "border-radius") {
          const borderRadiusValues = value
            .split(" ")
            .map((s) => cleanVarExpression(s.trim()));
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
          }
        } else if (property === "border") {
          // Handle border with var() expressions
          const [width, style, color] = value
            .split(" ")
            .map((s) => cleanVarExpression(s.trim()));
          const sides = ["top", "right", "bottom", "left"];
          sides.forEach((side) => {
            properties[`border-${side}-width`] = width;
            properties[`border-${side}-style`] = style;
            properties[`border-${side}-color`] = color;
          });
        }
      } else if (property === "gap") {
        properties["grid-row-gap"] = cleanVarExpression(value);
        properties["grid-column-gap"] = cleanVarExpression(value);
      } else if (property === "padding") {
        const paddingValues = value
          .split(" ")
          .map((s) => cleanVarExpression(s.trim()));
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
      } else if (property === "background") {
        if (value.startsWith("linear-gradient")) {
          properties["background-image"] = value.replace("180deg", "to bottom");
        } else {
          properties["background-color"] = cleanVarExpression(value);
        }
      } else {
        // For all other properties, clean any var() expressions
        properties[property] = cleanVarExpression(value);
      }
    }
  });
  return properties;
}

// Style Application Functions
async function getCurrentBreakpoint() {
  try {
    const breakpoint = await webflow.getMediaQuery();
    console.log("Current Breakpoint:", breakpoint);
    return breakpoint;
  } catch (error) {
    console.error("Error getting breakpoint:", error);
    return null;
  }
}

// Initialize event listeners
document.addEventListener("DOMContentLoaded", () => {
  const applyButton = document.getElementById("paste-and-apply");
  const resetButton = document.getElementById("reset-styles");
  const figmaCSS = document.getElementById("figma-css");

  if (applyButton) {
    applyButton.addEventListener("click", async () => {
      try {
        const selectedElement = await webflow.getSelectedElement();
        if (!selectedElement) {
          throw new Error("No element selected");
        }

        const currentBreakpoint = await webflow.getMediaQuery();
        if (!currentBreakpoint) {
          throw new Error("Could not detect the current breakpoint.");
        }

        const css = figmaCSS.value;
        if (!css.trim()) {
          throw new Error("Please enter some CSS to apply");
        }

        const styles = parseFigmaCSS(css);
        const elementStyles = await selectedElement.getStyles();

        if (elementStyles && elementStyles.length > 1) {
          throw new Error("We can't apply styles to combo classes!");
        }

        let targetStyle;
        if (elementStyles && elementStyles.length === 1) {
          targetStyle = elementStyles[0];
        } else {
          const inputElement = document.getElementById("input-class");
          const inputValue = inputElement.value;
          if (!inputValue) {
            throw new Error(
              "Please enter a class name before applying styles."
            );
          }
          targetStyle = webflow.createStyle(inputValue);
          await selectedElement.setStyles([targetStyle]);
        }

        // Apply styles based on breakpoint
        if (currentBreakpoint === "main") {
          // For main/base breakpoint, don't pass any breakpoint option
          await targetStyle.setProperties(styles);
        } else {
          // For other breakpoints, include the breakpoint option
          await targetStyle.setProperties(styles, {
            breakpoint: currentBreakpoint,
          });
        }

        await targetStyle.save();
        await selectedElement.save();

        webflow.notify({
          type: "Success",
          message:
            currentBreakpoint === "main"
              ? "Base styles applied successfully"
              : `Styles applied to ${currentBreakpoint} breakpoint`,
        });
      } catch (error) {
        console.error("Error applying styles:", error);
        webflow.notify({
          type: "Error",
          message: error.message || "Failed to apply styles",
        });
      }
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", async () => {
      try {
        const selectedElement = await webflow.getSelectedElement();
        if (!selectedElement) {
          throw new Error("No element selected");
        }

        const elementStyles = await selectedElement.getStyles();
        if (!elementStyles || elementStyles.length === 0) {
          throw new Error("No styles to reset");
        }

        await elementStyles[0].clearAllProperties();
        await elementStyles[0].save();
        await selectedElement.save();

        webflow.notify({
          type: "Success",
          message: "Styles reset successfully!",
        });
      } catch (error) {
        console.error("Error resetting styles:", error);
        webflow.notify({
          type: "Error",
          message: error.message || "Failed to reset styles",
        });
      }
    });
  }

  if (figmaCSS) {
    figmaCSS.addEventListener("paste", (e) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData("text");
      const cleanedText = pastedText.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "");

      const start = figmaCSS.selectionStart;
      const end = figmaCSS.selectionEnd;
      const text = figmaCSS.value;
      const before = text.substring(0, start);
      const after = text.substring(end);
      figmaCSS.value = before + cleanedText + after;

      figmaCSS.selectionStart = figmaCSS.selectionEnd =
        start + cleanedText.length;
    });
  }
});
