class SiteViewer {
  constructor(url) {
      this.url = url;
      this.container = this.createContainer();
      this.loadContent();
  }

  createContainer() {
      const container = document.createElement('div');
      container.className = 'site-container';
      
      const header = document.createElement('div');
      header.className = 'site-header';
      
      const urlDiv = document.createElement('div');
      urlDiv.className = 'site-url';
      urlDiv.textContent = this.url;
      header.appendChild(urlDiv);
      
      const actionButtons = document.createElement('div');
      actionButtons.className = 'action-buttons';
      
      const refreshButton = document.createElement('button');
      refreshButton.className = 'action-button';
      refreshButton.textContent = '↻';
      refreshButton.title = 'Refresh';
      refreshButton.onclick = () => this.loadContent();
      
      const openButton = document.createElement('button');
      openButton.className = 'action-button';
      openButton.textContent = '↗';
      openButton.title = 'Open in new tab';
      openButton.onclick = () => window.open(this.getProxyUrl(this.url), '_blank');
      
      actionButtons.appendChild(refreshButton);
      actionButtons.appendChild(openButton);
      header.appendChild(actionButtons);
      
      const contentArea = document.createElement('div');
      contentArea.className = 'site-content';
      
      container.appendChild(header);
      container.appendChild(contentArea);
      
      return container;
  }

  getProxyUrl(url) {
      // Using Google's mobile-friendly proxy
      return `https://www.google.com/gwt/x?u=${encodeURIComponent(url)}&nojs=1`;
  }

  async loadContent() {
      const contentArea = this.container.querySelector('.site-content');
      contentArea.innerHTML = '<div class="loading">Loading...</div>';

      try {
          const frame = document.createElement('iframe');
          frame.className = 'mobile-frame';
          
          // Set frame attributes for better compatibility
          frame.setAttribute('loading', 'lazy');
          frame.setAttribute('importance', 'high');
          frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
          frame.style.width = '100%';
          frame.style.height = '100%';
          frame.style.border = 'none';

          // Use proxy URL for the source
          frame.src = this.getProxyUrl(this.url);

          contentArea.innerHTML = '';
          contentArea.appendChild(frame);

          // Handle load errors
          frame.onerror = () => this.showError('Failed to load content');
          frame.onload = () => {
              // Add mobile viewport meta tag
              try {
                  const doc = frame.contentDocument;
                  if (doc) {
                      const meta = doc.createElement('meta');
                      meta.name = 'viewport';
                      meta.content = 'width=device-width, initial-scale=1, maximum-scale=1';
                      doc.head.appendChild(meta);
                  }
              } catch (e) {
                  // Ignore cross-origin errors
              }
          };

      } catch (error) {
          this.showError(error.message);
      }
  }

  showError(message) {
      const contentArea = this.container.querySelector('.site-content');
      contentArea.innerHTML = `
          <div class="error-container">
              <div>Error loading content:</div>
              <div>${message}</div>
              <div class="error-actions">
                  <button onclick="window.open('${this.url}', '_blank')" class="action-button">
                      Open Original Site
                  </button>
                  <button onclick="window.open('${this.getProxyUrl(this.url)}', '_blank')" class="action-button">
                      Open in Proxy View
                  </button>
              </div>
          </div>
      `;
  }
}

window.addEventListener('load', () => {
  chrome.storage.local.get(['multiSiteUrls'], function(result) {
      const urls = result.multiSiteUrls || [];
      urls.forEach(url => {
          const viewer = new SiteViewer(url);
          document.body.appendChild(viewer.container);
      });
  });
});