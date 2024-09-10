import { useCallback } from "react";

function App() {
  const handleClick = useCallback(async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tabId = tabs[0].id;
      if (!tabId) {
        console.log("No tabId");
        return;
      }

      await chrome.tabs.sendMessage(tabId, { tabId, action: "execute" });
    });
  }, []);

  return (
    <>
      <div className="w-96">
        <div className="divide-y divide-gray-200">
          <div>
            <div className="m-4">
              <h1 className="font-bold text-gray-900">YouTube Playlist Cleaner</h1>
              <p className="font-light text-gray-500 text-xs">Please keep the playlist page.</p>
            </div>
          </div>

          <div>
            <div className="m-4">
              <button
                type="button"
                onClick={handleClick}
                className="flex w-full h-12 items-center justify-center rounded-md bg-neutral-950 font-medium text-neutral-50 transition active:scale-110 hover:cursor-pointer"
              >
                Cleaning
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
