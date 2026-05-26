// UwUifier class - JavaScript implementation inspired by uwuipy
class UwUifier {
  constructor(options = {}) {
    this.stutterChance = options.stutterChance || 0.003;   // 0.3% per word
    this.faceChance = options.faceChance || 0.002;         // 0.2% per word
    this.actionChance = options.actionChance || 0.0025;    // 0.25% per word
    this.exclamationChance = options.exclamationChance || 0.1; // 10% per exclamation
    this.transformChance = options.transformChance || 0.03;    // 3% per character
    this.power = options.power || 2;
    
    this.faces = [
      "(・`ω´・)", ";;w;;", "owo", "UwU", ">w<", "^w^",
      "(˘ω˘)", "( ͡° ͜ʖ ͡°)", ":3", ":D", "xD", "x3",
      "ʘwʘ", "(ᵘʷᵘ)", "(ᵘﻌᵘ)", "( ᵘ ꒳ ᵘ ✼)", "(U ﹏ U)",
      "~(˘▾˘~)", "(˘▾˘ )", "ヽ(>∀<☆)ノ", "o(≧▽≦)o"
    ];
    
    this.actions = [
      "*blushes*", "*whispers to self*", "*cries*", "*screams*",
      "*sweats*", "*twerks*", "*runs away*", "*screeches*",
      "*walks away*", "*looks at you*","*starts twerking*", "*huggles tightly*", "*boops your nose*",
      "*wags tail*", "*nuzzles*", "*glomps*"
    ];
    
    this.exclamations = ["?!?!", "?!?1", "!!11", "?!?!"];
    
    // Stutter configuration
    this.MIN_WORD_LENGTH_FOR_STUTTER = 2;
    this.MAX_STUTTER_COUNT = 3;
    this.MIN_STUTTER_COUNT = 1;
  }

  // Main uwuify function
  uwuify(text) {
    if (!text || typeof text !== 'string') return text;
    
    let result = text;
    
    // Apply transformations based on power level
    if (this.power >= 1) {
      result = this.substituteWords(result);
    }
    
    if (this.power >= 2) {
      result = this.nyaify(result);
    }
    
    // Add stuttering
    result = this.addStutter(result);
    
    // Add faces
    result = this.addFaces(result);
    
    // Add actions
    result = this.addActions(result);
    
    // Transform exclamations
    result = this.transformExclamations(result);
    
    return result;
  }

  // Core uwu substitutions
  substituteWords(text) {
    const substitutions = [
      [/(?:r|l)/g, (match) => Math.random() < this.transformChance ? 'w' : match],
      [/(?:R|L)/g, (match) => Math.random() < this.transformChance ? 'W' : match],
      [/n([aeiou])/g, (match, vowel) => Math.random() < this.transformChance ? 'ny' + vowel : match],
      [/N([aeiou])/g, (match, vowel) => Math.random() < this.transformChance ? 'Ny' + vowel : match],
      [/N([AEIOU])/g, (match, vowel) => Math.random() < this.transformChance ? 'NY' + vowel : match],
      [/ove/g, (match) => Math.random() < this.transformChance ? 'uv' : match]
    ];
    
    let result = text;
    for (const [pattern, replacement] of substitutions) {
      result = result.replace(pattern, replacement);
    }
    
    return result;
  }

  // Nyaify (power level 2+)
  nyaify(text) {
    return text.replace(/na/g, (match) => Math.random() < this.transformChance ? 'nya' : match)
               .replace(/ne/g, (match) => Math.random() < this.transformChance ? 'nye' : match)
               .replace(/ni/g, (match) => Math.random() < this.transformChance ? 'nyi' : match)
               .replace(/no/g, (match) => Math.random() < this.transformChance ? 'nyo' : match)
               .replace(/nu/g, (match) => Math.random() < this.transformChance ? 'nyu' : match)
               .replace(/Na/g, (match) => Math.random() < this.transformChance ? 'Nya' : match)
               .replace(/Ne/g, (match) => Math.random() < this.transformChance ? 'Nye' : match)
               .replace(/Ni/g, (match) => Math.random() < this.transformChance ? 'Nyi' : match)
               .replace(/No/g, (match) => Math.random() < this.transformChance ? 'Nyo' : match)
               .replace(/Nu/g, (match) => Math.random() < this.transformChance ? 'Nyu' : match);
  }

  // Add stuttering
  addStutter(text) {
    const words = text.split(' ');
    const result = words.map(word => {
      if (word.length > this.MIN_WORD_LENGTH_FOR_STUTTER && Math.random() < this.stutterChance) {
        const firstChar = word[0];
        const stutterCount = Math.floor(Math.random() * this.MAX_STUTTER_COUNT) + this.MIN_STUTTER_COUNT;
        const stutter = Array(stutterCount).fill(firstChar.toLowerCase()).join('-');
        return stutter + '-' + word;
      }
      return word;
    });
    return result.join(' ');
  }

  // Add faces randomly
  addFaces(text) {
    const words = text.split(' ');
    const result = [];
    
    for (let i = 0; i < words.length; i++) {
      result.push(words[i]);
      if (Math.random() < this.faceChance) {
        result.push(this.randomChoice(this.faces));
      }
    }
    
    return result.join(' ');
  }

  // Add actions randomly
  addActions(text) {
    const words = text.split(' ');
    const result = [];
    
    for (let i = 0; i < words.length; i++) {
      result.push(words[i]);
      if (Math.random() < this.actionChance) {
        result.push(this.randomChoice(this.actions));
      }
    }
    
    return result.join(' ');
  }

  // Transform exclamation marks
  transformExclamations(text) {
    return text.replace(/!+/g, (match) => {
      if (Math.random() < this.exclamationChance) {
        return this.randomChoice(this.exclamations);
      }
      return match;
    });
  }

  // Utility: random choice from array
  randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
}

// Make UwUifier available globally
if (typeof window !== 'undefined') {
  window.UwUifier = UwUifier;
}
