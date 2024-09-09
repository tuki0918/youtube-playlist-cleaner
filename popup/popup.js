document.addEventListener("DOMContentLoaded", function () {

    const executeButton = document.getElementById("executeButton");

    executeButton.addEventListener(
        "click",
        function () {

            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs
                  .sendMessage(tabs[0].id, {
                    tabId: tabs[0].id,
                    action: "execute",
                  })
                  .catch((error) => {
                    console.log(error);
                  });
              });

        },
        false
    );

});