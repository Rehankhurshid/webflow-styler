
// get breakpoint and subscribe to breakpoint changes
export const getBreakpoint = async () => {
    try{
        const breakpoint = await webflow.getMediaQuery();
        return breakpoint
    }catch(error){
        return "error"
    }
}

const breakpoint =  document.querySelector(".breakpointDisplay")
async function updateBreakpoint() {
    const breakpointId = await getBreakpoint();
    breakpoint.innerHTML = breakpointId || '';
    // console.log((breakpoint as any).getProperty("background-color"));
    // let styleProperties = myStyle.getProperties();
}

updateBreakpoint();

const mediaQueryCallback = () => {
  updateBreakpoint()
};

const unsubscribeMediaQuery = webflow.subscribe('mediaquery', mediaQueryCallback);



// fetch selected display class ans display

const selectedElementDisplay =  document.querySelector(".classDisplay")
// Subscribe to changes in the selected element

const selectedElementCallback = (element) => {
  const inputElement = document.getElementById("input-class")
  if (element) {
    // check if there is one more class in element
    (async function(){
    const elementStyles = await element?.getStyles();
    const currentClassName = elementStyles[0]?.getName(); 
      if( elementStyles.length === 1){
        inputElement.style.display = "none";
        selectedElementDisplay.innerHTML =  currentClassName 
      }
      else if (elementStyles.length === 0){
        inputElement.style.display = "block";
        selectedElementDisplay.innerHTML = "Add new class"
      }
      else {
        inputElement.style.display = "none";
        selectedElementDisplay.innerHTML = "combo class issue"
      }
    })()
  } else {
    console.log('No element is currently selected.');
  }
};

const unsubscribeSelectedElement = webflow.subscribe('selectedelement', selectedElementCallback)
