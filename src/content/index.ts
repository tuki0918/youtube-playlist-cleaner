type Prams = {
    tabId: number;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

chrome.runtime.onMessage.addListener(async (request) => {
    if (request.action === 'execute') {
        await main({ tabId: request.tabId });
    }
});

async function main(prams: Prams) {
    try {
        await chrome.runtime.sendMessage({ action: 'execute_start' });
        await execute(prams);
        await chrome.runtime.sendMessage({ action: 'execute_finished' });   
    } catch (error) {
        // TODO: notification
        console.error(error);
        await chrome.runtime.sendMessage({ action: 'execute_error' });
    }
}

async function execute(prams: Prams) {
    await showPlaylistItemMenu(prams);
}

function isDisplayNone(element: Element) {
    return window.getComputedStyle(element).display === 'none';
}

async function waitForNextExecute(prams: Prams) {
    const dropdownContainerXPath = "ytd-popup-container.ytd-app tp-yt-iron-dropdown.ytd-popup-container";
    const container = document.querySelector(dropdownContainerXPath)
    if (container) {
        if (isDisplayNone(container)) {
            // next execute
            await sleep(1000 * 5);
            await execute(prams);
        } else {
            // wait for the menu to be closed
            await sleep(1000);
            await waitForNextExecute(prams);
        }
    } else {
        throw new Error('Not supported.');
    }
}

async function removePlaylistItem(prams: Prams) {
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
            const menuItem = menuItems[2] as HTMLElement;
            const text = menuItem.textContent || '';
            if (text.includes("[後で見る]から削除")) {
                menuItem.click(); // [後で見る]から削除 menu
                await waitForNextExecute(prams);
            } else {
                throw new Error('No [後で見る]から削除 menu found.');
            }
        } else {
            throw new Error('No menu items found.');
        }
    } else {
        throw new Error('No dropdown menu found.');
    }
}

async function showPlaylistItemMenu(prams: Prams) {
    const playlistWrapSectionXPath = "div#contents.ytd-item-section-renderer";
    const section = document.querySelector(playlistWrapSectionXPath);
    if (section) {
        const playlistMenuXPath = "yt-icon-button#button.dropdown-trigger.ytd-menu-renderer";
        const menu = section.querySelector(playlistMenuXPath) as HTMLElement;
        if (menu) {
            menu.click(); // [...] button
            await sleep(1000);
            await removePlaylistItem(prams);
        } else {
            console.log('No playlist items found.');
        }
    } else {
        throw new Error('No playlist area found.');
    }
}
