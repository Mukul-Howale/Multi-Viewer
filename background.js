// Remove security headers for Discord and other sites
chrome.webRequest.onHeadersReceived.addListener(
    function(details) {
      // Special handling for Discord
      if (details.url.includes('discord.com')) {
        let headers = details.responseHeaders.filter(header => {
          const name = header.name.toLowerCase();
          return ![
            'x-frame-options',
            'content-security-policy',
            'content-security-policy-report-only'
          ].includes(name);
        });
  
        // Add required headers for Discord
        headers.push({
          name: 'Access-Control-Allow-Origin',
          value: '*'
        });
  
        return { responseHeaders: headers };
      }
      
      // Normal header processing for other sites
      return {
        responseHeaders: details.responseHeaders.filter(header => {
          const name = header.name.toLowerCase();
          return ![
            'x-frame-options',
            'content-security-policy',
            'content-security-policy-report-only'
          ].includes(name);
        })
      };
    },
    {
      urls: ['<all_urls>'],
      types: ['sub_frame', 'xmlhttprequest']
    },
    ['blocking', 'responseHeaders', 'extraHeaders']
  );
  
  // Handle proxy requests
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'fetchUrl') {
      const headers = {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/604.1'
      };
  
      // Add Discord-specific headers if needed
      if (request.url.includes('discord.com')) {
        headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8';
        headers['Accept-Language'] = 'en-US,en;q=0.5';
        headers['Upgrade-Insecure-Requests'] = '1';
      }
  
      fetch(request.url, { headers })
        .then(async response => {
          const text = await response.text();
          const processedHtml = processHtml(text, request.url);
          sendResponse({ html: processedHtml });
        })
        .catch(error => {
          sendResponse({ error: error.message });
        });
      return true;
    }
  });
  
  function processHtml(html, baseUrl) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
  
    // Add base tag
    let baseTag = doc.querySelector('base');
    if (!baseTag) {
      baseTag = doc.createElement('base');
      doc.head.prepend(baseTag);
    }
    baseTag.href = baseUrl;
  
    // Convert relative URLs to absolute
    const elements = doc.querySelectorAll('[src], [href]');
    elements.forEach(el => {
      ['src', 'href'].forEach(attr => {
        if (el.hasAttribute(attr)) {
          const url = el.getAttribute(attr);
          if (url && !url.startsWith('http') && !url.startsWith('data:')) {
            try {
              el.setAttribute(attr, new URL(url, baseUrl).href);
            } catch (e) {
              // Invalid URL, skip
            }
          }
        }
      });
    });
  
    return doc.documentElement.outerHTML;
  }