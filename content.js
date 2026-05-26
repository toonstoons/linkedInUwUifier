// LinkedIn UwUifier Content Script
(function() {
  'use strict';
  
  // Initialize the uwuifier
  let uwuifier = null;
  let isEnabled = true;
  let DEBUG = false;
  let settings = {
    transformChance: 0.03,  // 3% per character
    stutterChance: 0.003,   // 0.3% per word
    faceChance: 0.002,      // 0.2% per word
    actionChance: 0.0025,   // 0.25% per word
    exclamationChance: 0.1, // 10% per exclamation
    power: 2
  };

  // LinkedIn post content selectors
  const POST_SELECTORS = [
    // PRIMARY SELECTOR - LinkedIn 2026
    '[data-testid="expandable-text-box"]',
    // Post text with specific class combinations
    '._3363333a.d0bee587._39b7802b',
    '.c3bd9c77._50917d1d',
    // Company Headline
    '.org-top-card-summary__tagline',
    '.org-about-module-wrapper',
    '.lt-line-clamp__raw-line',
    // Fallback selectors
    '.feed-shared-update-v2__description',
    '.feed-shared-text',
    '.update-components-text',
    '[data-test-id="main-feed-activity-card__commentary"]',
    '.feed-shared-inline-show-more-text',
    '.feed-shared-text__text-view',
    '.break-words',
    'span[dir="ltr"]',
    // LinkedIn article content
    '.feed-shared-article__description',
    // Comments
    '.comments-comment-item__main-content'
  ];

  // Set to track processed elements
  const processedElements = new WeakSet();

  // Debug logging helpers
  const log = (...args) => DEBUG && console.log('[LinkedIn UwUifier]', ...args);
  const warn = (...args) => DEBUG && console.warn('[LinkedIn UwUifier]', ...args);

  // Timing constants (in milliseconds)
  const INITIAL_SCAN_DELAY = 1000;      // Wait for LinkedIn to finish loading
  const URL_CHANGE_SCAN_DELAY = 1500;   // Wait after URL changes for content to render
  const LINK_CLICK_DELAY = 100;         // Wait after link clicks to check URL
  const MUTATION_DEBOUNCE_DELAY = 100;  // Debounce for DOM mutation observer
  const EXPAND_BUTTON_DELAY = 500;      // Wait after "See more" clicks
  const URL_CHECK_INTERVAL = 2000;      // Check for URL changes every 2 seconds
  const URL_CHECK_ACTIVE_DURATION = 10000; // Keep checking for 10 seconds after navigation

  // Load settings from storage
  chrome.storage.sync.get(['enabled', 'debug', 'settings'], function(result) {
    if (chrome.runtime.lastError) {
      console.error('[LinkedIn UwUifier] Failed to load settings:', chrome.runtime.lastError);
      // Continue with defaults
      uwuifier = new UwUifier(settings);
      if (isEnabled) {
        initializeUwuifier();
      }
      return;
    }

    // Handle enabled setting - default to true if not set
    if (result.enabled !== undefined) {
      isEnabled = result.enabled;
    } else {
      isEnabled = true; // Explicitly default to enabled
    }
    
    if (result.debug !== undefined) {
      DEBUG = result.debug;
    }
    
    if (result.settings) {
      settings = { ...settings, ...result.settings };
    }
    
    uwuifier = new UwUifier(settings);
    
    // Always initialize if enabled
    if (isEnabled) {
      initializeUwuifier();
    } else {
      console.log('[LinkedIn UwUifier] Extension is disabled');
    }
  });

  // Listen for settings changes
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
      if (changes.enabled) {
        isEnabled = changes.enabled.newValue;
        if (isEnabled) {
          location.reload(); // Reload to apply changes
        }
      }
      if (changes.debug) {
        DEBUG = changes.debug.newValue;
        log('Debug mode', DEBUG ? 'enabled' : 'disabled');
      }
      if (changes.settings) {
        settings = { ...settings, ...changes.settings.newValue };
        uwuifier = new UwUifier(settings);
      }
    }
  });

  function initializeUwuifier() {
    log('LinkedIn UwUifier initialized!');
    log('Settings:', settings);
    log('Extension is enabled:', isEnabled);
    
    // Wait a bit for LinkedIn to finish loading
    setTimeout(() => {
      log('Starting initial scan...');
      // Process existing posts
      uwuifyExistingPosts();
      
      // Watch for new posts
      observeNewPosts();
      
      // Watch for URL changes (SPA navigation)
      watchForUrlChanges();
    }, INITIAL_SCAN_DELAY);
  }

  // Detect URL changes for SPA navigation
  function watchForUrlChanges() {
    let lastUrl = location.href;
    let urlCheckInterval = null;
    let activeCheckTimeout = null;
    
    function handleUrlChange(source) {
      const currentUrl = location.href;
      if (currentUrl !== lastUrl) {
        log(`URL changed (${source}):`, lastUrl, '→', currentUrl);
        lastUrl = currentUrl;
        
        // Start active URL checking for navigation heavy periods
        startActiveUrlChecking();
        
        // Wait for LinkedIn to render the new page content
        setTimeout(() => {
          log('Re-scanning page after navigation...');
          uwuifyExistingPosts();
        }, URL_CHANGE_SCAN_DELAY);
      }
    }
    
    // Smart polling: only active for 10 seconds after a navigation
    function startActiveUrlChecking() {
      // Clear any existing intervals/timeouts
      if (urlCheckInterval) clearInterval(urlCheckInterval);
      if (activeCheckTimeout) clearTimeout(activeCheckTimeout);
      
      // Start checking every 2 seconds
      urlCheckInterval = setInterval(() => {
        if (location.href !== lastUrl) {
          handleUrlChange('polling');
        }
      }, URL_CHECK_INTERVAL);
      
      // Stop checking after 10 seconds
      activeCheckTimeout = setTimeout(() => {
        if (urlCheckInterval) {
          clearInterval(urlCheckInterval);
          urlCheckInterval = null;
          log('Stopped active URL checking');
        }
      }, URL_CHECK_ACTIVE_DURATION);
      
      log('Started active URL checking for ' + (URL_CHECK_ACTIVE_DURATION/1000) + ' seconds');
    }
    
    // Method 1: Intercept pushState and replaceState
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      handleUrlChange('pushState');
    };
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      handleUrlChange('replaceState');
    };
    
    // Method 2: Listen for popstate (back/forward navigation)
    window.addEventListener('popstate', () => {
      log('Browser back/forward detected');
      handleUrlChange('popstate');
    });
    
    // Method 3: Listen for clicks on links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && link.href && link.href.includes('linkedin.com')) {
        // Start active checking when user clicks a link
        startActiveUrlChecking();
        
        // Also check for URL change after a short delay
        setTimeout(() => {
          if (location.href !== lastUrl) {
            handleUrlChange('click');
          }
        }, LINK_CLICK_DELAY);
      }
    }, true);
    
    // Start with active checking on page load
    startActiveUrlChecking();
    
    log('Watching for URL changes (pushState, popstate, clicks, smart polling)...');
  }

  function uwuifyExistingPosts() {
    let totalFound = 0;
    let totalProcessed = 0;

    POST_SELECTORS.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      totalFound += elements.length;
      log(`Found ${elements.length} elements matching: ${selector}`);
      elements.forEach(element => {
        // Check if element has meaningful text content
        if (element.textContent && element.textContent.trim().length > 0) {
          uwuifyElement(element);
          totalProcessed++;
        }
      });
    });

    log(`Total elements found: ${totalFound}, processed: ${totalProcessed}`);
  }

  function uwuifyElement(element) {
    // Skip if already processed
    if (processedElements.has(element)) {
      return;
    }
    
    // Skip if element has no text
    if (!element.textContent || element.textContent.trim() === '') {
      return;
    }

    // Mark as processed
    processedElements.add(element);
    
    log('Processing element:', element.textContent.substring(0, 50) + '...');
    
    // Get all text nodes
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          // Skip empty text nodes
          if (!node.nodeValue || node.nodeValue.trim() === '') {
            return NodeFilter.FILTER_REJECT;
          }
          // Skip text nodes inside links (to preserve URLs)
          if (node.parentElement && node.parentElement.tagName === 'A') {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }

    log(`Found ${textNodes.length} text nodes to transform`);

    // Transform each text node
    let transformed = 0;
    textNodes.forEach(textNode => {
      try {
        const originalText = textNode.nodeValue;
        const uwuifiedText = uwuifier.uwuify(originalText);
        
        if (uwuifiedText !== originalText) {
          textNode.nodeValue = uwuifiedText;
          transformed++;
        }
      } catch (error) {
        console.error('Error transforming text node:', error);
      }
    });
    
    log(`Transformed ${transformed} text nodes`);
  }

  function observeNewPosts() {
    // Create a MutationObserver to watch for new posts
    let mutationTimeout;
    let pendingMutations = [];
    
    const observer = new MutationObserver((mutations) => {
      // Accumulate mutations instead of replacing them
      pendingMutations.push(...mutations);
      
      // Clear previous timeout to debounce rapid mutations
      clearTimeout(mutationTimeout);
      
      // Wait for mutations to settle before processing
      mutationTimeout = setTimeout(() => {
        log(`Processing ${pendingMutations.length} accumulated mutations`);
        
        pendingMutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            // Skip non-element nodes
            if (node.nodeType !== Node.ELEMENT_NODE) {
              return;
            }

            // Check if the added node is a post or contains posts
            POST_SELECTORS.forEach(selector => {
              if (node.matches && node.matches(selector)) {
                uwuifyElement(node);
              }
              
              // Check for matching children
              if (node.querySelectorAll) {
                const elements = node.querySelectorAll(selector);
                elements.forEach(element => {
                  uwuifyElement(element);
                });
              }
            });
          });
        });
        
        // Clear processed mutations
        pendingMutations = [];
      }, MUTATION_DEBOUNCE_DELAY);
    });

    // Start observing the document
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Handle "See more" expansions
  document.addEventListener('click', function(e) {
    // LinkedIn uses various selectors for "see more" buttons
    if (e.target.matches('.feed-shared-inline-show-more-text__see-more-less-toggle') ||
        e.target.matches('.see-more') ||
        e.target.closest('.feed-shared-inline-show-more-text')) {
      
      // Wait a bit for the content to expand, then uwuify
      setTimeout(() => {
        uwuifyExistingPosts();
      }, EXPAND_BUTTON_DELAY);
    }
  });

})();
