chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startBulkRemoval') {
    startProcessing();
    sendResponse({ status: 'started' });
  }
});

chrome.storage.local.get('urlsToRemove', (data) => {
  if (data.urlsToRemove && data.urlsToRemove.length > 0) {
    startProcessing();
  }
});

function startProcessing() {
  chrome.storage.local.get('urlsToRemove', (data) => {
    const urls = data.urlsToRemove || [];
    
    console.log('=== Bulk Removal Started ===');
    console.log(`Total URLs: ${urls.length}`);
    
    if (urls.length === 0) return;

    let currentIndex = 0;

    function processNext() {
      if (currentIndex >= urls.length) {
        console.log('=== ALL DONE! ===');
        alert(`All ${urls.length} URLs submitted! Check Temporary Removals list.`);
        chrome.storage.local.remove('urlsToRemove');
        return;
      }

      console.log(`\n--- Processing URL ${currentIndex + 1}/${urls.length}: ${urls[currentIndex]} ---`);

      // Open Temporary removals tab
      const tempTab = Array.from(document.querySelectorAll('*')).find(el => 
        (el.textContent || '').toLowerCase().includes('temporary removals') && el.offsetParent !== null
      );

      if (tempTab) tempTab.click();

      setTimeout(() => {
        const newBtn = Array.from(document.querySelectorAll('button')).find(el => 
          (el.textContent || '').toLowerCase().includes('new request')
        );

        if (newBtn) {
          console.log('Clicking New Request');
          newBtn.click();

          setTimeout(() => {
            const input = document.querySelector('input[placeholder="Enter URL"]') ||
                          document.querySelector('input[placeholder*="Enter URL" i]');

            const nextBtn = Array.from(document.querySelectorAll('button')).find(el => 
              (el.textContent || '').toLowerCase().includes('next')
            );

            if (input && nextBtn) {
              input.value = urls[currentIndex].trim();
              input.dispatchEvent(new Event('input', { bubbles: true }));

              setTimeout(() => {
                nextBtn.click();

                setTimeout(() => {
                  const confirmBtn = Array.from(document.querySelectorAll('button')).find(el => 
                    (el.textContent || '').toLowerCase().includes('submit request') ||
                    (el.textContent || '').toLowerCase().includes('submit')
                  );

                  if (confirmBtn) confirmBtn.click();

                  currentIndex++;
                  setTimeout(processNext, 15000);  // Longer delay for full reset
                }, 6000);
              }, 3000);
            } else {
              setTimeout(processNext, 5000);
            }
          }, 8000);
        } else {
          setTimeout(processNext, 6000);
        }
      }, 5000);
    }

    processNext();
  });
}