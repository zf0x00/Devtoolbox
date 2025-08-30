export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  browser.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === 'install') {
      // Check if packageManager is already set
      const result = await browser.storage.sync.get(['packageManager']);
      if (!result.packageManager) {
        // Open options page
        browser.tabs.create({ url: browser.runtime.getURL('/options.html') });
      }
    }
  });
});
