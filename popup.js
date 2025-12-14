document.getElementById('saveBtn').addEventListener('click', () => {
  const file = document.getElementById('fileInput').files[0];
  if (!file) {
    document.getElementById('msg').textContent = "Please select a file first!";
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const urls = e.target.result.split('\n').map(u => u.trim()).filter(u => u);
    chrome.storage.local.set({ urlsToRemove: urls }, () => {
      document.getElementById('msg').textContent = 
        `${urls.length} URLs saved! Go to Removals page – it will start automatically without refresh.`;

      // Send message to ALL tabs matching GSC Removals to start immediately
      chrome.tabs.query({ url: "*://search.google.com/search-console/removals*" }, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, { action: 'startBulkRemoval' }, () => {
            if (chrome.runtime.lastError) {
              console.log('Tab not ready yet:', chrome.runtime.lastError.message);
            }
          });
        });
      });
    });
  };
  reader.readAsText(file);
});