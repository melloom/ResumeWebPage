/**
 * Share content using the Web Share API
 * @param {Object} shareData - Data to be shared
 * @param {string} shareData.title - Title of the content
 * @param {string} shareData.text - Text description
 * @param {string} shareData.url - URL to share (defaults to current URL)
 * @returns {Promise<void>}
 */
export const shareContent = async (shareData) => {
  try {
    // Check if Web Share API is supported
    if (!navigator.share) {
      throw new Error('Web Share API not supported');
    }
    
    const url = shareData.url || window.location.href;
    
    // Share the content
    await navigator.share({
      title: shareData.title || document.title,
      text: shareData.text || '',
      url: url
    });
    
    console.log('Content shared successfully');
    return true;
  } catch (error) {
    // Handle errors gracefully
    console.error('Error sharing content:', error);
    
    // Use fallback if Web Share API failed (copy to clipboard)
    if (error.name !== 'AbortError') { // Don't show fallback if user canceled
      try {
        await navigator.clipboard.writeText(shareData.url || window.location.href);
        alert('Link copied to clipboard!');
        return true;
      } catch (clipboardError) {
        console.error('Clipboard fallback failed:', clipboardError);
        return false;
      }
    }
    return false;
  }
};

/**
 * Share resume specific content
 * @returns {Promise<boolean>}
 */
export const shareResume = async () => {
  return shareContent({
    title: 'Melvin Peralta | Professional Resume',
    text: 'Check out Melvin Peralta\'s professional resume and portfolio!',
    url: `${window.location.origin}/resume`
  });
};

/**
 * Check if Web Share API is available
 * @returns {boolean}
 */
export const isShareSupported = () => {
  return !!navigator.share;
};
