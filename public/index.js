var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
document.getElementById("apply-styles").addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
    // Get the selected element
    const selectedElement = yield webflow.getSelectedElement();
    if (!selectedElement) {
        webflow.notify({
            type: "Error",
            message: "Something went wrong, try again!",
        });
        return;
    }
    // Get the Figma CSS from the textarea
    const figmaCSS = document.getElementById("figma-css").value;
    // Parse the Figma CSS
    const parsedStyles = parseFigmaCSS(figmaCSS);
    // input
    const inputElement = document.getElementById("input-class");
    const inputValue = inputElement.value;
    console.log(inputValue);
    // Get the styles of the selected element
    const elementStyles = yield selectedElement.getStyles();
    // If there are styles, use the first one (assuming one style per element for simplicity)
    if (elementStyles && elementStyles.length > 1) {
        console.log("1st");
        webflow.notify({
            type: "Error",
            message: "We can't apply styles to combo classes!",
        });
    }
    else if (elementStyles && elementStyles.length === 1) {
        console.log("2");
        const primaryStyle = elementStyles[0];
        primaryStyle.setProperties(parsedStyles);
        yield primaryStyle.save();
    }
    else if (elementStyles && elementStyles.length === 0) {
        console.log("3rd");
        // If no styles, create a new one and set it to the element
        const newStyle = webflow.createStyle(inputValue);
        newStyle.setProperties(parsedStyles);
        yield newStyle.save();
        selectedElement.setStyles([newStyle]);
        yield selectedElement.save();
    }
    else {
        console.log("4");
    }
}));
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
