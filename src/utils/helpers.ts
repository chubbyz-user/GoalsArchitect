/**
 * Generates a simple unique ID using random characters
 * @returns A unique string ID
 */
export const generateId = (): string => Math.random().toString(36).substring(2, 9);

/**
 * Extracts JSON from markdown code blocks or raw text
 * Handles various formats and removes citation markers
 * @param text - The text potentially containing JSON
 * @returns Cleaned JSON string
 */
export const cleanJson = (text: string): string => {
  try {
    // Remove markdown code blocks (handle various formats like ```json, ```, etc.)
    let cleaned = text.replace(/```(?:json)?\s*/g, "").replace(/```\s*$/g, "");
    
    // Locate the first { or [ and the last } or ]
    const firstOpen = cleaned.search(/[\{\[]/);
    const lastClose = cleaned.search(/[\}\]][^}\]]*$/);
    
    if (firstOpen !== -1 && lastClose !== -1) {
      cleaned = cleaned.substring(firstOpen, lastClose + 1);
    }
    
    // Attempt to remove citation markers like [1], [2] which might appear if grounding is used
    // incorrectly by the model.
    cleaned = cleaned.replace(/\[\d+\]/g, ""); 
    cleaned = cleaned.replace(/\[Source\]/g, "");
    
    return cleaned;
  } catch (e) {
    return text;
  }
};
