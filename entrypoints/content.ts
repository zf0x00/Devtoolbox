/// <reference types="chrome" />
import "~/assets/tailwind.css";
import TurndownService from 'turndown';
import deepseekIcon from "~/assets/deepseek-color.svg";
import mistralIcon from "~/assets/mistral-color.svg";
import geminiIcon from "~/assets/gemini-color.svg";
import chatgptIcon from "~/assets/openai.svg";
import claudeIcon from "~/assets/claude-color.svg";
import githubIcon from "~/assets/github-color.svg";
import externalLinkIcon from "~/assets/external-link.svg";
import perplexityIcon from "~/assets/perplexity-color.svg";

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
          const regex = /npm (?=\s+i)/g;
          newText = text.replace(regex, commandMap[pm]);
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
            const regex = /npm(?=\s+i)/g;
            const text = element.textContent || '';
            const newText = text.replace(regex, commandMap[pm]);
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

    // Add UI elements after a short delay to ensure DOM is ready
    setTimeout(() => {
      const readmeDiv = document.getElementById('readme');
      if (readmeDiv) {
      // Make readme div relative for positioning
      readmeDiv.style.position = 'relative';

      // Create container
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '0';
      container.style.right = '0';
      container.style.zIndex = '10';
      container.style.display = 'flex';
      container.style.gap = '10px';
      container.style.alignItems = 'center';

      // Copy Markdown button
      const copyBtn = document.createElement('button');
      copyBtn.style.padding = '11px 16px';
      copyBtn.style.backgroundColor = '#000';
      copyBtn.style.color = 'white';
      copyBtn.style.border = 'none';
      copyBtn.style.borderRadius = '4px';
      copyBtn.style.cursor = 'pointer';
      copyBtn.style.display = 'flex';
      copyBtn.style.alignItems = 'center';
      copyBtn.style.gap = '8px';

      // Create SVG icon
      const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      iconSvg.setAttribute('width', '16');
      iconSvg.setAttribute('height', '16');
      iconSvg.setAttribute('viewBox', '0 0 24 24');
      iconSvg.setAttribute('fill', 'currentColor');
      iconSvg.innerHTML = '<path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>'; // Copy icon

      const textSpan = document.createElement('span');
      textSpan.textContent = 'Copy Markdown';

      copyBtn.appendChild(iconSvg);
      copyBtn.appendChild(textSpan);

      copyBtn.onclick = async () => {
        let text = '';
        try {
          // Clone the readme div and remove our UI elements
          const clonedReadme = readmeDiv.cloneNode(true) as HTMLElement;
          const container = clonedReadme.querySelector('div[style*="position: absolute"]');
          if (container) {
            container.remove();
          }
          // Use Turndown to convert HTML to Markdown
          const turndown = new TurndownService();
          text = turndown.turndown(clonedReadme.innerHTML);
        } catch (e) {
          console.error('Failed to convert to markdown:', e);
          // Fallback to textContent
          text = readmeDiv.textContent || '';
        }
        try {
          await navigator.clipboard.writeText(text);
          // Change icon to checkmark
          iconSvg.innerHTML = '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>';
          textSpan.textContent = 'Copy Markdown';
          copyBtn.style.backgroundColor = '#28a745';
          setTimeout(() => {
            // Reset after 2 seconds
            iconSvg.innerHTML = '<path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>';
            textSpan.textContent = 'Copy Markdown';
            copyBtn.style.backgroundColor = '#000';
          }, 2000);
        } catch (err) {
          console.error('Failed to copy:', err);
          // Change to error icon
          iconSvg.innerHTML = '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="none"/><path d="M13.49 5.48c-.21-.21-.52-.28-.82-.2-.3.08-.54.31-.66.61l-1.5 3.49c-.08.18-.06.38.05.55.11.17.28.3.47.37l3.49 1.5c.3.13.63.06.82-.2.21-.21.28-.52.2-.82l-1.5-3.49c-.13-.3-.39-.54-.61-.66zM12 15c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" fill="none"/><circle cx="12" cy="7" r="1.5" fill="none"/>';
          textSpan.textContent = 'Error';
          copyBtn.style.backgroundColor = '#dc3545';
          setTimeout(() => {
            iconSvg.innerHTML = '<path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>';
            textSpan.textContent = 'Copy Markdown';
            copyBtn.style.backgroundColor = '#000';
          }, 2000);
        }
      };

      // Custom Dropdown
      const dropdownContainer = document.createElement('div');
      dropdownContainer.style.position = 'relative';
      dropdownContainer.style.display = 'inline-block';

      const dropdownBtn = document.createElement('button');
      dropdownBtn.textContent = 'Open in';
      dropdownBtn.style.padding = '11px 16px';
      dropdownBtn.style.border = '1px solid #ccc';
      dropdownBtn.style.borderRadius = '4px';
      dropdownBtn.style.cursor = 'pointer';
      dropdownBtn.style.backgroundColor = '#fff';
      dropdownBtn.style.display = 'flex';
      dropdownBtn.style.alignItems = 'center';
      dropdownBtn.style.gap = '8px';

      const arrowImg = document.createElement('img');
      arrowImg.src = externalLinkIcon;
      arrowImg.style.width = '12px';
      arrowImg.style.height = '12px';
      dropdownBtn.appendChild(arrowImg);

      const dropdownList = document.createElement('div');
      dropdownList.style.display = 'none';
      dropdownList.style.position = 'absolute';
      dropdownList.style.top = '100%';
      dropdownList.style.left = '0';
      dropdownList.style.backgroundColor = '#fff';
      dropdownList.style.border = '1px solid #ccc';
      dropdownList.style.borderRadius = '4px';
      dropdownList.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      dropdownList.style.zIndex = '1000';
      dropdownList.style.minWidth = '200px';

      const currentUrl = encodeURIComponent(window.location.href);
      const options = [
        { icon: chatgptIcon, text: 'ChatGPT', url: `https://chatgpt.com/?hints=search&q=Read+${currentUrl}` },
        { icon: claudeIcon, text: 'Claude', url: `https://claude.ai/new?q=Read+${currentUrl}+I+want+to+ask+questions+about+it.` },
        { icon: perplexityIcon, text: 'Perplexity', url: `https://perplexity.ai/?q=Read+${currentUrl}+I+want+to+ask+questions+about+it.` },

        // { icon: mistralIcon, text: 'Mistral', url: `https://mistral.ai/?q=Read+${currentUrl}` },
        // { icon: geminiIcon, text: 'Gemini', url: `https://gemini.google.com/app/new?q=Read+${currentUrl}` },
        // { icon: deepseekIcon, text: 'DeepSeek', url: `https://deepseek.com/?q=Read+${currentUrl}` },
        // { icon: githubIcon, text: 'GitHub', url: `https://github.com/search?q=${encodeURIComponent(window.location.pathname.split('/')[2] || '')}` },
      ];

      options.forEach(opt => {
        const item = document.createElement('div');
        item.style.padding = '8px 16px';
        item.style.cursor = 'pointer';
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.gap = '8px';

        const iconImg = document.createElement('img');
        iconImg.src = opt.icon;
        iconImg.alt = opt.text;
        iconImg.style.width = '16px';
        iconImg.style.height = '16px';

        const textSpan = document.createElement('span');
        textSpan.textContent = opt.text;

        const arrowImg = document.createElement('img');
        arrowImg.src = externalLinkIcon;
        arrowImg.alt = 'Open';
        arrowImg.style.width = '12px';
        arrowImg.style.height = '12px';

        item.appendChild(iconImg);
        item.appendChild(textSpan);
        item.appendChild(arrowImg);

        item.onmouseover = () => item.style.backgroundColor = '#f0f0f0';
        item.onmouseout = () => item.style.backgroundColor = '#fff';
        item.onclick = () => {
          window.open(opt.url, '_blank');
          dropdownList.style.display = 'none';
        };
        dropdownList.appendChild(item);
      });

      dropdownBtn.onclick = () => {
        dropdownList.style.display = dropdownList.style.display === 'none' ? 'block' : 'none';
      };

      dropdownContainer.appendChild(dropdownBtn);
      dropdownContainer.appendChild(dropdownList);

      container.appendChild(copyBtn);
      container.appendChild(dropdownContainer);
      readmeDiv.appendChild(container);
      }
    }, 1000);
  },
});
