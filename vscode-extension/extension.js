const vscode = require("vscode");
const WebSocket = require("ws");
const fs = require("fs");

let socket; // WebSocket instance

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("managewindows.start", () => {
      const serverURL = "ws://localhost:3002";

      // Start the WebSocket server on localhost:3000
      socket = new WebSocket(serverURL);

      socket.onopen = () => {
        console.log("Connected to the Express server");
        const workspaceFolders = vscode.workspace.workspaceFolders;
        const rootPath = workspaceFolders[0].uri.fsPath;
        socket.send(rootPath);
        console.log("event sent to the server successfully");

        socket.close();
        console.log("Disconnected :D");
      };
    })
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
