import { useCallback } from 'react'

function App() {

  const handleClick = useCallback(async () => {

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tabId = tabs[0].id;
      if (!tabId) {
        console.log("No tabId");
        return;
      }

      await chrome.tabs.sendMessage(tabId, { tabId, action: "execute"})
    });

  }, []);

  return (
    <>
      <h1>YouTube Playlist Cleaner</h1>
      <div>
        <button onClick={handleClick}>
          Clean!
        </button>
      </div>
    </>
  )
}

export default App
