let urls = [];

// Load existing URLs when popup opens
chrome.storage.local.get(['multiSiteUrls'], function(result) {
    if (result.multiSiteUrls) {
        urls = result.multiSiteUrls;
        updateUrlList();
    }
});

document.getElementById('addSite').addEventListener('click', () => {
    const urlInput = document.getElementById('urlInput');
    let url = urlInput.value.trim();
    
    if (url) {
        // Add http:// if no protocol is specified
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        
        urls.push(url);
        chrome.storage.local.set({ 'multiSiteUrls': urls }, () => {
            const status = document.getElementById('status');
            status.textContent = 'Site added!';
            status.style.display = 'block';
            setTimeout(() => {
                status.style.display = 'none';
            }, 2000);
        });
        
        updateUrlList();
        urlInput.value = '';
    }
});

document.getElementById('viewSites').addEventListener('click', () => {
    if (urls.length > 0) {
        chrome.tabs.create({ url: 'viewer.html' });
    }
});

function updateUrlList() {
    const list = document.getElementById('urlList');
    list.innerHTML = '';
    urls.forEach((url, index) => {
        const div = document.createElement('div');
        div.textContent = url;
        const removeBtn = document.createElement('button');
        removeBtn.textContent = '×';
        removeBtn.onclick = () => {
            urls.splice(index, 1);
            chrome.storage.local.set({ 'multiSiteUrls': urls });
            updateUrlList();
        };
        div.appendChild(removeBtn);
        list.appendChild(div);
    });
}