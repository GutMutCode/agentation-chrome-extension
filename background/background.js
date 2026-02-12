const tabAnnotations = new Map();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = sender.tab?.id;
  
  switch (message.type) {
    case 'GET_ANNOTATIONS':
      sendResponse({ annotations: tabAnnotations.get(tabId) || [] });
      break;
      
    case 'SAVE_ANNOTATIONS':
      tabAnnotations.set(tabId, message.annotations);
      sendResponse({ success: true });
      break;
      
    case 'CLEAR_ANNOTATIONS':
      tabAnnotations.delete(tabId);
      sendResponse({ success: true });
      break;
      
    case 'GET_STATE':
      chrome.storage.local.get(['isActive'], (result) => {
        sendResponse({ isActive: result.isActive ?? false });
      });
      return true;
      
    case 'SET_STATE':
      chrome.storage.local.set({ isActive: message.isActive });
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, { 
            type: 'STATE_CHANGED', 
            isActive: message.isActive 
          }).catch(() => {});
        });
      });
      sendResponse({ success: true });
      break;
      
    case 'GET_SETTINGS':
      chrome.storage.local.get(['settings'], (result) => {
        sendResponse({ settings: result.settings || null });
      });
      return true;
      
    case 'SAVE_SETTINGS':
      chrome.storage.local.set({ settings: message.settings });
      sendResponse({ success: true });
      break;
  }
  
  return false;
});

chrome.tabs.onRemoved.addListener((tabId) => {
  tabAnnotations.delete(tabId);
});
