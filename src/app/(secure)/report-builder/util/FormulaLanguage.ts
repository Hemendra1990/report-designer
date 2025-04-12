import { javascript } from "@codemirror/lang-javascript";

// Use the JavaScript language support directly 
export function formulaLanguageSupport() {
  return javascript({
    // Configure JavaScript for formula-like syntax
    jsx: false,
    typescript: false
  });
} 