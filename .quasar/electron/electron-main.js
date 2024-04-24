var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src-electron/electron-main.js
var import_electron = require("electron");
var import_path = __toESM(require("path"));
var import_os = __toESM(require("os"));
var import_node_rtsp_stream = __toESM(require("node-rtsp-stream"));
var import_uuid = require("uuid");
var import_electron2 = require("electron");
var import_mqtt = __toESM(require("mqtt"));
var import_fs = __toESM(require("fs"));
var config = JSON.parse(
  import_fs.default.readFileSync(import_path.default.resolve(__dirname, "config.json"), "utf8")
);
var platform = process.platform || import_os.default.platform();
var mainWindow;
function createWindow() {
  mainWindow = new import_electron.BrowserWindow({
    icon: import_path.default.resolve(__dirname, "icons/icon.png"),
    width: 1e3,
    height: 600,
    fullscreen: true,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      preload: import_path.default.resolve(__dirname, "D:\\QuasarProject\\quasar-project\\.quasar\\electron\\electron-preload.js")
    }
  });
  mainWindow.loadURL("http://localhost:9300");
  if (true) {
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.webContents.on("devtools-opened", () => {
      mainWindow.webContents.closeDevTools();
    });
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
import_electron.app.whenReady().then(createWindow);
import_electron.app.on("window-all-closed", () => {
  if (platform !== "darwin") {
    import_electron.app.quit();
  }
});
import_electron.app.on("activate", () => {
  if (mainWindow === null) {
    console.log("mainWindow is null");
    createWindow();
  }
});
var rtspOpenders = {};
var addPort = 9e3;
import_electron2.ipcMain.on("openRtsp", (event, rtsp, isHighQuality = false) => {
  console.log("openRtsp", rtsp);
  if (rtspOpenders[rtsp]) {
    event.returnValue = {
      code: 200,
      msg: "\u5F00\u542F\u6210\u529F",
      ws: rtspOpenders[rtsp].ws
    };
  } else {
    addPort++;
    const stream = new import_node_rtsp_stream.default({
      name: `socket-${addPort}`,
      streamUrl: rtsp,
      wsPort: addPort,
      ffmpegOptions: {
        "-stats": "",
        "-r": 20,
        "-s": "320x240",
        "-preset": "ultrafast",
        "-tune": "zerolatency",
        "-loglevel": "quiet",
        "-nostats": ""
      }
    }).on("exitWithError", () => {
      stream.stop();
      delete rtspOpenders[rtsp];
      event.returnValue = {
        code: 400,
        msg: "\u5F00\u542F\u5931\u8D25"
      };
    });
    rtspOpenders[rtsp] = {
      ws: `ws://localhost:${addPort}`,
      stream
    };
    event.returnValue = {
      code: 200,
      msg: "\u5F00\u542F\u6210\u529F",
      ws: rtspOpenders[rtsp].ws
    };
  }
});
import_electron2.ipcMain.on("stopRtsp", (event, rtsp) => {
  if (rtspOpenders[rtsp]) {
    rtspOpenders[rtsp].stream.stop();
    delete rtspOpenders[rtsp];
  }
});
var client = import_mqtt.default.connect("mqtt://10.10.0.195:1883");
var topics = /* @__PURE__ */ new Map();
client.on("connect", () => {
  console.log("Connected to MQTT broker.");
  const config2 = JSON.parse(
    import_fs.default.readFileSync(import_path.default.resolve(__dirname, "mqtt-config.json"), "utf-8")
  );
  for (const item of config2) {
    if (item.type === "publish") {
      topics.set(item.topic, [
        (message) => client.publish(item.topic, message)
      ]);
    } else if (item.type === "subscribe") {
      client.subscribe(item.topic);
      topics.set(item.topic, []);
    }
  }
});
var subscribers = {};
import_electron2.ipcMain.on("subscribe", (event, topic) => {
  const winId = event.sender.id;
  if (!subscribers[topic]) {
    subscribers[topic] = /* @__PURE__ */ new Set();
    client.subscribe(topic);
  }
  subscribers[topic].add(winId);
});
import_electron2.ipcMain.on("unsubscribe", (event, topic) => {
  const winId = event.sender.id;
  if (subscribers[topic]) {
    subscribers[topic].delete(winId);
    if (subscribers[topic].size === 0) {
      delete subscribers[topic];
      client.unsubscribe(topic);
    }
  }
});
client.on("message", (topic, message) => {
  if (subscribers[topic]) {
    subscribers[topic].forEach((winId) => {
      const win = import_electron.BrowserWindow.fromId(winId);
      if (win) {
        win.webContents.send("message", topic, message.toString());
      }
    });
  }
});
client.on("offline", () => {
  console.log("Disconnected from MQTT broker.");
});
client.on("reconnect", () => {
  console.log("Reconnecting to MQTT broker...");
  for (const [topic, callback] of topics.entries()) {
    if (typeof callback !== "function") {
      client.subscribe(topic);
    }
  }
});
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjLWVsZWN0cm9uL2VsZWN0cm9uLW1haW4uanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7XHJcbiAgYXBwLFxyXG4gIEJyb3dzZXJXaW5kb3csXHJcbiAgY29udGV4dEJyaWRnZSxcclxuICBpcGNSZW5kZXJlcixcclxuICBzaGVsbCxcclxufSBmcm9tIFwiZWxlY3Ryb25cIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IG9zIGZyb20gXCJvc1wiO1xyXG4vLyBcdTU3MjhcdTY1ODdcdTRFRjZcdTk4NzZcdTkwRThcdTVCRkNcdTUxNjVcdTZBMjFcdTU3NTdcclxuaW1wb3J0IFN0cmVhbSBmcm9tIFwibm9kZS1ydHNwLXN0cmVhbVwiO1xyXG5pbXBvcnQgeyB2NCBhcyB1dWlkdjQgfSBmcm9tIFwidXVpZFwiO1xyXG5pbXBvcnQgeyBpcGNNYWluIH0gZnJvbSBcImVsZWN0cm9uXCI7XHJcbmltcG9ydCBtcXR0IGZyb20gXCJtcXR0XCI7XHJcbmltcG9ydCBmcyBmcm9tIFwiZnNcIjtcclxuXHJcbi8vIFx1OEJGQlx1NTNENlx1OTE0RFx1N0Y2RVx1NjU4N1x1NEVGNlx1RkYwQ2NvbmZpZy5qc29uXHJcbmNvbnN0IGNvbmZpZyA9IEpTT04ucGFyc2UoXHJcbiAgZnMucmVhZEZpbGVTeW5jKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiY29uZmlnLmpzb25cIiksIFwidXRmOFwiKVxyXG4pO1xyXG5cclxuLy8gbmVlZGVkIGluIGNhc2UgcHJvY2VzcyBpcyB1bmRlZmluZWQgdW5kZXIgTGludXhcclxuY29uc3QgcGxhdGZvcm0gPSBwcm9jZXNzLnBsYXRmb3JtIHx8IG9zLnBsYXRmb3JtKCk7XHJcblxyXG5sZXQgbWFpbldpbmRvdztcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVdpbmRvdygpIHtcclxuICAvKipcclxuICAgKiBJbml0aWFsIHdpbmRvdyBvcHRpb25zXHJcbiAgICovXHJcbiAgbWFpbldpbmRvdyA9IG5ldyBCcm93c2VyV2luZG93KHtcclxuICAgIGljb246IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiaWNvbnMvaWNvbi5wbmdcIiksIC8vIHRyYXkgaWNvblxyXG4gICAgd2lkdGg6IDEwMDAsXHJcbiAgICBoZWlnaHQ6IDYwMCxcclxuICAgIGZ1bGxzY3JlZW46IHRydWUsIC8vIFx1NkRGQlx1NTJBMFx1NkI2NFx1ODg0Q1x1NEVFM1x1NzgwMVxyXG4gICAgdXNlQ29udGVudFNpemU6IHRydWUsXHJcbiAgICB3ZWJQcmVmZXJlbmNlczoge1xyXG4gICAgICBjb250ZXh0SXNvbGF0aW9uOiB0cnVlLFxyXG4gICAgICAvLyBNb3JlIGluZm86IGh0dHBzOi8vdjIucXVhc2FyLmRldi9xdWFzYXItY2xpLXdlYnBhY2svZGV2ZWxvcGluZy1lbGVjdHJvbi1hcHBzL2VsZWN0cm9uLXByZWxvYWQtc2NyaXB0XHJcbiAgICAgIHByZWxvYWQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIHByb2Nlc3MuZW52LlFVQVNBUl9FTEVDVFJPTl9QUkVMT0FEKSxcclxuICAgIH0sXHJcbiAgfSk7XHJcblxyXG4gIG1haW5XaW5kb3cubG9hZFVSTChwcm9jZXNzLmVudi5BUFBfVVJMKTtcclxuXHJcbiAgaWYgKHByb2Nlc3MuZW52LkRFQlVHR0lORykge1xyXG4gICAgLy8gaWYgb24gREVWIG9yIFByb2R1Y3Rpb24gd2l0aCBkZWJ1ZyBlbmFibGVkXHJcbiAgICBtYWluV2luZG93LndlYkNvbnRlbnRzLm9wZW5EZXZUb29scygpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICAvLyB3ZSdyZSBvbiBwcm9kdWN0aW9uOyBubyBhY2Nlc3MgdG8gZGV2dG9vbHMgcGxzXHJcbiAgICBtYWluV2luZG93LndlYkNvbnRlbnRzLm9uKFwiZGV2dG9vbHMtb3BlbmVkXCIsICgpID0+IHtcclxuICAgICAgbWFpbldpbmRvdy53ZWJDb250ZW50cy5jbG9zZURldlRvb2xzKCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIG1haW5XaW5kb3cub24oXCJjbG9zZWRcIiwgKCkgPT4ge1xyXG4gICAgbWFpbldpbmRvdyA9IG51bGw7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmFwcC53aGVuUmVhZHkoKS50aGVuKGNyZWF0ZVdpbmRvdyk7XHJcblxyXG5hcHAub24oXCJ3aW5kb3ctYWxsLWNsb3NlZFwiLCAoKSA9PiB7XHJcbiAgaWYgKHBsYXRmb3JtICE9PSBcImRhcndpblwiKSB7XHJcbiAgICBhcHAucXVpdCgpO1xyXG4gIH1cclxufSk7XHJcblxyXG5hcHAub24oXCJhY3RpdmF0ZVwiLCAoKSA9PiB7XHJcbiAgaWYgKG1haW5XaW5kb3cgPT09IG51bGwpIHtcclxuICAgIGNvbnNvbGUubG9nKFwibWFpbldpbmRvdyBpcyBudWxsXCIpO1xyXG4gICAgY3JlYXRlV2luZG93KCk7XHJcbiAgfVxyXG59KTtcclxuXHJcbmNvbnN0IHJ0c3BPcGVuZGVycyA9IHt9O1xyXG5sZXQgYWRkUG9ydCA9IDkwMDA7XHJcblxyXG4vLyBcdThCQkVcdTdGNkVpcGNNYWluXHU3Njg0XHU3NkQxXHU1NDJDXHU1NjY4XHU1OTA0XHU3NDA2XHU1NDBDXHU2QjY1XHU2RDg4XHU2MDZGXHJcbmlwY01haW4ub24oXCJvcGVuUnRzcFwiLCAoZXZlbnQsIHJ0c3AsIGlzSGlnaFF1YWxpdHkgPSBmYWxzZSkgPT4ge1xyXG4gIC8qKiBcdTUyMjRcdTY1QURcdTY2MkZcdTU0MjZcdTVERjJcdTVGMDBcdTU0MkYsXHU4MkU1XHU1REYyXHU1RjAwXHU1NDJGLFx1NzZGNFx1NjNBNVx1OEZENFx1NTZERXdzXHU1NzMwXHU1NzQwLCBcdTY3MkFcdTVGMDBcdTU0MkZcdTUyMTlcdTUxNDhcdTVGMDBcdTU0MkZcdTUxOERcdThGRDRcdTU2REUgKi9cclxuICBjb25zb2xlLmxvZyhcIm9wZW5SdHNwXCIsIHJ0c3ApO1xyXG4gIGlmIChydHNwT3BlbmRlcnNbcnRzcF0pIHtcclxuICAgIGV2ZW50LnJldHVyblZhbHVlID0ge1xyXG4gICAgICBjb2RlOiAyMDAsXHJcbiAgICAgIG1zZzogXCJcdTVGMDBcdTU0MkZcdTYyMTBcdTUyOUZcIixcclxuICAgICAgd3M6IHJ0c3BPcGVuZGVyc1tydHNwXS53cyxcclxuICAgIH07XHJcbiAgfSBlbHNlIHtcclxuICAgIGFkZFBvcnQrKztcclxuICAgIGNvbnN0IHN0cmVhbSA9IG5ldyBTdHJlYW0oe1xyXG4gICAgICBuYW1lOiBgc29ja2V0LSR7YWRkUG9ydH1gLFxyXG4gICAgICBzdHJlYW1Vcmw6IHJ0c3AsXHJcbiAgICAgIHdzUG9ydDogYWRkUG9ydCxcclxuICAgICAgLy8gZmZtcGVnUGF0aDogY29uZmlnLmZmbXBlZ1BhdGgsXHJcbiAgICAgIGZmbXBlZ09wdGlvbnM6IHtcclxuICAgICAgICBcIi1zdGF0c1wiOiBcIlwiLFxyXG4gICAgICAgIFwiLXJcIjogMjAsXHJcbiAgICAgICAgXCItc1wiOiBcIjMyMHgyNDBcIixcclxuICAgICAgICBcIi1wcmVzZXRcIjogXCJ1bHRyYWZhc3RcIixcclxuICAgICAgICBcIi10dW5lXCI6IFwiemVyb2xhdGVuY3lcIixcclxuICAgICAgICBcIi1sb2dsZXZlbFwiOiBcInF1aWV0XCIsICAvLyBcdTRFMERcdTY2M0VcdTc5M0FmZm1wZWdcdTc2ODRcdTY1RTVcdTVGRDdcdTRGRTFcdTYwNkZcclxuICAgICAgICBcIi1ub3N0YXRzXCI6IFwiXCIsICAvLyBcdTRFMERcdTY2M0VcdTc5M0FmZm1wZWdcdTc2ODRcdTdFREZcdThCQTFcdTRGRTFcdTYwNkZcclxuICAgICAgfSxcclxuICAgIH0pLm9uKFwiZXhpdFdpdGhFcnJvclwiLCAoKSA9PiB7XHJcbiAgICAgIHN0cmVhbS5zdG9wKCk7XHJcbiAgICAgIGRlbGV0ZSBydHNwT3BlbmRlcnNbcnRzcF07XHJcbiAgICAgIGV2ZW50LnJldHVyblZhbHVlID0ge1xyXG4gICAgICAgIGNvZGU6IDQwMCxcclxuICAgICAgICBtc2c6IFwiXHU1RjAwXHU1NDJGXHU1OTMxXHU4RDI1XCIsXHJcbiAgICAgIH07XHJcbiAgICB9KTtcclxuICAgIHJ0c3BPcGVuZGVyc1tydHNwXSA9IHtcclxuICAgICAgd3M6IGB3czovL2xvY2FsaG9zdDoke2FkZFBvcnR9YCxcclxuICAgICAgc3RyZWFtOiBzdHJlYW0sXHJcbiAgICB9O1xyXG4gICAgZXZlbnQucmV0dXJuVmFsdWUgPSB7XHJcbiAgICAgIGNvZGU6IDIwMCxcclxuICAgICAgbXNnOiBcIlx1NUYwMFx1NTQyRlx1NjIxMFx1NTI5RlwiLFxyXG4gICAgICB3czogcnRzcE9wZW5kZXJzW3J0c3BdLndzLFxyXG4gICAgfTtcclxuICB9XHJcbn0pO1xyXG5cclxuaXBjTWFpbi5vbihcInN0b3BSdHNwXCIsIChldmVudCwgcnRzcCkgPT4ge1xyXG4gIGlmIChydHNwT3BlbmRlcnNbcnRzcF0pIHtcclxuICAgIHJ0c3BPcGVuZGVyc1tydHNwXS5zdHJlYW0uc3RvcCgpO1xyXG4gICAgZGVsZXRlIHJ0c3BPcGVuZGVyc1tydHNwXTtcclxuICB9XHJcbn0pO1xyXG5cclxuLy8gXHU1MjFCXHU1RUZBXHU0RTAwXHU0RTJBIE1RVFQgXHU1QkEyXHU2MjM3XHU3QUVGXHJcbmNvbnN0IGNsaWVudCA9IG1xdHQuY29ubmVjdChcIm1xdHQ6Ly8xMC4xMC4wLjE5NToxODgzXCIpO1xyXG5cclxuLy8gXHU1QjU4XHU1MEE4XHU4QkEyXHU5NjA1XHU3Njg0XHU0RTNCXHU5ODk4XHU1NDhDXHU1QjgzXHU0RUVDXHU3Njg0XHU1NkRFXHU4QzAzXHU1MUZEXHU2NTcwXHJcbmNvbnN0IHRvcGljcyA9IG5ldyBNYXAoKTtcclxuXHJcbi8vIFx1NUY1MyBNUVRUIFx1NUJBMlx1NjIzN1x1N0FFRlx1OEZERVx1NjNBNVx1NTIzMFx1NjcwRFx1NTJBMVx1NTY2OFx1NjVGNlxyXG5jbGllbnQub24oXCJjb25uZWN0XCIsICgpID0+IHtcclxuICBjb25zb2xlLmxvZyhcIkNvbm5lY3RlZCB0byBNUVRUIGJyb2tlci5cIik7XHJcblxyXG4gIC8vIFx1OEJGQlx1NTNENlx1OTE0RFx1N0Y2RVx1NjU4N1x1NEVGNlxyXG4gIGNvbnN0IGNvbmZpZyA9IEpTT04ucGFyc2UoXHJcbiAgICBmcy5yZWFkRmlsZVN5bmMocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJtcXR0LWNvbmZpZy5qc29uXCIpLCBcInV0Zi04XCIpXHJcbiAgKTtcclxuXHJcbiAgLy8gXHU2ODM5XHU2MzZFXHU5MTREXHU3RjZFXHU2NTg3XHU0RUY2XHU4QkJFXHU3RjZFIE1RVFQgXHU1QkEyXHU2MjM3XHU3QUVGXHJcbiAgZm9yIChjb25zdCBpdGVtIG9mIGNvbmZpZykge1xyXG4gICAgaWYgKGl0ZW0udHlwZSA9PT0gXCJwdWJsaXNoXCIpIHtcclxuICAgICAgLy8gXHU1OTgyXHU2NzlDXHU2NjJGXHU1M0QxXHU1RTAzXHU0RTNCXHU5ODk4XHVGRjBDXHU1MjFCXHU1RUZBXHU0RTAwXHU0RTJBXHU1M0QxXHU1RTAzXHU1NjY4XHJcbiAgICAgIHRvcGljcy5zZXQoaXRlbS50b3BpYywgW1xyXG4gICAgICAgIChtZXNzYWdlKSA9PiBjbGllbnQucHVibGlzaChpdGVtLnRvcGljLCBtZXNzYWdlKSxcclxuICAgICAgXSk7XHJcbiAgICB9IGVsc2UgaWYgKGl0ZW0udHlwZSA9PT0gXCJzdWJzY3JpYmVcIikge1xyXG4gICAgICAvLyBcdTU5ODJcdTY3OUNcdTY2MkZcdThCQTJcdTk2MDVcdTRFM0JcdTk4OThcdUZGMENcdThCQTJcdTk2MDVcdTRFM0JcdTk4OThcdTVFNzZcdTVCNThcdTUwQThcdTU2REVcdThDMDNcdTUxRkRcdTY1NzBcclxuICAgICAgY2xpZW50LnN1YnNjcmliZShpdGVtLnRvcGljKTtcclxuICAgICAgdG9waWNzLnNldChpdGVtLnRvcGljLCBbXSk7XHJcbiAgICB9XHJcbiAgfVxyXG59KTtcclxuXHJcbi8vIFx1NTIxQlx1NUVGQVx1NEUwMFx1NEUyQVx1NUI1OFx1NTBBOFx1OEJBMlx1OTYwNVx1ODAwNVx1NzY4NFx1N0VEM1x1Njc4NFxyXG5jb25zdCBzdWJzY3JpYmVycyA9IHt9O1xyXG5cclxuaXBjTWFpbi5vbihcInN1YnNjcmliZVwiLCAoZXZlbnQsIHRvcGljKSA9PiB7XHJcbiAgY29uc3Qgd2luSWQgPSBldmVudC5zZW5kZXIuaWQ7XHJcbiAgaWYgKCFzdWJzY3JpYmVyc1t0b3BpY10pIHtcclxuICAgIHN1YnNjcmliZXJzW3RvcGljXSA9IG5ldyBTZXQoKTtcclxuICAgIGNsaWVudC5zdWJzY3JpYmUodG9waWMpOyAvLyBcdTc4NkVcdTRGRERcdTRFM0JcdTk4OThcdTg4QUJcdThCQTJcdTk2MDVcclxuICB9XHJcbiAgc3Vic2NyaWJlcnNbdG9waWNdLmFkZCh3aW5JZCk7XHJcbn0pO1xyXG5cclxuaXBjTWFpbi5vbihcInVuc3Vic2NyaWJlXCIsIChldmVudCwgdG9waWMpID0+IHtcclxuICBjb25zdCB3aW5JZCA9IGV2ZW50LnNlbmRlci5pZDtcclxuICBpZiAoc3Vic2NyaWJlcnNbdG9waWNdKSB7XHJcbiAgICBzdWJzY3JpYmVyc1t0b3BpY10uZGVsZXRlKHdpbklkKTtcclxuICAgIGlmIChzdWJzY3JpYmVyc1t0b3BpY10uc2l6ZSA9PT0gMCkge1xyXG4gICAgICBkZWxldGUgc3Vic2NyaWJlcnNbdG9waWNdO1xyXG4gICAgICBjbGllbnQudW5zdWJzY3JpYmUodG9waWMpOyAvLyBcdTU5ODJcdTY3OUNcdTZDQTFcdTY3MDlcdThCQTJcdTk2MDVcdTgwMDVcdUZGMENcdTUzRDZcdTZEODhcdThCQTJcdTk2MDVcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG5cclxuLy8gXHU1RjUzIE1RVFQgXHU1QkEyXHU2MjM3XHU3QUVGXHU2NTM2XHU1MjMwXHU2RDg4XHU2MDZGXHU2NUY2XHJcbmNsaWVudC5vbihcIm1lc3NhZ2VcIiwgKHRvcGljLCBtZXNzYWdlKSA9PiB7XHJcbiAgaWYgKHN1YnNjcmliZXJzW3RvcGljXSkge1xyXG4gICAgc3Vic2NyaWJlcnNbdG9waWNdLmZvckVhY2goKHdpbklkKSA9PiB7XHJcbiAgICAgIGNvbnN0IHdpbiA9IEJyb3dzZXJXaW5kb3cuZnJvbUlkKHdpbklkKTtcclxuICAgICAgaWYgKHdpbikge1xyXG4gICAgICAgIHdpbi53ZWJDb250ZW50cy5zZW5kKFwibWVzc2FnZVwiLCB0b3BpYywgbWVzc2FnZS50b1N0cmluZygpKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG59KTtcclxuXHJcbi8vIFx1NUY1MyBNUVRUIFx1NUJBMlx1NjIzN1x1N0FFRlx1NjVBRFx1NUYwMFx1OEZERVx1NjNBNVx1NjVGNlxyXG5jbGllbnQub24oXCJvZmZsaW5lXCIsICgpID0+IHtcclxuICBjb25zb2xlLmxvZyhcIkRpc2Nvbm5lY3RlZCBmcm9tIE1RVFQgYnJva2VyLlwiKTtcclxufSk7XHJcblxyXG4vLyBcdTVGNTMgTVFUVCBcdTVCQTJcdTYyMzdcdTdBRUZcdTVDMURcdThCRDVcdTkxQ0RcdTY1QjBcdThGREVcdTYzQTVcdTY1RjZcclxuY2xpZW50Lm9uKFwicmVjb25uZWN0XCIsICgpID0+IHtcclxuICBjb25zb2xlLmxvZyhcIlJlY29ubmVjdGluZyB0byBNUVRUIGJyb2tlci4uLlwiKTtcclxuXHJcbiAgLy8gXHU5MUNEXHU2NUIwXHU4QkEyXHU5NjA1XHU2MjQwXHU2NzA5XHU0RTNCXHU5ODk4XHJcbiAgZm9yIChjb25zdCBbdG9waWMsIGNhbGxiYWNrXSBvZiB0b3BpY3MuZW50cmllcygpKSB7XHJcbiAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgY2xpZW50LnN1YnNjcmliZSh0b3BpYyk7XHJcbiAgICB9XHJcbiAgfVxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxzQkFNTztBQUNQLGtCQUFpQjtBQUNqQixnQkFBZTtBQUVmLDhCQUFtQjtBQUNuQixrQkFBNkI7QUFDN0IsSUFBQUEsbUJBQXdCO0FBQ3hCLGtCQUFpQjtBQUNqQixnQkFBZTtBQUdmLElBQU0sU0FBUyxLQUFLO0FBQUEsRUFDbEIsVUFBQUMsUUFBRyxhQUFhLFlBQUFDLFFBQUssUUFBUSxXQUFXLGFBQWEsR0FBRyxNQUFN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a0IsR0FBRyxPQUFPO0FBQUEsRUFDdEU7QUFHQSxhQUFXLFFBQVFJLFNBQVE7QUFDekIsUUFBSSxLQUFLLFNBQVMsV0FBVztBQUUzQixhQUFPLElBQUksS0FBSyxPQUFPO0FBQUEsUUFDckIsQ0FBQyxZQUFZLE9BQU8sUUFBUSxLQUFLLE9BQU8sT0FBTztBQUFBLE1BQ2pELENBQUM7QUFBQSxJQUNILFdBQVcsS0FBSyxTQUFTLGFBQWE7QUFFcEMsYUFBTyxVQUFVLEtBQUssS0FBSztBQUMzQixhQUFPLElBQUksS0FBSyxPQUFPLENBQUMsQ0FBQztBQUFBLElBQzNCO0FBQUEsRUFDRjtBQUNGLENBQUM7QUFHRCxJQUFNLGNBQWMsQ0FBQztBQUVyQix5QkFBUSxHQUFHLGFBQWEsQ0FBQyxPQUFPLFVBQVU7QUFDeEMsUUFBTSxRQUFRLE1BQU0sT0FBTztBQUMzQixNQUFJLENBQUMsWUFBWSxRQUFRO0FBQ3ZCLGdCQUFZLFNBQVMsb0JBQUksSUFBSTtBQUM3QixXQUFPLFVBQVUsS0FBSztBQUFBLEVBQ3hCO0FBQ0EsY0FBWSxPQUFPLElBQUksS0FBSztBQUM5QixDQUFDO0FBRUQseUJBQVEsR0FBRyxlQUFlLENBQUMsT0FBTyxVQUFVO0FBQzFDLFFBQU0sUUFBUSxNQUFNLE9BQU87QUFDM0IsTUFBSSxZQUFZLFFBQVE7QUFDdEIsZ0JBQVksT0FBTyxPQUFPLEtBQUs7QUFDL0IsUUFBSSxZQUFZLE9BQU8sU0FBUyxHQUFHO0FBQ2pDLGFBQU8sWUFBWTtBQUNuQixhQUFPLFlBQVksS0FBSztBQUFBLElBQzFCO0FBQUEsRUFDRjtBQUNGLENBQUM7QUFHRCxPQUFPLEdBQUcsV0FBVyxDQUFDLE9BQU8sWUFBWTtBQUN2QyxNQUFJLFlBQVksUUFBUTtBQUN0QixnQkFBWSxPQUFPLFFBQVEsQ0FBQyxVQUFVO0FBQ3BDLFlBQU0sTUFBTSw4QkFBYyxPQUFPLEtBQUs7QUFDdEMsVUFBSSxLQUFLO0FBQ1AsWUFBSSxZQUFZLEtBQUssV0FBVyxPQUFPLFFBQVEsU0FBUyxDQUFDO0FBQUEsTUFDM0Q7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQ0YsQ0FBQztBQUdELE9BQU8sR0FBRyxXQUFXLE1BQU07QUFDekIsVUFBUSxJQUFJLGdDQUFnQztBQUM5QyxDQUFDO0FBR0QsT0FBTyxHQUFHLGFBQWEsTUFBTTtBQUMzQixVQUFRLElBQUksZ0NBQWdDO0FBRzVDLGFBQVcsQ0FBQyxPQUFPLFFBQVEsS0FBSyxPQUFPLFFBQVEsR0FBRztBQUNoRCxRQUFJLE9BQU8sYUFBYSxZQUFZO0FBQ2xDLGFBQU8sVUFBVSxLQUFLO0FBQUEsSUFDeEI7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFsiaW1wb3J0X2VsZWN0cm9uIiwgImZzIiwgInBhdGgiLCAib3MiLCAiU3RyZWFtIiwgIm1xdHQiLCAiY29uZmlnIl0KfQo=
