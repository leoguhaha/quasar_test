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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjLWVsZWN0cm9uL2VsZWN0cm9uLW1haW4uanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7XG4gIGFwcCxcbiAgQnJvd3NlcldpbmRvdyxcbiAgY29udGV4dEJyaWRnZSxcbiAgaXBjUmVuZGVyZXIsXG4gIHNoZWxsLFxufSBmcm9tIFwiZWxlY3Ryb25cIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgb3MgZnJvbSBcIm9zXCI7XG4vLyBcdTU3MjhcdTY1ODdcdTRFRjZcdTk4NzZcdTkwRThcdTVCRkNcdTUxNjVcdTZBMjFcdTU3NTdcbmltcG9ydCBTdHJlYW0gZnJvbSBcIm5vZGUtcnRzcC1zdHJlYW1cIjtcbmltcG9ydCB7IHY0IGFzIHV1aWR2NCB9IGZyb20gXCJ1dWlkXCI7XG5pbXBvcnQgeyBpcGNNYWluIH0gZnJvbSBcImVsZWN0cm9uXCI7XG5pbXBvcnQgbXF0dCBmcm9tIFwibXF0dFwiO1xuaW1wb3J0IGZzIGZyb20gXCJmc1wiO1xuXG4vLyBcdThCRkJcdTUzRDZcdTkxNERcdTdGNkVcdTY1ODdcdTRFRjZcdUZGMENjb25maWcuanNvblxuY29uc3QgY29uZmlnID0gSlNPTi5wYXJzZShcbiAgZnMucmVhZEZpbGVTeW5jKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiY29uZmlnLmpzb25cIiksIFwidXRmOFwiKVxuKTtcblxuLy8gbmVlZGVkIGluIGNhc2UgcHJvY2VzcyBpcyB1bmRlZmluZWQgdW5kZXIgTGludXhcbmNvbnN0IHBsYXRmb3JtID0gcHJvY2Vzcy5wbGF0Zm9ybSB8fCBvcy5wbGF0Zm9ybSgpO1xuXG5sZXQgbWFpbldpbmRvdztcblxuZnVuY3Rpb24gY3JlYXRlV2luZG93KCkge1xuICAvKipcbiAgICogSW5pdGlhbCB3aW5kb3cgb3B0aW9uc1xuICAgKi9cbiAgbWFpbldpbmRvdyA9IG5ldyBCcm93c2VyV2luZG93KHtcbiAgICBpY29uOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcImljb25zL2ljb24ucG5nXCIpLCAvLyB0cmF5IGljb25cbiAgICB3aWR0aDogMTAwMCxcbiAgICBoZWlnaHQ6IDYwMCxcbiAgICBmdWxsc2NyZWVuOiB0cnVlLCAvLyBcdTZERkJcdTUyQTBcdTZCNjRcdTg4NENcdTRFRTNcdTc4MDFcbiAgICB1c2VDb250ZW50U2l6ZTogdHJ1ZSxcbiAgICB3ZWJQcmVmZXJlbmNlczoge1xuICAgICAgY29udGV4dElzb2xhdGlvbjogdHJ1ZSxcbiAgICAgIC8vIE1vcmUgaW5mbzogaHR0cHM6Ly92Mi5xdWFzYXIuZGV2L3F1YXNhci1jbGktd2VicGFjay9kZXZlbG9waW5nLWVsZWN0cm9uLWFwcHMvZWxlY3Ryb24tcHJlbG9hZC1zY3JpcHRcbiAgICAgIHByZWxvYWQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIHByb2Nlc3MuZW52LlFVQVNBUl9FTEVDVFJPTl9QUkVMT0FEKSxcbiAgICB9LFxuICB9KTtcblxuICBtYWluV2luZG93LmxvYWRVUkwocHJvY2Vzcy5lbnYuQVBQX1VSTCk7XG5cbiAgaWYgKHByb2Nlc3MuZW52LkRFQlVHR0lORykge1xuICAgIC8vIGlmIG9uIERFViBvciBQcm9kdWN0aW9uIHdpdGggZGVidWcgZW5hYmxlZFxuICAgIG1haW5XaW5kb3cud2ViQ29udGVudHMub3BlbkRldlRvb2xzKCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gd2UncmUgb24gcHJvZHVjdGlvbjsgbm8gYWNjZXNzIHRvIGRldnRvb2xzIHBsc1xuICAgIG1haW5XaW5kb3cud2ViQ29udGVudHMub24oXCJkZXZ0b29scy1vcGVuZWRcIiwgKCkgPT4ge1xuICAgICAgbWFpbldpbmRvdy53ZWJDb250ZW50cy5jbG9zZURldlRvb2xzKCk7XG4gICAgfSk7XG4gIH1cblxuICBtYWluV2luZG93Lm9uKFwiY2xvc2VkXCIsICgpID0+IHtcbiAgICBtYWluV2luZG93ID0gbnVsbDtcbiAgfSk7XG59XG5cbmFwcC53aGVuUmVhZHkoKS50aGVuKGNyZWF0ZVdpbmRvdyk7XG5cbmFwcC5vbihcIndpbmRvdy1hbGwtY2xvc2VkXCIsICgpID0+IHtcbiAgaWYgKHBsYXRmb3JtICE9PSBcImRhcndpblwiKSB7XG4gICAgYXBwLnF1aXQoKTtcbiAgfVxufSk7XG5cbmFwcC5vbihcImFjdGl2YXRlXCIsICgpID0+IHtcbiAgaWYgKG1haW5XaW5kb3cgPT09IG51bGwpIHtcbiAgICBjb25zb2xlLmxvZyhcIm1haW5XaW5kb3cgaXMgbnVsbFwiKTtcbiAgICBjcmVhdGVXaW5kb3coKTtcbiAgfVxufSk7XG5cbmNvbnN0IHJ0c3BPcGVuZGVycyA9IHt9O1xubGV0IGFkZFBvcnQgPSA5MDAwO1xuXG4vLyBcdThCQkVcdTdGNkVpcGNNYWluXHU3Njg0XHU3NkQxXHU1NDJDXHU1NjY4XHU1OTA0XHU3NDA2XHU1NDBDXHU2QjY1XHU2RDg4XHU2MDZGXG5pcGNNYWluLm9uKFwib3BlblJ0c3BcIiwgKGV2ZW50LCBydHNwLCBpc0hpZ2hRdWFsaXR5ID0gZmFsc2UpID0+IHtcbiAgLyoqIFx1NTIyNFx1NjVBRFx1NjYyRlx1NTQyNlx1NURGMlx1NUYwMFx1NTQyRixcdTgyRTVcdTVERjJcdTVGMDBcdTU0MkYsXHU3NkY0XHU2M0E1XHU4RkQ0XHU1NkRFd3NcdTU3MzBcdTU3NDAsIFx1NjcyQVx1NUYwMFx1NTQyRlx1NTIxOVx1NTE0OFx1NUYwMFx1NTQyRlx1NTE4RFx1OEZENFx1NTZERSAqL1xuICBjb25zb2xlLmxvZyhcIm9wZW5SdHNwXCIsIHJ0c3ApO1xuICBpZiAocnRzcE9wZW5kZXJzW3J0c3BdKSB7XG4gICAgZXZlbnQucmV0dXJuVmFsdWUgPSB7XG4gICAgICBjb2RlOiAyMDAsXG4gICAgICBtc2c6IFwiXHU1RjAwXHU1NDJGXHU2MjEwXHU1MjlGXCIsXG4gICAgICB3czogcnRzcE9wZW5kZXJzW3J0c3BdLndzLFxuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgYWRkUG9ydCsrO1xuICAgIGNvbnN0IHN0cmVhbSA9IG5ldyBTdHJlYW0oe1xuICAgICAgbmFtZTogYHNvY2tldC0ke2FkZFBvcnR9YCxcbiAgICAgIHN0cmVhbVVybDogcnRzcCxcbiAgICAgIHdzUG9ydDogYWRkUG9ydCxcbiAgICAgIC8vIGZmbXBlZ1BhdGg6IGNvbmZpZy5mZm1wZWdQYXRoLFxuICAgICAgZmZtcGVnT3B0aW9uczoge1xuICAgICAgICBcIi1zdGF0c1wiOiBcIlwiLFxuICAgICAgICBcIi1yXCI6IDIwLFxuICAgICAgICBcIi1zXCI6IFwiMzIweDI0MFwiLFxuICAgICAgICBcIi1wcmVzZXRcIjogXCJ1bHRyYWZhc3RcIixcbiAgICAgICAgXCItdHVuZVwiOiBcInplcm9sYXRlbmN5XCIsXG4gICAgICAgIFwiLWxvZ2xldmVsXCI6IFwicXVpZXRcIiwgIC8vIFx1NEUwRFx1NjYzRVx1NzkzQWZmbXBlZ1x1NzY4NFx1NjVFNVx1NUZEN1x1NEZFMVx1NjA2RlxuICAgICAgICBcIi1ub3N0YXRzXCI6IFwiXCIsICAvLyBcdTRFMERcdTY2M0VcdTc5M0FmZm1wZWdcdTc2ODRcdTdFREZcdThCQTFcdTRGRTFcdTYwNkZcbiAgICAgIH0sXG4gICAgfSkub24oXCJleGl0V2l0aEVycm9yXCIsICgpID0+IHtcbiAgICAgIHN0cmVhbS5zdG9wKCk7XG4gICAgICBkZWxldGUgcnRzcE9wZW5kZXJzW3J0c3BdO1xuICAgICAgZXZlbnQucmV0dXJuVmFsdWUgPSB7XG4gICAgICAgIGNvZGU6IDQwMCxcbiAgICAgICAgbXNnOiBcIlx1NUYwMFx1NTQyRlx1NTkzMVx1OEQyNVwiLFxuICAgICAgfTtcbiAgICB9KTtcbiAgICBydHNwT3BlbmRlcnNbcnRzcF0gPSB7XG4gICAgICB3czogYHdzOi8vbG9jYWxob3N0OiR7YWRkUG9ydH1gLFxuICAgICAgc3RyZWFtOiBzdHJlYW0sXG4gICAgfTtcbiAgICBldmVudC5yZXR1cm5WYWx1ZSA9IHtcbiAgICAgIGNvZGU6IDIwMCxcbiAgICAgIG1zZzogXCJcdTVGMDBcdTU0MkZcdTYyMTBcdTUyOUZcIixcbiAgICAgIHdzOiBydHNwT3BlbmRlcnNbcnRzcF0ud3MsXG4gICAgfTtcbiAgfVxufSk7XG5cbmlwY01haW4ub24oXCJzdG9wUnRzcFwiLCAoZXZlbnQsIHJ0c3ApID0+IHtcbiAgaWYgKHJ0c3BPcGVuZGVyc1tydHNwXSkge1xuICAgIHJ0c3BPcGVuZGVyc1tydHNwXS5zdHJlYW0uc3RvcCgpO1xuICAgIGRlbGV0ZSBydHNwT3BlbmRlcnNbcnRzcF07XG4gIH1cbn0pO1xuXG4vLyBcdTUyMUJcdTVFRkFcdTRFMDBcdTRFMkEgTVFUVCBcdTVCQTJcdTYyMzdcdTdBRUZcbmNvbnN0IGNsaWVudCA9IG1xdHQuY29ubmVjdChcIm1xdHQ6Ly8xMC4xMC4wLjE5NToxODgzXCIpO1xuXG4vLyBcdTVCNThcdTUwQThcdThCQTJcdTk2MDVcdTc2ODRcdTRFM0JcdTk4OThcdTU0OENcdTVCODNcdTRFRUNcdTc2ODRcdTU2REVcdThDMDNcdTUxRkRcdTY1NzBcbmNvbnN0IHRvcGljcyA9IG5ldyBNYXAoKTtcblxuLy8gXHU1RjUzIE1RVFQgXHU1QkEyXHU2MjM3XHU3QUVGXHU4RkRFXHU2M0E1XHU1MjMwXHU2NzBEXHU1MkExXHU1NjY4XHU2NUY2XG5jbGllbnQub24oXCJjb25uZWN0XCIsICgpID0+IHtcbiAgY29uc29sZS5sb2coXCJDb25uZWN0ZWQgdG8gTVFUVCBicm9rZXIuXCIpO1xuXG4gIC8vIFx1OEJGQlx1NTNENlx1OTE0RFx1N0Y2RVx1NjU4N1x1NEVGNlxuICBjb25zdCBjb25maWcgPSBKU09OLnBhcnNlKFxuICAgIGZzLnJlYWRGaWxlU3luYyhwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIm1xdHQtY29uZmlnLmpzb25cIiksIFwidXRmLThcIilcbiAgKTtcblxuICAvLyBcdTY4MzlcdTYzNkVcdTkxNERcdTdGNkVcdTY1ODdcdTRFRjZcdThCQkVcdTdGNkUgTVFUVCBcdTVCQTJcdTYyMzdcdTdBRUZcbiAgZm9yIChjb25zdCBpdGVtIG9mIGNvbmZpZykge1xuICAgIGlmIChpdGVtLnR5cGUgPT09IFwicHVibGlzaFwiKSB7XG4gICAgICAvLyBcdTU5ODJcdTY3OUNcdTY2MkZcdTUzRDFcdTVFMDNcdTRFM0JcdTk4OThcdUZGMENcdTUyMUJcdTVFRkFcdTRFMDBcdTRFMkFcdTUzRDFcdTVFMDNcdTU2NjhcbiAgICAgIHRvcGljcy5zZXQoaXRlbS50b3BpYywgW1xuICAgICAgICAobWVzc2FnZSkgPT4gY2xpZW50LnB1Ymxpc2goaXRlbS50b3BpYywgbWVzc2FnZSksXG4gICAgICBdKTtcbiAgICB9IGVsc2UgaWYgKGl0ZW0udHlwZSA9PT0gXCJzdWJzY3JpYmVcIikge1xuICAgICAgLy8gXHU1OTgyXHU2NzlDXHU2NjJGXHU4QkEyXHU5NjA1XHU0RTNCXHU5ODk4XHVGRjBDXHU4QkEyXHU5NjA1XHU0RTNCXHU5ODk4XHU1RTc2XHU1QjU4XHU1MEE4XHU1NkRFXHU4QzAzXHU1MUZEXHU2NTcwXG4gICAgICBjbGllbnQuc3Vic2NyaWJlKGl0ZW0udG9waWMpO1xuICAgICAgdG9waWNzLnNldChpdGVtLnRvcGljLCBbXSk7XG4gICAgfVxuICB9XG59KTtcblxuLy8gXHU1MjFCXHU1RUZBXHU0RTAwXHU0RTJBXHU1QjU4XHU1MEE4XHU4QkEyXHU5NjA1XHU4MDA1XHU3Njg0XHU3RUQzXHU2Nzg0XG5jb25zdCBzdWJzY3JpYmVycyA9IHt9O1xuXG5pcGNNYWluLm9uKFwic3Vic2NyaWJlXCIsIChldmVudCwgdG9waWMpID0+IHtcbiAgY29uc3Qgd2luSWQgPSBldmVudC5zZW5kZXIuaWQ7XG4gIGlmICghc3Vic2NyaWJlcnNbdG9waWNdKSB7XG4gICAgc3Vic2NyaWJlcnNbdG9waWNdID0gbmV3IFNldCgpO1xuICAgIGNsaWVudC5zdWJzY3JpYmUodG9waWMpOyAvLyBcdTc4NkVcdTRGRERcdTRFM0JcdTk4OThcdTg4QUJcdThCQTJcdTk2MDVcbiAgfVxuICBzdWJzY3JpYmVyc1t0b3BpY10uYWRkKHdpbklkKTtcbn0pO1xuXG5pcGNNYWluLm9uKFwidW5zdWJzY3JpYmVcIiwgKGV2ZW50LCB0b3BpYykgPT4ge1xuICBjb25zdCB3aW5JZCA9IGV2ZW50LnNlbmRlci5pZDtcbiAgaWYgKHN1YnNjcmliZXJzW3RvcGljXSkge1xuICAgIHN1YnNjcmliZXJzW3RvcGljXS5kZWxldGUod2luSWQpO1xuICAgIGlmIChzdWJzY3JpYmVyc1t0b3BpY10uc2l6ZSA9PT0gMCkge1xuICAgICAgZGVsZXRlIHN1YnNjcmliZXJzW3RvcGljXTtcbiAgICAgIGNsaWVudC51bnN1YnNjcmliZSh0b3BpYyk7IC8vIFx1NTk4Mlx1Njc5Q1x1NkNBMVx1NjcwOVx1OEJBMlx1OTYwNVx1ODAwNVx1RkYwQ1x1NTNENlx1NkQ4OFx1OEJBMlx1OTYwNVxuICAgIH1cbiAgfVxufSk7XG5cbi8vIFx1NUY1MyBNUVRUIFx1NUJBMlx1NjIzN1x1N0FFRlx1NjUzNlx1NTIzMFx1NkQ4OFx1NjA2Rlx1NjVGNlxuY2xpZW50Lm9uKFwibWVzc2FnZVwiLCAodG9waWMsIG1lc3NhZ2UpID0+IHtcbiAgaWYgKHN1YnNjcmliZXJzW3RvcGljXSkge1xuICAgIHN1YnNjcmliZXJzW3RvcGljXS5mb3JFYWNoKCh3aW5JZCkgPT4ge1xuICAgICAgY29uc3Qgd2luID0gQnJvd3NlcldpbmRvdy5mcm9tSWQod2luSWQpO1xuICAgICAgaWYgKHdpbikge1xuICAgICAgICB3aW4ud2ViQ29udGVudHMuc2VuZChcIm1lc3NhZ2VcIiwgdG9waWMsIG1lc3NhZ2UudG9TdHJpbmcoKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn0pO1xuXG4vLyBcdTVGNTMgTVFUVCBcdTVCQTJcdTYyMzdcdTdBRUZcdTY1QURcdTVGMDBcdThGREVcdTYzQTVcdTY1RjZcbmNsaWVudC5vbihcIm9mZmxpbmVcIiwgKCkgPT4ge1xuICBjb25zb2xlLmxvZyhcIkRpc2Nvbm5lY3RlZCBmcm9tIE1RVFQgYnJva2VyLlwiKTtcbn0pO1xuXG4vLyBcdTVGNTMgTVFUVCBcdTVCQTJcdTYyMzdcdTdBRUZcdTVDMURcdThCRDVcdTkxQ0RcdTY1QjBcdThGREVcdTYzQTVcdTY1RjZcbmNsaWVudC5vbihcInJlY29ubmVjdFwiLCAoKSA9PiB7XG4gIGNvbnNvbGUubG9nKFwiUmVjb25uZWN0aW5nIHRvIE1RVFQgYnJva2VyLi4uXCIpO1xuXG4gIC8vIFx1OTFDRFx1NjVCMFx1OEJBMlx1OTYwNVx1NjI0MFx1NjcwOVx1NEUzQlx1OTg5OFxuICBmb3IgKGNvbnN0IFt0b3BpYywgY2FsbGJhY2tdIG9mIHRvcGljcy5lbnRyaWVzKCkpIHtcbiAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIGNsaWVudC5zdWJzY3JpYmUodG9waWMpO1xuICAgIH1cbiAgfVxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHNCQU1PO0FBQ1Asa0JBQWlCO0FBQ2pCLGdCQUFlO0FBRWYsOEJBQW1CO0FBQ25CLGtCQUE2QjtBQUM3QixJQUFBQSxtQkFBd0I7QUFDeEIsa0JBQWlCO0FBQ2pCLGdCQUFlO0FBR2YsSUFBTSxTQUFTLEtBQUs7QUFBQSxFQUNsQixVQUFBQyxRQUFHLGFBQWEsWUFBQUMsUUFBSyxRQUFRLFdBQVcsYUFBYSxHQUFHLE1BQU07QUFDaEU7QUFHQSxJQUFNLFdBQVcsUUFBUSxZQUFZLFVBQUFDLFFBQUcsU0FBUztBQUVqRCxJQUFJO0FBRUosU0FBUyxlQUFlO0FBSXRCLGVBQWEsSUFBSSw4QkFBYztBQUFBLElBQzdCLE1BQU0sWUFBQUQsUUFBSyxRQUFRLFdBQVcsZ0JBQWdCO0FBQUEsSUFDOUMsT0FBTztBQUFBLElBQ1AsUUFBUTtBQUFBLElBQ1IsWUFBWTtBQUFBLElBQ1osZ0JBQWdCO0FBQUEsSUFDaEIsZ0JBQWdCO0FBQUEsTUFDZCxrQkFBa0I7QUFBQSxNQUVsQixTQUFTLFlBQUFBLFFBQUssUUFBUSxXQUFXLDJFQUFtQztBQUFBLElBQ3RFO0FBQUEsRUFDRixDQUFDO0FBRUQsYUFBVyxRQUFRLHVCQUFtQjtBQUV0QyxNQUFJLE1BQXVCO0FBRXpCLGVBQVcsWUFBWSxhQUFhO0FBQUEsRUFDdEMsT0FBTztBQUVMLGVBQVcsWUFBWSxHQUFHLG1CQUFtQixNQUFNO0FBQ2pELGlC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LFdBQU8sVUFBVSxLQUFLO0FBQUEsRUFDeEI7QUFDQSxjQUFZLE9BQU8sSUFBSSxLQUFLO0FBQzlCLENBQUM7QUFFRCx5QkFBUSxHQUFHLGVBQWUsQ0FBQyxPQUFPLFVBQVU7QUFDMUMsUUFBTSxRQUFRLE1BQU0sT0FBTztBQUMzQixNQUFJLFlBQVksUUFBUTtBQUN0QixnQkFBWSxPQUFPLE9BQU8sS0FBSztBQUMvQixRQUFJLFlBQVksT0FBTyxTQUFTLEdBQUc7QUFDakMsYUFBTyxZQUFZO0FBQ25CLGFBQU8sWUFBWSxLQUFLO0FBQUEsSUFDMUI7QUFBQSxFQUNGO0FBQ0YsQ0FBQztBQUdELE9BQU8sR0FBRyxXQUFXLENBQUMsT0FBTyxZQUFZO0FBQ3ZDLE1BQUksWUFBWSxRQUFRO0FBQ3RCLGdCQUFZLE9BQU8sUUFBUSxDQUFDLFVBQVU7QUFDcEMsWUFBTSxNQUFNLDhCQUFjLE9BQU8sS0FBSztBQUN0QyxVQUFJLEtBQUs7QUFDUCxZQUFJLFlBQVksS0FBSyxXQUFXLE9BQU8sUUFBUSxTQUFTLENBQUM7QUFBQSxNQUMzRDtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFDRixDQUFDO0FBR0QsT0FBTyxHQUFHLFdBQVcsTUFBTTtBQUN6QixVQUFRLElBQUksZ0NBQWdDO0FBQzlDLENBQUM7QUFHRCxPQUFPLEdBQUcsYUFBYSxNQUFNO0FBQzNCLFVBQVEsSUFBSSxnQ0FBZ0M7QUFHNUMsYUFBVyxDQUFDLE9BQU8sUUFBUSxLQUFLLE9BQU8sUUFBUSxHQUFHO0FBQ2hELFFBQUksT0FBTyxhQUFhLFlBQVk7QUFDbEMsYUFBTyxVQUFVLEtBQUs7QUFBQSxJQUN4QjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogWyJpbXBvcnRfZWxlY3Ryb24iLCAiZnMiLCAicGF0aCIsICJvcyIsICJTdHJlYW0iLCAibXF0dCIsICJjb25maWciXQp9Cg==
