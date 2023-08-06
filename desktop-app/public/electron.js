const { app, BrowserWindow, ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");
const { createTray } = require("./utils/createTray");
const { createMainWindow } = require("./utils/createMainWindow");
const { createPopupWindow } = require("./utils/createPopupWindow");
const { showNotification } = require("./utils/showNotification");
const AutoLaunch = require("auto-launch");
const remote = require("@electron/remote/main");
const config = require("./utils/config");
const osascript = require("node-osascript");
const path = require("path");

if (config.isDev) require("electron-reloader")(module);

remote.initialize();

if (!config.isDev) {
	const autoStart = new AutoLaunch({
		name: config.appName,
	});
	autoStart.enable();
}

app.on("ready", async () => {
	config.mainWindow = await createMainWindow();
	config.tray = createTray();
	config.popupWindow = await createPopupWindow();

	showNotification(
		config.appName,
		"Application running on background! See application tray.",
	);
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0)
		config.mainWindow = createMainWindow();
});

ipcMain.on("app_version", (event) => {
	event.sender.send("app_version", { version: app.getVersion() });
});

ipcMain.on("get_all_windows", async (event) => {
	// event.sender.send("get_all_windows", { windows: ["here i am something"] });

	let windows = await osascript.execute(
		`
		-- Check if Google Chrome is running, and if not, launch it
		tell application "System Events"
			if not (exists process "Google Chrome") then
				tell application "Google Chrome" to activate
				delay 2
			end if
		end tell

		-- Get a reference to the Google Chrome application
		tell application "Google Chrome"
			set chromeWindows to windows
			set windowList to {}
			
			-- Loop through all open windows and add their titles to the list
			repeat with aWindow in chromeWindows
				set windowTitle to title of aWindow
				set end of windowList to windowTitle
			end repeat
		end tell

		-- Return the list of window titles
		return windowList
		`,
	);

	console.log("inside the electron.js file idk breuh.");
	event.sender.send("get_all_windows", windows);

	// osascript.executeFile(
	// 	path.join(__dirname, "./appScripts/get_all_chrome_windows.scpt"),
	// 	(err, result) => {
	// 		if (err) {
	// 			console.error("Error executing AppleScript:", err);
	// 			event.sender.send("all_windows", []);
	// 		} else {
	// 			console.log("Result:", result);
	// 			event.sender.send("all_windows", result);
	// 		}
	// 	},
	// );
});

autoUpdater.on("update-available", () => {
	config.mainWindow.webContents.send("update_available");
});

autoUpdater.on("update-downloaded", () => {
	config.mainWindow.webContents.send("update_downloaded");
});

ipcMain.on("restart_app", () => {
	autoUpdater.quitAndInstall();
});

