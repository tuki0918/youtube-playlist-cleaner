type Prams = {
  tabId: number;
};

class HTMLParseError extends Error {}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

chrome.runtime.onMessage.addListener(async (request) => {
  if (request.action === "execute") {
    await main({ tabId: request.tabId });
  }
});

async function main(prams: Prams) {
  try {
    await chrome.runtime.sendMessage({ action: "execute_start" });
    await execute(prams);
    await chrome.runtime.sendMessage({ action: "execute_finished" });
  } catch (error) {
    // TODO: notification
    console.error(error);
    await chrome.runtime.sendMessage({ action: "execute_error" });
  }
}

async function execute(prams: Prams) {
  await showPlaylistItemMenu(prams);
}

function isDisplayNone(element: Element) {
  return window.getComputedStyle(element).display === "none";
}

const findElementFromTexts = (elements: NodeListOf<Element>, texts: string[]) => {
  return Array.from(elements).find((elm) => texts.some((text) => elm.textContent?.includes(text))) as
    | HTMLElement
    | undefined;
};

async function waitForNextExecute(prams: Prams) {
  /** @deprecated */
  const dropdownContainerXPath = "ytd-popup-container.ytd-app tp-yt-iron-dropdown.ytd-popup-container";
  const container = document.querySelector(dropdownContainerXPath);
  if (!container) throw new HTMLParseError("Not supported.");

  if (isDisplayNone(container)) {
    // next execute
    await sleep(1000 * 5);
    await execute(prams);
  } else {
    // wait for the menu to be closed
    await sleep(1000);
    await waitForNextExecute(prams);
  }
}

async function removePlaylistItem(prams: Prams) {
  /** @deprecated */
  const dropdownContainerXPath = "ytd-popup-container.ytd-app tp-yt-iron-dropdown.ytd-popup-container";
  const container = document.querySelector(dropdownContainerXPath);
  const isDisplay = container && !isDisplayNone(container);
  if (!isDisplay) throw new HTMLParseError("No dropdown container found.");

  /** @deprecated */
  const dropdownMenuXPath = "div#contentWrapper.tp-yt-iron-dropdown ytd-menu-popup-renderer.ytd-popup-container";
  const menu = document.querySelector(dropdownMenuXPath);
  if (!menu) throw new HTMLParseError("No dropdown menu found.");

  /** @deprecated */
  const menuItemXPath = "ytd-menu-service-item-renderer.ytd-menu-popup-renderer";
  const menuItems = menu.querySelectorAll(menuItemXPath);
  if (menuItems.length === 0) throw new HTMLParseError("No menu items found.");

  /**
   * WATCH LATER DROPDOWN MENU CASE: default (lang:ja)
   * --------------------
   * 0. キューに追加
   * 1. 再生リストに保存
   * 2. [後で見る]から削除
   * 3. オフライン
   * 4. 共有
   * --------------------
   */

  /**
   * WATCH LATER DROPDOWN MENU CASE: unavailable (lang:ja)
   * --------------------
   * 0. [後で見る]から削除
   * --------------------
   */

  /** @deprecated */
  const MENU_TEXTS = [
    "Remove from Watch later", // en
    "[後で見る]から削除", // ja
  ];
  const menuItem = findElementFromTexts(menuItems, MENU_TEXTS);
  if (!menuItem) throw new HTMLParseError("No menu found");
  menuItem.click();
  await waitForNextExecute(prams);
}

async function showPlaylistItemMenu(prams: Prams) {
  const playlistWrapSectionXPath = "div#contents.ytd-item-section-renderer";
  const section = document.querySelector(playlistWrapSectionXPath);
  if (!section) throw new HTMLParseError("No playlist area found.");

  const playlistMenuXPath = "yt-icon-button#button.dropdown-trigger.ytd-menu-renderer";
  const menu = section.querySelector(playlistMenuXPath) as HTMLElement;
  if (menu) {
    menu.click(); // [...] button
    await sleep(1000);
    await removePlaylistItem(prams);
  } else {
    // HTMLParseError or No results found.
    console.log("No playlist items found.");
  }
}
