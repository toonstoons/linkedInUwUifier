# LinkedIn UwUifier

A browser extension that transforms LinkedIn posts into uwu-speak for your own entertainment. Inspired by [uwuipy](https://github.com/Cuprum77/uwuipy).

## Disclaimer

This extension is held together with DOM selectors and will probably break when LinkedIn updates their UI. Built purely for entertainment. Use at your own risk, and maybe disable it before job interviews.

## Credits

Logic heavily inspired by [uwuipy](https://github.com/Cuprum77/uwuipy) by @Cuprum77. 

## Examples

**Before:** "Thrilled to announce my transition into a synergistic ecosystem! Let's deep-dive into leveraging AI to optimize our paradigm shifts. #GrowthMindset
"

**After:** "Thrilled to announce my t-t-transition i-i-i-into a *glomps* synergistic *huggles tightly* ecosystem???!?1?1?111 Wet's deep-dive into weveraging AI to optimize ( ͡° ͜ʖ ͡°) ouw paradigm shifts. x3 hashtag#GrowthMindset"

## Installation

1. Open Chrome/Brave/Edge and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select this folder

## Usage

### Basic Usage

1. **Enable the Extension**
   - Click the extension icon in your toolbar.
   - Ensure the toggle is set to **Enable UwUification**.
   - Visit or refresh [linkedin.com](https://www.linkedin.com).

2. **See the Magic**
   - All posts on your timeline will be automatically uwuified!
   - New posts will transform as you scroll.
   - Clicking "See more" to expand posts will trigger the transformation too.
1. Click the extension icon and make sure it's enabled
2. Visit or refresh LinkedIn
3. Posts will be automatically transformed

### Settings

Click the extension icon to adjust:

- **Transform Intensity (0-100%):** How often r->w, l->w, na->nya transformations happen per character
- **Stutter Chance (0-10%):** How often words stutter per word
- **Face Chance (0-10%):** How often faces appear per word
- **Action Chance (0-10%):** How often actions appear per word  
- **Power Level (1-4):** 1=basic uwu, 2=adds nya, 3-4=extra transformations

Reload LinkedIn after changing settings.

### project
*   Uses a `MutationObserver` to watch the DOM and instantly catch new posts as they lazy-load.
- `uwuify.js` - Core transformation logic
- `content.js` - Finds and transforms LinkedIn posts
- `popup.html/js/css` - Settings UI

Uses MutationObserver to catch new posts, processes text nodes directly to preserve links, stores settings with chrome.storage.sync
## Debug
- Check the extension popup to verify it's enabled
- Enable debug 
- Reload LinkedIn (Ctrl+R / Cmd+R)
- Open console (F12) and look for "LinkedIn UwUifier initialized!"
- If nothing works, LinkedIn probably changed their DOM structure

## License

[MIT](LICENSE)
