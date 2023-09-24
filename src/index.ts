document.getElementById("apply-styles").addEventListener("click", async () => {
  // Get the selected element
  const selectedElement : any = await webflow.getSelectedElement();
  if (!selectedElement) {
    webflow.notify({
      type: "Error",
      message: "Something went wrong, try again!",
    });
    return;
  }

  // Get the Figma CSS from the textarea
  const figmaCSS  = (document.getElementById("figma-css") as HTMLInputElement).value;


  // Parse the Figma CSS
  const parsedStyles = parseFigmaCSS(figmaCSS);

  // input
const inputElement = document.getElementById("input-class") as HTMLInputElement;
const inputValue = inputElement.value;
console.log(inputValue);

  // Get the styles of the selected element
  const elementStyles = await selectedElement.getStyles();


  // If there are styles, use the first one (assuming one style per element for simplicity)
  if(elementStyles && elementStyles.length > 1){
    console.log("1st")
    webflow.notify({
      type: "Error",
      message: "We can't apply styles to combo classes!",
    });
  }else if (elementStyles && elementStyles.length  === 1) {
    console.log("2")
    const primaryStyle = elementStyles[0];
    primaryStyle.setProperties(parsedStyles);
    await primaryStyle.save();
  }else if(elementStyles && elementStyles.length  === 0){
    console.log("3rd")
    // If no styles, create a new one and set it to the element
    const newStyle = webflow.createStyle(inputValue);
    newStyle.setProperties(parsedStyles);
    await newStyle.save();
    selectedElement.setStyles([newStyle]);
    await selectedElement.save();
  }else {
    console.log("4")
  }
});

function parseFigmaCSS(css) {
  const properties = {};
  const cssLines = css.split(";");

  cssLines.forEach((line) => {
    const [property, value] = line.split(":").map((s) => s.trim());
    if (property && value) {
      properties[property] = value;
    }
  });

  return properties;
}