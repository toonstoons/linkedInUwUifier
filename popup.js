// Popup script for LinkedIn UwUifier
document.addEventListener('DOMContentLoaded', function() {
  const enableToggle = document.getElementById('enableToggle');
  const debugToggle = document.getElementById('debugToggle');
  const settingsPanel = document.getElementById('settingsPanel');
  const transformChance = document.getElementById('transformChance');
  const stutterChance = document.getElementById('stutterChance');
  const faceChance = document.getElementById('faceChance');
  const actionChance = document.getElementById('actionChance');
  const power = document.getElementById('power');
  const resetButton = document.getElementById('resetButton');

  // Value display elements
  const transformValue = document.getElementById('transformValue');
  const stutterValue = document.getElementById('stutterValue');
  const faceValue = document.getElementById('faceValue');
  const actionValue = document.getElementById('actionValue');
  const powerValue = document.getElementById('powerValue');

  // Timing constants (in milliseconds)
  const RESET_FEEDBACK_DELAY = 1000; // Duration to show reset confirmation

  // Default settings
  const defaultSettings = {
    transformChance: 0.03,  // 3% per character (was 30%)
    stutterChance: 0.003,   // 0.3% per word (was 3%)
    faceChance: 0.002,      // 0.2% per word (was 2%)
    actionChance: 0.0025,   // 0.25% per word (was 2.5%)
    exclamationChance: 0.1, // 10% per exclamation (was 100%)
    power: 2
  };

  // Load saved settings
  chrome.storage.sync.get(['enabled', 'debug', 'settings'], function(result) {
    if (chrome.runtime.lastError) {
      console.error('Failed to load settings:', chrome.runtime.lastError);
      // Use defaults on error
      enableToggle.checked = true;
      transformChance.value = defaultSettings.transformChance * 100;
      stutterChance.value = defaultSettings.stutterChance * 100;
      faceChance.value = defaultSettings.faceChance * 100;
      actionChance.value = defaultSettings.actionChance * 100;
      power.value = defaultSettings.power;
      updateSettingsPanel();
      updateDisplayValues();
      return;
    }

    // Set enabled toggle
    enableToggle.checked = result.enabled !== undefined ? result.enabled : true;
    debugToggle.checked = result.debug !== undefined ? result.debug : false;
    updateSettingsPanel();

    // Load settings
    if (result.settings) {
      const settings = result.settings;
      transformChance.value = (settings.transformChance || defaultSettings.transformChance) * 100;
      stutterChance.value = (settings.stutterChance || defaultSettings.stutterChance) * 100;
      faceChance.value = (settings.faceChance || defaultSettings.faceChance) * 100;
      actionChance.value = (settings.actionChance || defaultSettings.actionChance) * 100;
      power.value = settings.power || defaultSettings.power;
    } else {
      // Use defaults
      transformChance.value = defaultSettings.transformChance * 100;
      stutterChance.value = defaultSettings.stutterChance * 100;
      faceChance.value = defaultSettings.faceChance * 100;
      actionChance.value = defaultSettings.actionChance * 100;
      power.value = defaultSettings.power;
    }

    updateDisplayValues();
  });

  // Update display values
  function updateDisplayValues() {
    transformValue.textContent = transformChance.value + '%';
    stutterValue.textContent = stutterChance.value + '%';
    faceValue.textContent = faceChance.value + '%';
    actionValue.textContent = actionChance.value + '%';
    powerValue.textContent = power.value;
  }

  // Update settings panel visibility
  function updateSettingsPanel() {
    if (enableToggle.checked) {
      settingsPanel.style.display = 'block';
    } else {
      settingsPanel.style.display = 'none';
    }
  }

  // Save settings
  function saveSettings() {
    const settings = {
      transformChance: parseFloat(transformChance.value) / 100,
      stutterChance: parseFloat(stutterChance.value) / 100,
      faceChance: parseFloat(faceChance.value) / 100,
      actionChance: parseFloat(actionChance.value) / 100,
      exclamationChance: defaultSettings.exclamationChance,
      power: parseInt(power.value)
    };

    chrome.storage.sync.set({
      enabled: enableToggle.checked,
      debug: debugToggle.checked,
      settings: settings
    }, function() {
      if (chrome.runtime.lastError) {
        console.error('Failed to save settings:', chrome.runtime.lastError);
        return;
      }
      // Settings saved successfully
    });
  }

  // Event listeners
  enableToggle.addEventListener('change', function() {
    updateSettingsPanel();
    saveSettings();
  });

  debugToggle.addEventListener('change', function() {
    saveSettings();
  });

  transformChance.addEventListener('input', function() {
    updateDisplayValues();
    saveSettings();
  });

  stutterChance.addEventListener('input', function() {
    updateDisplayValues();
    saveSettings();
  });

  faceChance.addEventListener('input', function() {
    updateDisplayValues();
    saveSettings();
  });

  actionChance.addEventListener('input', function() {
    updateDisplayValues();
    saveSettings();
  });

  power.addEventListener('input', function() {
    updateDisplayValues();
    saveSettings();
  });

  resetButton.addEventListener('click', function() {
    transformChance.value = defaultSettings.transformChance * 100;
    stutterChance.value = defaultSettings.stutterChance * 100;
    faceChance.value = defaultSettings.faceChance * 100;
    actionChance.value = defaultSettings.actionChance * 100;
    power.value = defaultSettings.power;
    
    // Clear any old bad settings
    chrome.storage.sync.clear(function() {
      if (chrome.runtime.lastError) {
        console.error('Failed to clear storage:', chrome.runtime.lastError);
      }
    });
    
    updateDisplayValues();
    saveSettings();
    
    // Visual feedback
    resetButton.textContent = 'Reset!';
    setTimeout(() => {
      resetButton.textContent = 'Reset to Defaults';
    }, RESET_FEEDBACK_DELAY);
  });
});
