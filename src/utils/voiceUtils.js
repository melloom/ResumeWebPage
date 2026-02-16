// Natural voice processing utilities
export const processTextForSpeech = (text) => {
  // Add natural pauses and emphasis
  let processed = text;
  
  // Add pauses for punctuation
  processed = processed
    .replace(/([.!?])\s+/g, '$1<break time="800ms"/>')
    .replace(/([,;:])\s+/g, '$1<break time="400ms"/>')
    .replace(/\b(But|However|Although|Though)\b/g, '<emphasis level="moderate">$1</emphasis>')
    .replace(/\b(Actually|In fact|Really)\b/g, '<emphasis level="strong">$1</emphasis>')
    .replace(/\b(amazing|awesome|fantastic|incredible|brilliant)\b/g, '<emphasis level="moderate">$1</emphasis>');
  
  // Handle abbreviations
  processed = processed
    .replace(/\bAI\b/g, 'A.I.')
    .replace(/\bUI\b/g, 'U.I.')
    .replace(/\bUX\b/g, 'U.X.')
    .replace(/\bAPI\b/g, 'A.P.I.')
    .replace(/\bJS\b/g, 'J.S.')
    .replace(/\bTS\b/g, 'T.S.')
    .replace(/\bCSS\b/g, 'C.S.S.')
    .replace(/\bHTML\b/g, 'H.T.M.L.')
    .replace(/\bSQL\b/g, 'S.Q.L.');
  
  // Natural number pronunciation
  processed = processed.replace(/\b(\d{4})\b/g, (match, year) => {
    if (year >= 2000 && year <= 2009) {
      return year.replace(/20/, 'twenty ').replace(/(\d)/, '$1');
    } else if (year >= 2010 && year <= 2099) {
      return year.replace(/20/, 'twenty ').replace(/(\d)/, '$1');
    }
    return year;
  });
  
  return processed;
};

// Add natural intonation patterns
export const addIntonation = (text) => {
  // Questions end with upward inflection
  if (text.trim().endsWith('?')) {
    return text.replace(/\?$/, '<pitch change="+10%">?</pitch>');
  }
  
  // Excitement for exclamation marks
  if (text.trim().endsWith('!')) {
    return text.replace(/!$/, '<pitch change="+20%">!</pitch>');
  }
  
  return text;
};

// Convert contractions to full words for better TTS
export const expandContractions = (text) => {
  const contractions = {
    "I'm": "I am",
    "you're": "you are",
    "he's": "he is",
    "she's": "she is",
    "it's": "it is",
    "we're": "we are",
    "they're": "they are",
    "that's": "that is",
    "there's": "there is",
    "here's": "here is",
    "what's": "what is",
    "who's": "who is",
    "where's": "where is",
    "when's": "when is",
    "why's": "why is",
    "how's": "how is",
    "I've": "I have",
    "you've": "you have",
    "we've": "we have",
    "they've": "they have",
    "I'll": "I will",
    "you'll": "you will",
    "he'll": "he will",
    "she'll": "she will",
    "it'll": "it will",
    "we'll": "we will",
    "they'll": "they will",
    "I'd": "I would",
    "you'd": "you would",
    "he'd": "he would",
    "she'd": "she would",
    "we'd": "we would",
    "they'd": "they would",
    "can't": "cannot",
    "won't": "will not",
    "don't": "do not",
    "doesn't": "does not",
    "didn't": "did not",
    "haven't": "have not",
    "hasn't": "has not",
    "hadn't": "had not",
    "isn't": "is not",
    "aren't": "are not",
    "wasn't": "was not",
    "weren't": "were not",
    "let's": "let us"
  };
  
  let result = text;
  for (const [contraction, expansion] of Object.entries(contractions)) {
    const regex = new RegExp(`\\b${contraction}\\b`, 'gi');
    result = result.replace(regex, expansion);
  }
  
  return result;
};
