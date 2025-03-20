// Subscribe to changes in the selected element
const inputClassField = document.querySelector(".input-field");
// Get the wrapper div by getting the input field's parent element
const inputClassWrapper = inputClassField?.parentElement;
const elementWrap = document.querySelector(".el-class_wrap");
const classButton = elementWrap?.querySelector(".button");
const singleClassDiv = document.querySelector(".single-class");
const infoBlock = document.querySelector(".info_block");

// Add input event listener to update button text
if (inputClassField) {
  inputClassField.addEventListener("input", (event) => {
    if (classButton) {
      const inputValue = event.target.value.trim();
      if (inputValue) {
        classButton.textContent = inputValue;
        classButton.style.display = "flex";
      } else {
        classButton.textContent = "Add new class";
        classButton.style.display = "none";
      }
    }
  });
}

const selectedElementCallback = async (element) => {
  // Get references to DOM elements

  // Hide info block by default
  if (infoBlock) {
    infoBlock.style.display = "none";
  }

  // If no element is selected
  if (!element) {
    console.log("No element selected, showing info");
    if (singleClassDiv) {
      singleClassDiv.style.display = "none";
    }
    if (classButton) {
      classButton.textContent = "No element selected";
      classButton.style.display = "flex";
    }
    if (inputClassWrapper) {
      inputClassWrapper.style.display = "none";
    }
    if (infoBlock) {
      // Update info block text for no element
      const titleEl = infoBlock.querySelector(".text-size-small-medium");
      const descEl = infoBlock.querySelector(".text-color-text2");
      if (titleEl) titleEl.textContent = "Select a Valid Element";
      if (descEl) descEl.textContent = "Please select an element to continue";
      infoBlock.style.display = "block";
    }
    return;
  }

  try {
    // Get element styles
    const elementStyles = await element.getStyles();

    if (!elementStyles) {
      console.error("Failed to get element styles");
      if (singleClassDiv) {
        singleClassDiv.style.display = "none";
      }
      if (infoBlock) {
        // Update info block text for no styles
        const titleEl = infoBlock.querySelector(".text-size-small-medium");
        const descEl = infoBlock.querySelector(".text-color-text2");
        if (titleEl) titleEl.textContent = "Element has no styles";
        if (descEl)
          descEl.textContent = "The selected element doesn't have any styles";
        infoBlock.style.display = "block";
      }
      return;
    }

    // Check if element has multiple classes
    if (elementStyles.length > 1) {
      if (singleClassDiv) {
        singleClassDiv.style.display = "none";
      }
      if (infoBlock) {
        // Update info block text for combo class
        const titleEl = infoBlock.querySelector(".text-size-small-medium");
        const descEl = infoBlock.querySelector(".text-color-text2");
        if (titleEl)
          titleEl.textContent = "Select an Element with single class";
        if (descEl) descEl.textContent = "Combo Class is not supported";
        infoBlock.style.display = "block";
      }
      return;
    }

    // Hide info block since we have a valid element with a single class
    if (infoBlock) {
      infoBlock.style.display = "none";
    }

    const currentClassName = elementStyles[0]?.getName();

    if (elementStyles.length === 1) {
      // Single class case
      if (classButton) {
        classButton.textContent = currentClassName;
        classButton.style.display = "flex";
      }
      if (inputClassWrapper) {
        inputClassWrapper.style.display = "none";
      }
      if (singleClassDiv) {
        singleClassDiv.style.display = "block";
      }
    } else if (elementStyles.length === 0) {
      // No classes case
      if (classButton) {
        // Hide button initially until user types in the input
        classButton.style.display = "none";
        classButton.textContent = "Add new class";
      }
      if (inputClassWrapper) {
        inputClassWrapper.style.display = "flex";
        // Clear the input field
        if (inputClassField) {
          inputClassField.value = "";
        }
      }
      if (singleClassDiv) {
        singleClassDiv.style.display = "block";
      }
    }
  } catch (error) {
    console.error("Error handling element selection:", error);
    if (singleClassDiv) {
      singleClassDiv.style.display = "none";
    }
    if (infoBlock) {
      // Update info block text for error
      const titleEl = infoBlock.querySelector(".text-size-small-medium");
      const descEl = infoBlock.querySelector(".text-color-text2");
      if (titleEl) titleEl.textContent = "Element not supported";
      if (descEl)
        descEl.textContent = "Please select an element with a single class";
      infoBlock.style.display = "block";
    }
  }
};

const unsubscribeSelectedElement = webflow.subscribe(
  "selectedelement",
  selectedElementCallback
);
