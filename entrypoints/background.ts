export default defineBackground(() => {
  console.log("IdeaFlash background script loaded", {
    id: browser.runtime.id,
  });

  // Handle keyboard shortcuts
  browser.commands?.onCommand.addListener((command) => {
    console.log("Command received:", command);

    if (command === "toggle-popup") {
      // Open the extension popup
      browser.action.openPopup();
    }
  });

  // Handle extension installation
  browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
      console.log("IdeaFlash extension installed");

      // Optionally show welcome message or open popup
      browser.action.openPopup();
    } else if (details.reason === "update") {
      console.log("IdeaFlash extension updated");
    }
  });

  // Handle browser action click (extension icon click)
  browser.action.onClicked.addListener(() => {
    browser.action.openPopup();
  });
});
