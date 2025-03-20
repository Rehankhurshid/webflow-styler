// Define types for the options parameter
interface BreakpointAndPseudo {
  breakpoint?: 'xxl' | 'xl' | 'large' | 'main' | 'medium' | 'small' | 'tiny';
  pseudo?: 'noPseudo' | 'nth-child(odd)' | 'nth-child(even)' | 'first-child' | 'last-child' | 'hover' | 'active' | 'pressed' | 'visited' | 'focus' | 'focus-visible' | 'focus-within' | 'placeholder' | 'empty' | 'before' | 'after';
}

// Define type for style property
type StyleProperty = string;

// Get a specific style property
export const getStyleProperty = async (
  style: any,
  property: StyleProperty,
  options: BreakpointAndPseudo = {}
): Promise<any> => {
  try {
    const value = await style.getProperty(property, options);
    return value;
  } catch (error) {
    console.error('Error getting style property:', error);
    return null;
  }
};

// Set a specific style property
export const setStyleProperty = async (
  style: any,
  property: StyleProperty,
  value: string,
  options: BreakpointAndPseudo = {}
): Promise<boolean> => {
  try {
    await style.setProperty(property, value, options);
    await style.save();
    return true;
  } catch (error) {
    console.error('Error setting style property:', error);
    return false;
  }
};

// Remove a specific style property
export const removeStyleProperty = async (
  style: any,
  property: StyleProperty,
  options: BreakpointAndPseudo = {}
): Promise<boolean> => {
  try {
    await style.removeProperty(property, options);
    await style.save();
    return true;
  } catch (error) {
    console.error('Error removing style property:', error);
    return false;
  }
};

// Remove multiple style properties
export const removeStyleProperties = async (
  style: any,
  properties: StyleProperty[],
  options: BreakpointAndPseudo = {}
): Promise<boolean> => {
  try {
    await style.removeProperties(properties, options);
    await style.save();
    return true;
  } catch (error) {
    console.error('Error removing style properties:', error);
    return false;
  }
};

// Remove all style properties
export const removeAllStyleProperties = async (style: any): Promise<boolean> => {
  try {
    await style.removeAllProperties();
    await style.save();
    return true;
  } catch (error) {
    console.error('Error removing all style properties:', error);
    return false;
  }
}; 