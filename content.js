chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startBulkRemoval') {
    console.log('Start signal received');
    startProcessing();
    sendResponse({ status: 'started' });
  }
});

chrome.storage.local.get('urlsToRemove', (data) => {
  if (data.urlsToRemove && data.urlsToRemove.length > 0) {
    console.log('URLs found in storage – auto starting');
    startProcessing();
  }
});

function startProcessing() {
  chrome.storage.local.get('urlsToRemove', (data) => {
    const urls = data.urlsToRemove || [];
    
    console.log('=== BULK REMOVAL STARTED ===');
    console.log(`Total URLs: ${urls.length}`);
    
    if (urls.length === 0) return;

    let currentIndex = 0;

    function processNextURL() {
      if (currentIndex >= urls.length) {
        console.log('=== ALL DONE! ===');
        alert(`All ${urls.length} URLs submitted! Check the list in Temporary Removals.`);
        chrome.storage.local.remove('urlsToRemove');
        return;
      }

      console.log(`\n--- Processing URL ${currentIndex + 1}/${urls.length}: ${urls[currentIndex]} ---`);

      // Open Temporary Removals tab if needed
      const tempTab = Array.from(document.querySelectorAll('*')).find(el => 
        (el.textContent || '').toLowerCase().includes('temporary removals')
      );
      if (tempTab) tempTab.click();

      setTimeout(() => {
        // Broad selector for New Request button
        const newBtn = Array.from(document.querySelectorAll('button, div[role="button"]')).find(el => {
          const text = (el.textContent || '').toLowerCase();
          return text.includes('new request') || 
                 text.includes('new temporary') || 
                 text.includes('temporary removal') || 
                 text.includes('request removal') || 
                 text.includes('remove');
        });

        if (newBtn) {
          console.log('Found and clicking button: "' + newBtn.textContent.trim() + '"');
          newBtn.click();

          let retryCount = 0;
          const maxRetries = 3;

          function checkForm() {
            const input = document.querySelector('input[placeholder="Enter URL"]') ||
                          document.querySelector('input[placeholder*="Enter URL" i]');

            const nextBtn = Array.from(document.querySelectorAll('button, div[role="button"]')).find(el => {
              const text = (el.textContent || '').toLowerCase();
              return text.includes('next') || text.includes('submit') || text.includes('continue') || text.includes('request');
            });

            if (input && nextBtn) {
              console.log('Form ready – filling URL');
              input.value = urls[currentIndex].trim();
              input.dispatchEvent(new Event('input', { bubbles: true }));
              input.dispatchEvent(new Event('change', { bubbles: true }));

              setTimeout(() => {
                console.log('Clicking Next/Submit – this registers the request automatically');
                nextBtn.click();
                console.log('SUCCESS: Request submitted for ' + urls[currentIndex]);

                currentIndex++;
                setTimeout(processNextURL, 15000);  // Long safe delay
              }, 4000);
            } else {
              retryCount++;
              if (retryCount <= maxRetries) {
                console.log(`Form not ready yet (retry ${retryCount}/${maxRetries}) – waiting 6s`);
                setTimeout(checkForm, 6000);
              } else {
                console.log('Form still not ready after retries – moving to next URL');
                currentIndex++;
                setTimeout(processNextURL, 8000);
              }
            }
          }

          setTimeout(checkForm, 15000);  // Increased initial wait for form modal
        } else {
          console.log('New Request button not found – moving to next URL');
          currentIndex++;
          setTimeout(processNextURL, 8000);
        }
      }, 6000);
    }

    processNextURL();
  });
}