// let data;

chrome.runtime.onInstalled.addListener(async () => {
	console.log("... init ...");
	// Set the manifest data
	// data = { version: chrome.runtime.getManifest().version };
});

chrome.runtime.onMessage.addListener(async (request) => {
	if (request.action === "execute_start") {
		await chrome.action.setBadgeText({
			text: "ON",
		});
	}

	if (request.action === "execute_finished") {
		await chrome.action.setBadgeText({
			text: "", // Remove the badge
		});
	}

	if (request.action === "execute_error") {
		await chrome.action.setBadgeText({
			text: "ERR",
		});
	}
});
