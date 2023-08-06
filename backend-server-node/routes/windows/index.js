const Router = require("express");
import osascript from "node-osascript";
const WebSocket = require("ws");
const { spawn } = require("child_process");

const router = Router();

let vsCodeWindows = {};

// Create a WebSocket server instance
const wss = new WebSocket.Server({ port: 3002 });

wss.on("connection", (ws) => {
  console.log("A new vsCode Extension Client Connected!");

  // Handle incoming messages from the WebSocket client
  ws.on("message", (message) => {
    try {
      const filePath = message.toString("utf8");
      let temp = filePath;
      let title = temp.split("/").pop();
      vsCodeWindows[title] = filePath;
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  });

  // WebSocket connection closed
  ws.on("close", () => {
    console.log("WebSocket connection closed");
  });
});

// get all the available windows
router.get("/", (request, response) => {
  osascript.executeFile(
    "./automation_scripts/list_windows.scpt",
    (err, result) => {
      if (err) {
        console.log("error in list_windows: ", err);
        response.send(err);
      } else {
        const finalArray = [];

        // push all the vscode windows
        for (let key in vsCodeWindows) {
          finalArray.push({
            type: "vscode",
            title: key,
          });
        }
        for (let i = 0; i < result[0].length; i++) {
          finalArray.push({
            type: "chrome",
            title: result[0][i],
            pid: result[1][i],
          });
        }
        response.send(finalArray);
      }
    }
  );
});

//route to open or close vscode and chrome window(s)
router.post("/open", async (request, response) => {
  try {
    let windows = request.body.windows;
    console.log("windows", windows);
    // loop over all the windows (be it chrome or vscode)
    windows.forEach((window) => {
      if (window.type == "chrome") {
        let pid = window.pid.toString();
        runPythonFile(pid[0] + "." + pid.slice(1) + "E+8");
      } else if (window.type == "vscode") {
        // open vscode window
        if (vsCodeWindows.hasOwnProperty(window.title)) {
          let command = `code ${vsCodeWindows[window.title]}`;
          console.log("command", command);
          runCommandInTerminal(command);
        } else {
          // find and remove this window from the finalArray
        }
      }
    });
    response.send({ message: "windows opened successfully!", error: null });
  } catch (err) {
    response.send({ message: "something went wrong!", error: err });
  }
});

function runPythonFile(command) {
  const pythonProcess = spawn("python3", [
    `./automation_scripts/open_chrome.py`,
    command,
  ]);

  pythonProcess.stdout.on("data", (data) => {
    console.log(`Python script output: ${data}`);
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`Error from Python script: ${data}`);
  });

  pythonProcess.on("close", (code) => {
    console.log(`Python script exited with code ${code}`);
  });
}

function runCommandInTerminal(command) {
  const terminal = spawn(process.platform === "win32" ? "cmd.exe" : "bash", [
    process.platform === "win32" ? "/c" : "-c",
    command,
  ]);

  terminal.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  terminal.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  terminal.on("close", (code) => {
    console.log(`Child process exited with code ${code}`);
  });
}

export default router;
