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
        `${urls.length} URLs saved! Now go to the Removals page in Search Console.`;
    });
  };
  reader.readAsText(file);
});