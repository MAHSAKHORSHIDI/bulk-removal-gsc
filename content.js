chrome.storage.local.get('urlsToRemove', (data) => {
  const urls = data.urlsToRemove || [];
  if (urls.length === 0) return;

  let i = 0;

  function processNext() {
    if (i >= urls.length) {
      alert('All URLs processed! Done 🎉');
      chrome.storage.local.remove('urlsToRemove');
      return;
    }

    // Find "New request" button
    let newBtn = document.querySelector('button[aria-label="New request" i]') ||
                 Array.from(document.querySelectorAll('button')).find(b => 
                   b.textContent.trim().includes('New request'));

    if (newBtn) newBtn.click();

    setTimeout(() => {
      // URL input field
      let input = document.querySelector('input[placeholder="Enter URL" i]') ||
                  document.querySelector('input[type="text"]');

      // Submit button
      let submit = Array.from(document.querySelectorAll('button')).find(b => 
        b.textContent.toLowerCase().includes('submit') ||
        b.textContent.includes('request')
      );

      if (input && submit) {
        input.focus();
        input.value = urls[i];
        input.dispatchEvent(new Event('input', {bubbles: true}));
        
        setTimeout(() => {
          submit.click();
          i++;
          setTimeout(processNext, 4000); // Wait 4 seconds before next URL
        }, 1000);
      } else {
        alert('Buttons not found! Refresh the page or let me know to update selectors.');
      }
    }, 2000);
  }

  processNext();
});