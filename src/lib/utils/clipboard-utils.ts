/**
 * Copies text to the clipboard with fallback for non-secure contexts.
 * @param text The text to copy
 * @returns Promise that resolves if copy was successful, rejects otherwise.
 */
export async function copyToClipboard(text: string): Promise<void> {
  // Try modern navigator.clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (err) {
      console.warn('Navigator clipboard failed, trying fallback:', err);
    }
  }

  // Fallback: execCommand('copy')
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Ensure hidden but part of DOM
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    if (successful) {
      return Promise.resolve();
    } else {
      return Promise.reject(new Error('execCommand copy failed'));
    }
  } catch (err) {
    return Promise.reject(err);
  }
}
