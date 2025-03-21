function formatCSSDeclarations(css: string): string {
  // Remove comments
  css = css.replace(/\/\*.*?\*\//g, "");

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
function parseFigmaCSS(css: string): { [key: string]: string } {
  const formattedCSS = formatCSSDeclarations(css);
  const properties = {};
  const cssLines = formattedCSS.split(";\n    ");

  cssLines.forEach((line) => {
    const [property, value] = line.split(":").map((s) => s.trim());
    if (property && value) {
      if (property.startsWith("border")) {
        if (property === "border-radius") {
          const borderRadiusValues = value.split(" ").map((s) => s.trim());
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
          // Updated code to handle var function in border property
          const borderMatch = value.match(
            /(\d+px) solid var\((.*?),\s*(#[a-z0-9]+)\)/i
          );
          if (borderMatch && borderMatch.length === 4) {
            const [, width, varName, color] = borderMatch;
            const sides = ["top", "right", "bottom", "left"];
            sides.forEach((side) => {
              properties[`border-${side}-width`] = width;
              properties[`border-${side}-style`] = "solid";
              properties[`border-${side}-color`] = `var(${varName}, ${color})`;
            });
          } else {
            // Fallback to your original code if the regex match fails
            const [width, style, color] = value.split(" ").map((s) => s.trim());
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
          }
        } else {
          const side = property.split("-")[1];
          const [width, style, color] = value.split(" ").map((s) => s.trim());
          properties[`border-${side}-width`] = width;
          properties[`border-${side}-style`] = style;
          properties[`border-${side}-color`] = color;
        }
      } else if (property === "gap") {
        properties["grid-row-gap"] = value;
        properties["grid-column-gap"] = value;
      } else if (property === "padding") {
        const paddingValues = value.split(" ").map((s) => s.trim());
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
        if (value.startsWith("linear-gradient")) {
          // Convert Figma gradient to Webflow format
          const gradient = value.replace("180deg", "to bottom");
          properties["background-image"] = gradient;
        } else if (value.startsWith("var")) {
          // Updated regex to handle the new format
          const colorMatch = value.match(/var\(.*?,\s*(#[a-z0-9]+)\)/i);
          if (colorMatch && colorMatch[1]) {
            properties["background-color"] = colorMatch[1];
          }
        } else {
          // Assume it's a simple color value
          properties["background-color"] = value;
        }
      } else {
        properties[property] = value;
      }
    }
  });

  return properties;
}

// Apply styles event listner
document.getElementById("apply-styles").addEventListener("click", async () => {
  // Get the selected element
  const selectedElement: any = await webflow.getSelectedElement();
  if (!selectedElement) {
    webflow.notify({
      type: "Error",
      message: "Something went wrong, try again!",
    });
    return;
  }

  // Get the Figma CSS from the textarea
  const figmaCSS = (document.getElementById("figma-css") as HTMLInputElement)
    .value;

  // Parse the Figma CSS
  const parsedStyles = parseFigmaCSS(figmaCSS);

  // input
  const inputElement = document.getElementById(
    "input-class"
  ) as HTMLInputElement;
  const inputValue = inputElement.value;

  // Get the styles of the selected element
  const elementStyles = await selectedElement.getStyles();

  // If there are styles, use the first one (assuming one style per element for simplicity)
  if (elementStyles && elementStyles.length > 1) {
    console.log("1st");
    webflow.notify({
      type: "Error",
      message: "We can't apply styles to combo classes!",
    });
  } else if (elementStyles && elementStyles.length === 1) {
    console.log("2");
    const primaryStyle = elementStyles[0];
    console.log(parsedStyles);
    primaryStyle.setProperties(parsedStyles);
    await primaryStyle.save();
    console.log(await primaryStyle.save());
  } else if (elementStyles && elementStyles.length === 0) {
    console.log("3rd");
    // If no styles, create a new one and set it to the element
    const newStyle = webflow.createStyle(inputValue);
    newStyle.setProperties(parsedStyles);
    await newStyle.save();
    selectedElement.setStyles([newStyle]);
    await selectedElement.save();
  } else {
    console.log("4");
  }
});

// Reset styles event listener
document.getElementById("reset-styles").addEventListener("click", async () => {
  const selectedElement: any = await webflow.getSelectedElement();
  if (!selectedElement) {
    webflow.notify({
      type: "Error",
      message: "Something went wrong, try again!",
    });
    return;
  }
  const elementStyles = await selectedElement.getStyles();
  const styleName = elementStyles[0].getName();
  elementStyles[0].clearAllProperties();
  elementStyles[0].save();
});
