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
import_electron2.ipcMain.on("openRtsp", (event, rtsp) => {
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjLWVsZWN0cm9uL2VsZWN0cm9uLW1haW4uanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7XG4gIGFwcCxcbiAgQnJvd3NlcldpbmRvdyxcbiAgY29udGV4dEJyaWRnZSxcbiAgaXBjUmVuZGVyZXIsXG4gIHNoZWxsLFxufSBmcm9tIFwiZWxlY3Ryb25cIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgb3MgZnJvbSBcIm9zXCI7XG4vLyBcdTU3MjhcdTY1ODdcdTRFRjZcdTk4NzZcdTkwRThcdTVCRkNcdTUxNjVcdTZBMjFcdTU3NTdcbmltcG9ydCBTdHJlYW0gZnJvbSBcIm5vZGUtcnRzcC1zdHJlYW1cIjtcbmltcG9ydCB7IHY0IGFzIHV1aWR2NCB9IGZyb20gXCJ1dWlkXCI7XG5pbXBvcnQgeyBpcGNNYWluIH0gZnJvbSBcImVsZWN0cm9uXCI7XG5pbXBvcnQgbXF0dCBmcm9tIFwibXF0dFwiO1xuaW1wb3J0IGZzIGZyb20gXCJmc1wiO1xuXG4vLyBcdThCRkJcdTUzRDZcdTkxNERcdTdGNkVcdTY1ODdcdTRFRjZcdUZGMENjb25maWcuanNvblxuY29uc3QgY29uZmlnID0gSlNPTi5wYXJzZShcbiAgZnMucmVhZEZpbGVTeW5jKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiY29uZmlnLmpzb25cIiksIFwidXRmOFwiKVxuKTtcblxuLy8gbmVlZGVkIGluIGNhc2UgcHJvY2VzcyBpcyB1bmRlZmluZWQgdW5kZXIgTGludXhcbmNvbnN0IHBsYXRmb3JtID0gcHJvY2Vzcy5wbGF0Zm9ybSB8fCBvcy5wbGF0Zm9ybSgpO1xuXG5sZXQgbWFpbldpbmRvdztcblxuZnVuY3Rpb24gY3JlYXRlV2luZG93KCkge1xuICAvKipcbiAgICogSW5pdGlhbCB3aW5kb3cgb3B0aW9uc1xuICAgKi9cbiAgbWFpbldpbmRvdyA9IG5ldyBCcm93c2VyV2luZG93KHtcbiAgICBpY29uOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcImljb25zL2ljb24ucG5nXCIpLCAvLyB0cmF5IGljb25cbiAgICB3aWR0aDogMTAwMCxcbiAgICBoZWlnaHQ6IDYwMCxcbiAgICB1c2VDb250ZW50U2l6ZTogdHJ1ZSxcbiAgICB3ZWJQcmVmZXJlbmNlczoge1xuICAgICAgY29udGV4dElzb2xhdGlvbjogdHJ1ZSxcbiAgICAgIC8vIE1vcmUgaW5mbzogaHR0cHM6Ly92Mi5xdWFzYXIuZGV2L3F1YXNhci1jbGktd2VicGFjay9kZXZlbG9waW5nLWVsZWN0cm9uLWFwcHMvZWxlY3Ryb24tcHJlbG9hZC1zY3JpcHRcbiAgICAgIHByZWxvYWQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIHByb2Nlc3MuZW52LlFVQVNBUl9FTEVDVFJPTl9QUkVMT0FEKSxcbiAgICB9LFxuICB9KTtcblxuICBtYWluV2luZG93LmxvYWRVUkwocHJvY2Vzcy5lbnYuQVBQX1VSTCk7XG5cbiAgaWYgKHByb2Nlc3MuZW52LkRFQlVHR0lORykge1xuICAgIC8vIGlmIG9uIERFViBvciBQcm9kdWN0aW9uIHdpdGggZGVidWcgZW5hYmxlZFxuICAgIG1haW5XaW5kb3cud2ViQ29udGVudHMub3BlbkRldlRvb2xzKCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gd2UncmUgb24gcHJvZHVjdGlvbjsgbm8gYWNjZXNzIHRvIGRldnRvb2xzIHBsc1xuICAgIG1haW5XaW5kb3cud2ViQ29udGVudHMub24oXCJkZXZ0b29scy1vcGVuZWRcIiwgKCkgPT4ge1xuICAgICAgbWFpbldpbmRvdy53ZWJDb250ZW50cy5jbG9zZURldlRvb2xzKCk7XG4gICAgfSk7XG4gIH1cblxuICBtYWluV2luZG93Lm9uKFwiY2xvc2VkXCIsICgpID0+IHtcbiAgICBtYWluV2luZG93ID0gbnVsbDtcbiAgfSk7XG59XG5cbmFwcC53aGVuUmVhZHkoKS50aGVuKGNyZWF0ZVdpbmRvdyk7XG5cbmFwcC5vbihcIndpbmRvdy1hbGwtY2xvc2VkXCIsICgpID0+IHtcbiAgaWYgKHBsYXRmb3JtICE9PSBcImRhcndpblwiKSB7XG4gICAgYXBwLnF1aXQoKTtcbiAgfVxufSk7XG5cbmFwcC5vbihcImFjdGl2YXRlXCIsICgpID0+IHtcbiAgaWYgKG1haW5XaW5kb3cgPT09IG51bGwpIHtcbiAgICBjb25zb2xlLmxvZyhcIm1haW5XaW5kb3cgaXMgbnVsbFwiKTtcbiAgICBjcmVhdGVXaW5kb3coKTtcbiAgfVxufSk7XG5cbmNvbnN0IHJ0c3BPcGVuZGVycyA9IHt9O1xubGV0IGFkZFBvcnQgPSA5MDAwO1xuXG4vLyBcdThCQkVcdTdGNkVpcGNNYWluXHU3Njg0XHU3NkQxXHU1NDJDXHU1NjY4XHU1OTA0XHU3NDA2XHU1NDBDXHU2QjY1XHU2RDg4XHU2MDZGXG5pcGNNYWluLm9uKFwib3BlblJ0c3BcIiwgKGV2ZW50LCBydHNwKSA9PiB7XG4gIC8qKiBcdTUyMjRcdTY1QURcdTY2MkZcdTU0MjZcdTVERjJcdTVGMDBcdTU0MkYsXHU4MkU1XHU1REYyXHU1RjAwXHU1NDJGLFx1NzZGNFx1NjNBNVx1OEZENFx1NTZERXdzXHU1NzMwXHU1NzQwLCBcdTY3MkFcdTVGMDBcdTU0MkZcdTUyMTlcdTUxNDhcdTVGMDBcdTU0MkZcdTUxOERcdThGRDRcdTU2REUgKi9cbiAgaWYgKHJ0c3BPcGVuZGVyc1tydHNwXSkge1xuICAgIGV2ZW50LnJldHVyblZhbHVlID0ge1xuICAgICAgY29kZTogMjAwLFxuICAgICAgbXNnOiBcIlx1NUYwMFx1NTQyRlx1NjIxMFx1NTI5RlwiLFxuICAgICAgd3M6IHJ0c3BPcGVuZGVyc1tydHNwXS53cyxcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIGFkZFBvcnQrKztcbiAgICBjb25zdCBzdHJlYW0gPSBuZXcgU3RyZWFtKHtcbiAgICAgIG5hbWU6IGBzb2NrZXQtJHthZGRQb3J0fWAsXG4gICAgICBzdHJlYW1Vcmw6IHJ0c3AsXG4gICAgICB3c1BvcnQ6IGFkZFBvcnQsXG4gICAgICAvLyBmZm1wZWdQYXRoOiBjb25maWcuZmZtcGVnUGF0aCxcbiAgICAgIGZmbXBlZ09wdGlvbnM6IHtcbiAgICAgICAgXCItc3RhdHNcIjogXCJcIixcbiAgICAgICAgXCItclwiOiAyMCxcbiAgICAgICAgXCItc1wiOiBcIjMyMHgyNDBcIixcbiAgICAgICAgXCItcHJlc2V0XCI6IFwidWx0cmFmYXN0XCIsXG4gICAgICAgIFwiLXR1bmVcIjogXCJ6ZXJvbGF0ZW5jeVwiLFxuICAgICAgICBcIi1sb2dsZXZlbFwiOiBcInF1aWV0XCIsICAvLyBcdTRFMERcdTY2M0VcdTc5M0FmZm1wZWdcdTc2ODRcdTY1RTVcdTVGRDdcdTRGRTFcdTYwNkZcbiAgICAgICAgXCItbm9zdGF0c1wiOiBcIlwiLCAgLy8gXHU0RTBEXHU2NjNFXHU3OTNBZmZtcGVnXHU3Njg0XHU3RURGXHU4QkExXHU0RkUxXHU2MDZGXG4gICAgICB9LFxuICAgIH0pLm9uKFwiZXhpdFdpdGhFcnJvclwiLCAoKSA9PiB7XG4gICAgICBzdHJlYW0uc3RvcCgpO1xuICAgICAgZGVsZXRlIHJ0c3BPcGVuZGVyc1tydHNwXTtcbiAgICAgIGV2ZW50LnJldHVyblZhbHVlID0ge1xuICAgICAgICBjb2RlOiA0MDAsXG4gICAgICAgIG1zZzogXCJcdTVGMDBcdTU0MkZcdTU5MzFcdThEMjVcIixcbiAgICAgIH07XG4gICAgfSk7XG4gICAgcnRzcE9wZW5kZXJzW3J0c3BdID0ge1xuICAgICAgd3M6IGB3czovL2xvY2FsaG9zdDoke2FkZFBvcnR9YCxcbiAgICAgIHN0cmVhbTogc3RyZWFtLFxuICAgIH07XG4gICAgZXZlbnQucmV0dXJuVmFsdWUgPSB7XG4gICAgICBjb2RlOiAyMDAsXG4gICAgICBtc2c6IFwiXHU1RjAwXHU1NDJGXHU2MjEwXHU1MjlGXCIsXG4gICAgICB3czogcnRzcE9wZW5kZXJzW3J0c3BdLndzLFxuICAgIH07XG4gIH1cbn0pO1xuXG5pcGNNYWluLm9uKFwic3RvcFJ0c3BcIiwgKGV2ZW50LCBydHNwKSA9PiB7XG4gIGlmIChydHNwT3BlbmRlcnNbcnRzcF0pIHtcbiAgICBydHNwT3BlbmRlcnNbcnRzcF0uc3RyZWFtLnN0b3AoKTtcbiAgICBkZWxldGUgcnRzcE9wZW5kZXJzW3J0c3BdO1xuICB9XG59KTtcblxuLy8gXHU1MjFCXHU1RUZBXHU0RTAwXHU0RTJBIE1RVFQgXHU1QkEyXHU2MjM3XHU3QUVGXG5jb25zdCBjbGllbnQgPSBtcXR0LmNvbm5lY3QoXCJtcXR0Oi8vMTAuMTAuMC4xOTU6MTg4M1wiKTtcblxuLy8gXHU1QjU4XHU1MEE4XHU4QkEyXHU5NjA1XHU3Njg0XHU0RTNCXHU5ODk4XHU1NDhDXHU1QjgzXHU0RUVDXHU3Njg0XHU1NkRFXHU4QzAzXHU1MUZEXHU2NTcwXG5jb25zdCB0b3BpY3MgPSBuZXcgTWFwKCk7XG5cbi8vIFx1NUY1MyBNUVRUIFx1NUJBMlx1NjIzN1x1N0FFRlx1OEZERVx1NjNBNVx1NTIzMFx1NjcwRFx1NTJBMVx1NTY2OFx1NjVGNlxuY2xpZW50Lm9uKFwiY29ubmVjdFwiLCAoKSA9PiB7XG4gIGNvbnNvbGUubG9nKFwiQ29ubmVjdGVkIHRvIE1RVFQgYnJva2VyLlwiKTtcblxuICAvLyBcdThCRkJcdTUzRDZcdTkxNERcdTdGNkVcdTY1ODdcdTRFRjZcbiAgY29uc3QgY29uZmlnID0gSlNPTi5wYXJzZShcbiAgICBmcy5yZWFkRmlsZVN5bmMocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJtcXR0LWNvbmZpZy5qc29uXCIpLCBcInV0Zi04XCIpXG4gICk7XG5cbiAgLy8gXHU2ODM5XHU2MzZFXHU5MTREXHU3RjZFXHU2NTg3XHU0RUY2XHU4QkJFXHU3RjZFIE1RVFQgXHU1QkEyXHU2MjM3XHU3QUVGXG4gIGZvciAoY29uc3QgaXRlbSBvZiBjb25maWcpIHtcbiAgICBpZiAoaXRlbS50eXBlID09PSBcInB1Ymxpc2hcIikge1xuICAgICAgLy8gXHU1OTgyXHU2NzlDXHU2NjJGXHU1M0QxXHU1RTAzXHU0RTNCXHU5ODk4XHVGRjBDXHU1MjFCXHU1RUZBXHU0RTAwXHU0RTJBXHU1M0QxXHU1RTAzXHU1NjY4XG4gICAgICB0b3BpY3Muc2V0KGl0ZW0udG9waWMsIFtcbiAgICAgICAgKG1lc3NhZ2UpID0+IGNsaWVudC5wdWJsaXNoKGl0ZW0udG9waWMsIG1lc3NhZ2UpLFxuICAgICAgXSk7XG4gICAgfSBlbHNlIGlmIChpdGVtLnR5cGUgPT09IFwic3Vic2NyaWJlXCIpIHtcbiAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NjYyRlx1OEJBMlx1OTYwNVx1NEUzQlx1OTg5OFx1RkYwQ1x1OEJBMlx1OTYwNVx1NEUzQlx1OTg5OFx1NUU3Nlx1NUI1OFx1NTBBOFx1NTZERVx1OEMwM1x1NTFGRFx1NjU3MFxuICAgICAgY2xpZW50LnN1YnNjcmliZShpdGVtLnRvcGljKTtcbiAgICAgIHRvcGljcy5zZXQoaXRlbS50b3BpYywgW10pO1xuICAgIH1cbiAgfVxufSk7XG5cbi8vIFx1NTIxQlx1NUVGQVx1NEUwMFx1NEUyQVx1NUI1OFx1NTBBOFx1OEJBMlx1OTYwNVx1ODAwNVx1NzY4NFx1N0VEM1x1Njc4NFxuY29uc3Qgc3Vic2NyaWJlcnMgPSB7fTtcblxuaXBjTWFpbi5vbihcInN1YnNjcmliZVwiLCAoZXZlbnQsIHRvcGljKSA9PiB7XG4gIGNvbnN0IHdpbklkID0gZXZlbnQuc2VuZGVyLmlkO1xuICBpZiAoIXN1YnNjcmliZXJzW3RvcGljXSkge1xuICAgIHN1YnNjcmliZXJzW3RvcGljXSA9IG5ldyBTZXQoKTtcbiAgICBjbGllbnQuc3Vic2NyaWJlKHRvcGljKTsgLy8gXHU3ODZFXHU0RkREXHU0RTNCXHU5ODk4XHU4OEFCXHU4QkEyXHU5NjA1XG4gIH1cbiAgc3Vic2NyaWJlcnNbdG9waWNdLmFkZCh3aW5JZCk7XG59KTtcblxuaXBjTWFpbi5vbihcInVuc3Vic2NyaWJlXCIsIChldmVudCwgdG9waWMpID0+IHtcbiAgY29uc3Qgd2luSWQgPSBldmVudC5zZW5kZXIuaWQ7XG4gIGlmIChzdWJzY3JpYmVyc1t0b3BpY10pIHtcbiAgICBzdWJzY3JpYmVyc1t0b3BpY10uZGVsZXRlKHdpbklkKTtcbiAgICBpZiAoc3Vic2NyaWJlcnNbdG9waWNdLnNpemUgPT09IDApIHtcbiAgICAgIGRlbGV0ZSBzdWJzY3JpYmVyc1t0b3BpY107XG4gICAgICBjbGllbnQudW5zdWJzY3JpYmUodG9waWMpOyAvLyBcdTU5ODJcdTY3OUNcdTZDQTFcdTY3MDlcdThCQTJcdTk2MDVcdTgwMDVcdUZGMENcdTUzRDZcdTZEODhcdThCQTJcdTk2MDVcbiAgICB9XG4gIH1cbn0pO1xuXG4vLyBcdTVGNTMgTVFUVCBcdTVCQTJcdTYyMzdcdTdBRUZcdTY1MzZcdTUyMzBcdTZEODhcdTYwNkZcdTY1RjZcbmNsaWVudC5vbihcIm1lc3NhZ2VcIiwgKHRvcGljLCBtZXNzYWdlKSA9PiB7XG4gIGlmIChzdWJzY3JpYmVyc1t0b3BpY10pIHtcbiAgICBzdWJzY3JpYmVyc1t0b3BpY10uZm9yRWFjaCgod2luSWQpID0+IHtcbiAgICAgIGNvbnN0IHdpbiA9IEJyb3dzZXJXaW5kb3cuZnJvbUlkKHdpbklkKTtcbiAgICAgIGlmICh3aW4pIHtcbiAgICAgICAgd2luLndlYkNvbnRlbnRzLnNlbmQoXCJtZXNzYWdlXCIsIHRvcGljLCBtZXNzYWdlLnRvU3RyaW5nKCkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59KTtcblxuLy8gXHU1RjUzIE1RVFQgXHU1QkEyXHU2MjM3XHU3QUVGXHU2NUFEXHU1RjAwXHU4RkRFXHU2M0E1XHU2NUY2XG5jbGllbnQub24oXCJvZmZsaW5lXCIsICgpID0+IHtcbiAgY29uc29sZS5sb2coXCJEaXNjb25uZWN0ZWQgZnJvbSBNUVRUIGJyb2tlci5cIik7XG59KTtcblxuLy8gXHU1RjUzIE1RVFQgXHU1QkEyXHU2MjM3XHU3QUVGXHU1QzFEXHU4QkQ1XHU5MUNEXHU2NUIwXHU4RkRFXHU2M0E1XHU2NUY2XG5jbGllbnQub24oXCJyZWNvbm5lY3RcIiwgKCkgPT4ge1xuICBjb25zb2xlLmxvZyhcIlJlY29ubmVjdGluZyB0byBNUVRUIGJyb2tlci4uLlwiKTtcblxuICAvLyBcdTkxQ0RcdTY1QjBcdThCQTJcdTk2MDVcdTYyNDBcdTY3MDlcdTRFM0JcdTk4OThcbiAgZm9yIChjb25zdCBbdG9waWMsIGNhbGxiYWNrXSBvZiB0b3BpY3MuZW50cmllcygpKSB7XG4gICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBjbGllbnQuc3Vic2NyaWJlKHRvcGljKTtcbiAgICB9XG4gIH1cbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxzQkFNTztBQUNQLGtCQUFpQjtBQUNqQixnQkFBZTtBQUVmLDhCQUFtQjtBQUNuQixrQkFBNkI7QUFDN0IsSUFBQUEsbUJBQXdCO0FBQ3hCLGtCQUFpQjtBQUNqQixnQkFBZTtBQUdmLElBQU0sU0FBUyxLQUFLO0FBQUEsRUFDbEIsVUFBQUMsUUFBRyxhQUFhLFlBQUFDLFFBQUssUUFBUSxXQUFXLGFBQWEsR0FBRyxNQUFNO0FBQ2hFO0FBR0EsSUFBTSxXQUFXLFFBQVEsWUFBWSxVQUFBQyxRQUFHLFNBQVM7QUFFakQsSUFBSTtBQUVKLFNBQVMsZUFBZTtBQUl0QixlQUFhLElBQUksOEJBQWM7QUFBQSxJQUM3QixNQUFNLFlBQUFELFFBQUssUUFBUSxXQUFXLGdCQUFnQjtBQUFBLElBQzlDLE9BQU87QUFBQSxJQUNQLFFBQVE7QUFBQSxJQUNSLGdCQUFnQjtBQUFBLElBQ2hCLGdCQUFnQjtBQUFBLE1BQ2Qsa0JBQWtCO0FBQUEsTUFFbEIsU0FBUyxZQUFBQSxRQUFLLFFBQVEsV0FBVywyRUFBbUM7QUFBQSxJQUN0RTtBQUFBLEVBQ0YsQ0FBQztBQUVELGFBQVcsUUFBUSx1QkFBbUI7QUFFdEMsTUFBSSxNQUF1QjtBQUV6QixlQUFXLFlBQVksYUFBYTtBQUFBLEVBQ3RDLE9BQU87QUFFTCxlQUFXLFlBQVksR0FBRyxtQkFBbUIsTUFBTTtBQUNqRCxpQkFBVyxZQUFZLGNBQWM7QUFBQSxJQUN2QyxDQUFDO0FBQUEsRUFDSDtBQUVBLGFBQVcsR0FBRyxVQUFVLE1BQU07QUFDNUIsaUJBQWE7QUFBQSxFQUNmLENBQUM7QUFDSDtBQUVBLG9CQUFJLFVBQVUsRUFBRSxLQUFLLFlBQVk7QUFFakMsb0JB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Qy9CLFFBQUksWUFBWSxPQUFPLFNBQVMsR0FBRztBQUNqQyxhQUFPLFlBQVk7QUFDbkIsYUFBTyxZQUFZLEtBQUs7QUFBQSxJQUMxQjtBQUFBLEVBQ0Y7QUFDRixDQUFDO0FBR0QsT0FBTyxHQUFHLFdBQVcsQ0FBQyxPQUFPLFlBQVk7QUFDdkMsTUFBSSxZQUFZLFFBQVE7QUFDdEIsZ0JBQVksT0FBTyxRQUFRLENBQUMsVUFBVTtBQUNwQyxZQUFNLE1BQU0sOEJBQWMsT0FBTyxLQUFLO0FBQ3RDLFVBQUksS0FBSztBQUNQLFlBQUksWUFBWSxLQUFLLFdBQVcsT0FBTyxRQUFRLFNBQVMsQ0FBQztBQUFBLE1BQzNEO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUNGLENBQUM7QUFHRCxPQUFPLEdBQUcsV0FBVyxNQUFNO0FBQ3pCLFVBQVEsSUFBSSxnQ0FBZ0M7QUFDOUMsQ0FBQztBQUdELE9BQU8sR0FBRyxhQUFhLE1BQU07QUFDM0IsVUFBUSxJQUFJLGdDQUFnQztBQUc1QyxhQUFXLENBQUMsT0FBTyxRQUFRLEtBQUssT0FBTyxRQUFRLEdBQUc7QUFDaEQsUUFBSSxPQUFPLGFBQWEsWUFBWTtBQUNsQyxhQUFPLFVBQVUsS0FBSztBQUFBLElBQ3hCO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbImltcG9ydF9lbGVjdHJvbiIsICJmcyIsICJwYXRoIiwgIm9zIiwgIlN0cmVhbSIsICJtcXR0IiwgImNvbmZpZyJdCn0K
