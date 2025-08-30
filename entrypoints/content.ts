/// <reference types="chrome" />
import "~/assets/tailwind.css";

export default defineContentScript({
  matches: ['*://www.npmjs.com/*'],
  main() {
    const commandMap: Record<string, string> = {
      npm: 'npm',
      pnpm: 'pnpm',
      bun: 'bun',
      deno: 'deno',
    };

    const installMap: Record<string, string> = {
      npm: 'i',
      pnpm: 'i',
      bun: 'i',
      deno: 'install',
    };

    function replaceText(node: Node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        let newText = text;

        // Replace "npm i" with selected command
        chrome.storage.sync.get(['packageManager'], (result) => {
          const pm = result.packageManager || 'npm';
          const regex = /npm\s+i/g;
          newText = text.replace(regex, `${commandMap[pm]} ${installMap[pm]}`);
          if (newText !== text) {
            node.textContent = newText;
          }
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        if (element.tagName === 'CODE' || element.tagName === 'PRE') {
          // Handle code blocks
          chrome.storage.sync.get(['packageManager'], (result) => {
            const pm = result.packageManager || 'npm';
            const regex = /npm\s+i/g;
            const text = element.textContent || '';
            const newText = text.replace(regex, `${commandMap[pm]} ${installMap[pm]}`);
            if (newText !== text) {
              element.textContent = newText;
            }
          });
        }
      }
    }

    function walkTree(node: Node) {
      replaceText(node);
      for (const child of node.childNodes) {
        walkTree(child);
      }
    }

    // Initial replacement
    walkTree(document.body);

    // Observe for changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          walkTree(node);
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  },
});
