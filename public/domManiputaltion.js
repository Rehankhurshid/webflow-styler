var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// get breakpoint and subscribe to breakpoint changes
export const getBreakpoint = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const breakpoint = yield webflow.getMediaQuery();
        return breakpoint;
    }
    catch (error) {
        return "error";
    }
});
const breakpoint = document.querySelector(".breakpointDisplay");
function updateBreakpoint() {
    return __awaiter(this, void 0, void 0, function* () {
        const breakpointId = yield getBreakpoint();
        breakpoint.innerHTML = breakpointId || '';
        // console.log((breakpoint as any).getProperty("background-color"));
        // let styleProperties = myStyle.getProperties();
    });
}
updateBreakpoint();
const mediaQueryCallback = () => {
    updateBreakpoint();
};
const unsubscribeMediaQuery = webflow.subscribe('mediaquery', mediaQueryCallback);
// fetch selected display class ans display
const selectedElementDisplay = document.querySelector(".classDisplay");
// Subscribe to changes in the selected element
const selectedElementCallback = (element) => {
    const inputElement = document.getElementById("input-class");
    if (element) {
        // check if there is one more class in element
        (function () {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                const elementStyles = yield (element === null || element === void 0 ? void 0 : element.getStyles());
                const currentClassName = (_a = elementStyles[0]) === null || _a === void 0 ? void 0 : _a.getName();
                if (elementStyles.length === 1) {
                    inputElement.style.display = "none";
                    selectedElementDisplay.innerHTML = currentClassName;
                }
                else if (elementStyles.length === 0) {
                    inputElement.style.display = "block";
                    selectedElementDisplay.innerHTML = "Add new class";
                }
                else {
                    inputElement.style.display = "none";
                    selectedElementDisplay.innerHTML = "combo class issue";
                }
            });
        })();
    }
    else {
        console.log('No element is currently selected.');
    }
};
const unsubscribeSelectedElement = webflow.subscribe('selectedelement', selectedElementCallback);
