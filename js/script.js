document.addEventListener('DOMContentLoaded', () => {
    const imageListEl = document.getElementById('image-list');
    const skyEl = document.getElementById('sky-image');
    const sidebarEl = document.querySelector('.vr-sidebar');
    const toggleButton = document.querySelector('.sidebar-toggle-button');

    const infoButton = document.getElementById('info-button');
    const infoPanel = document.getElementById('info-panel');
    const infoTitle = document.getElementById('info-title');
    const infoDescription = document.getElementById('info-description');
    const infoPanelCloseBtn = document.getElementById('info-panel-close-btn');

    const imageTitleDisplay = document.getElementById('image-title-display');

    const imageFolderPath = 'assets/picture/';
    let allImageInfo = [];

    const closeInfoPanel = () => {
        infoPanel.classList.remove('open');
    };

    const closeSidebar = () => {
        sidebarEl.classList.add('collapsed');
        updateToggleButton();
    };

    const updateToggleButton = () => {
        toggleButton.textContent = sidebarEl.classList.contains('collapsed') ? '▶' : '◀';
    };

    toggleButton.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebarEl.classList.toggle('collapsed');
        updateToggleButton();
        if (infoPanel.classList.contains('open')) {
            closeInfoPanel();
        }
    });

    infoButton.addEventListener('click', (e) => {
        e.stopPropagation();
        infoPanel.classList.toggle('open');
        if (!sidebarEl.classList.contains('collapsed')) {
            closeSidebar();
        }
    });

    infoPanelCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeInfoPanel();
    });

    document.querySelector('.vr-viewer').addEventListener('click', (e) => {
        if (!e.target.closest('.info-button') && !e.target.closest('.info-panel')) {
            if (infoPanel.classList.contains('open')) {
                closeInfoPanel();
            }
        }
        if (!e.target.closest('.sidebar-toggle-button') && !e.target.closest('.vr-sidebar')) {
            if (!sidebarEl.classList.contains('collapsed')) {
                closeSidebar();
            }
        }
    });

    fetch('assets/images.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(imageInfo => {
            allImageInfo = imageInfo;
            imageListEl.innerHTML = '';
            imageInfo.forEach(item => {
                const listItem = document.createElement('li');
                listItem.textContent = item.title;
                listItem.dataset.fileName = item.fileName;
                imageListEl.appendChild(listItem);
            });

            imageListEl.addEventListener('click', (e) => {
                if (e.target.tagName !== 'LI' || !e.target.dataset.fileName) return;

                document.querySelector('a-camera').object3D.rotation.set(0, 0, 0);
                document.querySelectorAll('#image-list li').forEach(li => li.classList.remove('active'));
                e.target.classList.add('active');

                const fileName = e.target.dataset.fileName;
                const imagePath = imageFolderPath + fileName;
                skyEl.setAttribute('src', imagePath);

                const currentImageData = allImageInfo.find(item => item.fileName === fileName);
                if (currentImageData) {
                    infoTitle.textContent = currentImageData.title || '';
                    infoDescription.textContent = currentImageData.description || '';
                    imageTitleDisplay.textContent = currentImageData.title || '';
                }
                
                closeInfoPanel();

                if (window.innerWidth <= 768 && !sidebarEl.classList.contains('collapsed')) {
                    closeSidebar();
                }
            });

            const urlParams = new URLSearchParams(window.location.search);
            const imageNameFromUrl = urlParams.get('image');
            let targetListItem = null;

            if (imageNameFromUrl) {
                targetListItem = imageListEl.querySelector(`li[data-file-name="${imageNameFromUrl}"]`);
            }

            if (targetListItem) {
                targetListItem.click();
            } 
            else if (imageListEl.firstChild) {
                imageListEl.firstChild.click();
            }

        })
        .catch(error => {
            console.error('画像の読み込みに失敗しました:', error);
            imageListEl.innerHTML = '<li>画像リストの読み込みに失敗しました。</li>';
        });

    updateToggleButton();
});