let data;

chrome.runtime.onInstalled.addListener(() => {
    // Set the manifest data
    data = { version: chrome.runtime.getManifest().version };
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'execute_start') {
        chrome.action.setBadgeText({
            text: "ON",
        });
    }

    if (request.action === 'execute_finished') {
        chrome.action.setBadgeText({
            text: "", // Remove the badge
        });
    }

    if (request.action === 'execute_error') {
        chrome.action.setBadgeText({
            text: "ERR",
        });
    }
});
