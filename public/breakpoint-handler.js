// Function to update the visible SVG based on the current breakpoint
function updateBreakpointSVG(breakpoint) {
  // Hide all breakpoint SVGs first
  const allSVGs = document.querySelectorAll(".breakpoint-svg");
  allSVGs.forEach((svg) => (svg.style.display = "none"));

  // Show the SVG for the current breakpoint
  const currentSVG = document.querySelector(
    `.breakpoint-svg[data-breakpoint="${breakpoint}"]`
  );
  if (currentSVG) {
    currentSVG.style.display = "block";
    console.log("Updated SVG for breakpoint:", breakpoint);
  } else {
    // If no matching breakpoint SVG found, show the main one as default
    const mainSVG = document.querySelector(
      '.breakpoint-svg[data-breakpoint="main"]'
    );
    if (mainSVG) {
      mainSVG.style.display = "block";
      console.log("Showing main SVG as fallback");
    }
  }
}

// Function to get and handle breakpoint changes
async function handleBreakpointChange() {
  try {
    // Get the current breakpoint from Webflow
    const breakpointId = await webflow.getMediaQuery();
    console.log("Current breakpoint detected:", breakpointId);

    // Log detailed breakpoint information
    switch (breakpointId) {
      case "xxl":
        console.log("Very large screens or high-resolution monitors");
        break;
      case "xl":
        console.log("Large desktop monitors");
        break;
      case "large":
        console.log("Standard desktop monitors");
        break;
      case "main":
        console.log("Smaller desktops or large tablets");
        break;
      case "medium":
        console.log("Tablets and some large phones");
        break;
      case "small":
        console.log("Larger mobile devices");
        break;
      case "tiny":
        console.log("Smallest mobile devices");
        break;
    }

    // Update the SVG display based on the breakpoint
    updateBreakpointSVG(breakpointId);

    return breakpointId;
  } catch (error) {
    console.error("Error getting breakpoint:", error);
    // Show main SVG as fallback in case of error
    updateBreakpointSVG("main");
    return "error";
  }
}

// Initialize breakpoint handling
async function initBreakpointHandler() {
  try {
    // Set initial breakpoint
    await handleBreakpointChange();

    // Set up an interval to check for breakpoint changes
    setInterval(async () => {
      await handleBreakpointChange();
    }, 1000); // Check every second
  } catch (error) {
    console.error("Error initializing breakpoint handler:", error);
    // Show main SVG as fallback
    updateBreakpointSVG("main");
  }
}

// Start handling breakpoints when the DOM is loaded
document.addEventListener("DOMContentLoaded", initBreakpointHandler);
