chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'execute') {
        main({ tabId: request.tabId });
    }
});

function main(prams) {
    chrome.runtime.sendMessage({ action: 'execute_start' });
    execute(prams);
    // chrome.runtime.sendMessage({ action: 'execute_finished' });
}

function execute(prams) {
    showPlaylistItemMenu(prams);
}

function isDisplayNone(element) {
    return window.getComputedStyle(element).display === 'none';
}

function waitForNextExecute(prams) {
    const dropdownContainerXPath = "ytd-popup-container.ytd-app tp-yt-iron-dropdown.ytd-popup-container";
    const container = document.querySelector(dropdownContainerXPath)
    if (container) {
        if (isDisplayNone(container)) {
            // next execute
            setTimeout(() => execute(prams), 1000 * 10);
        } else {
            // wait for the menu to be closed
            setTimeout(() => waitForNextExecute(prams), 1000);
        }
    } else {
        console.log('Not supported');
        chrome.runtime.sendMessage({ action: 'execute_error' });
    }
}

function removePlaylistItem(prams) {
    const dropdownContainerXPath = "ytd-popup-container.ytd-app tp-yt-iron-dropdown.ytd-popup-container";
    const container = document.querySelector(dropdownContainerXPath)
    const isDisplay = container && !isDisplayNone(container)

    const dropdownMenuXPath = "div#contentWrapper.tp-yt-iron-dropdown ytd-menu-popup-renderer.ytd-popup-container";
    const menu = document.querySelector(dropdownMenuXPath)
    if (isDisplay && menu) {
        const menuItemXPath = "ytd-menu-service-item-renderer.ytd-menu-popup-renderer";
        const menuItems = menu.querySelectorAll(menuItemXPath);

        /**
         * DROPDOWN MENU (lang:ja)
         * --------------------
         * 0. キューに追加
         * 1. 再生リストに保存
         * 2. [後で見る]から削除
         * 3. オフライン
         * 4. 共有
         * --------------------
         */

        if (menuItems.length > 2) {
            const menuItem = menuItems[2];
            const text = menuItem.textContent
            if (text.includes("[後で見る]から削除")) {
                menuItem.click(); // [後で見る]から削除 menu
                waitForNextExecute(prams);
            } else {
                console.log('No [後で見る]から削除 menu found.');
                chrome.runtime.sendMessage({ action: 'execute_error' });
            }
        } else {
            console.log('No menu items found.');
            chrome.runtime.sendMessage({ action: 'execute_error' });
        }
    } else {
        console.log('No dropdown menu found.');
        chrome.runtime.sendMessage({ action: 'execute_error' });
    }
}

function showPlaylistItemMenu(prams) {
    const playlistWrapSectionXPath = "div#contents.ytd-item-section-renderer";
    const section = document.querySelector(playlistWrapSectionXPath);
    if (section) {
        const playlistMenuXPath = "yt-icon-button#button.dropdown-trigger.ytd-menu-renderer";
        const menu = section.querySelector(playlistMenuXPath);
        if (menu) {
            menu.click(); // [...] button
            setTimeout(() => removePlaylistItem(prams), 1000);
        } else {
            // TODO: move to main method
            console.log('No playlist items found.');
            chrome.runtime.sendMessage({ action: 'execute_finished' });
        }
    } else {
      console.log('No playlist area found.');
      chrome.runtime.sendMessage({ action: 'execute_error' });
    }
}
