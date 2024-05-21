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
    fullscreen: false,
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjLWVsZWN0cm9uL2VsZWN0cm9uLW1haW4uanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7XG4gIGFwcCxcbiAgQnJvd3NlcldpbmRvdyxcbiAgY29udGV4dEJyaWRnZSxcbiAgaXBjUmVuZGVyZXIsXG4gIHNoZWxsLFxufSBmcm9tIFwiZWxlY3Ryb25cIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgb3MgZnJvbSBcIm9zXCI7XG4vLyBcdTU3MjhcdTY1ODdcdTRFRjZcdTk4NzZcdTkwRThcdTVCRkNcdTUxNjVcdTZBMjFcdTU3NTdcbmltcG9ydCBTdHJlYW0gZnJvbSBcIm5vZGUtcnRzcC1zdHJlYW1cIjtcbmltcG9ydCB7IHY0IGFzIHV1aWR2NCB9IGZyb20gXCJ1dWlkXCI7XG5pbXBvcnQgeyBpcGNNYWluIH0gZnJvbSBcImVsZWN0cm9uXCI7XG5pbXBvcnQgbXF0dCBmcm9tIFwibXF0dFwiO1xuaW1wb3J0IGZzIGZyb20gXCJmc1wiO1xuXG4vLyBcdThCRkJcdTUzRDZcdTkxNERcdTdGNkVcdTY1ODdcdTRFRjZcdUZGMENjb25maWcuanNvblxuY29uc3QgY29uZmlnID0gSlNPTi5wYXJzZShcbiAgZnMucmVhZEZpbGVTeW5jKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiY29uZmlnLmpzb25cIiksIFwidXRmOFwiKVxuKTtcblxuLy8gbmVlZGVkIGluIGNhc2UgcHJvY2VzcyBpcyB1bmRlZmluZWQgdW5kZXIgTGludXhcbmNvbnN0IHBsYXRmb3JtID0gcHJvY2Vzcy5wbGF0Zm9ybSB8fCBvcy5wbGF0Zm9ybSgpO1xuXG5sZXQgbWFpbldpbmRvdztcblxuZnVuY3Rpb24gY3JlYXRlV2luZG93KCkge1xuICAvKipcbiAgICogSW5pdGlhbCB3aW5kb3cgb3B0aW9uc1xuICAgKi9cbiAgbWFpbldpbmRvdyA9IG5ldyBCcm93c2VyV2luZG93KHtcbiAgICBpY29uOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcImljb25zL2ljb24ucG5nXCIpLCAvLyB0cmF5IGljb25cbiAgICB3aWR0aDogMTAwMCxcbiAgICBoZWlnaHQ6IDYwMCxcbiAgICBmdWxsc2NyZWVuOiBmYWxzZSwgLy8gXHU2REZCXHU1MkEwXHU2QjY0XHU4ODRDXHU0RUUzXHU3ODAxXG4gICAgdXNlQ29udGVudFNpemU6IHRydWUsXG4gICAgd2ViUHJlZmVyZW5jZXM6IHtcbiAgICAgIGNvbnRleHRJc29sYXRpb246IHRydWUsXG4gICAgICAvLyBNb3JlIGluZm86IGh0dHBzOi8vdjIucXVhc2FyLmRldi9xdWFzYXItY2xpLXdlYnBhY2svZGV2ZWxvcGluZy1lbGVjdHJvbi1hcHBzL2VsZWN0cm9uLXByZWxvYWQtc2NyaXB0XG4gICAgICBwcmVsb2FkOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBwcm9jZXNzLmVudi5RVUFTQVJfRUxFQ1RST05fUFJFTE9BRCksXG4gICAgfSxcbiAgfSk7XG5cbiAgbWFpbldpbmRvdy5sb2FkVVJMKHByb2Nlc3MuZW52LkFQUF9VUkwpO1xuXG4gIGlmIChwcm9jZXNzLmVudi5ERUJVR0dJTkcpIHtcbiAgICAvLyBpZiBvbiBERVYgb3IgUHJvZHVjdGlvbiB3aXRoIGRlYnVnIGVuYWJsZWRcbiAgICBtYWluV2luZG93LndlYkNvbnRlbnRzLm9wZW5EZXZUb29scygpO1xuICB9IGVsc2Uge1xuICAgIC8vIHdlJ3JlIG9uIHByb2R1Y3Rpb247IG5vIGFjY2VzcyB0byBkZXZ0b29scyBwbHNcbiAgICBtYWluV2luZG93LndlYkNvbnRlbnRzLm9uKFwiZGV2dG9vbHMtb3BlbmVkXCIsICgpID0+IHtcbiAgICAgIG1haW5XaW5kb3cud2ViQ29udGVudHMuY2xvc2VEZXZUb29scygpO1xuICAgIH0pO1xuICB9XG5cbiAgbWFpbldpbmRvdy5vbihcImNsb3NlZFwiLCAoKSA9PiB7XG4gICAgbWFpbldpbmRvdyA9IG51bGw7XG4gIH0pO1xufVxuXG5hcHAud2hlblJlYWR5KCkudGhlbihjcmVhdGVXaW5kb3cpO1xuXG5hcHAub24oXCJ3aW5kb3ctYWxsLWNsb3NlZFwiLCAoKSA9PiB7XG4gIGlmIChwbGF0Zm9ybSAhPT0gXCJkYXJ3aW5cIikge1xuICAgIGFwcC5xdWl0KCk7XG4gIH1cbn0pO1xuXG5hcHAub24oXCJhY3RpdmF0ZVwiLCAoKSA9PiB7XG4gIGlmIChtYWluV2luZG93ID09PSBudWxsKSB7XG4gICAgY29uc29sZS5sb2coXCJtYWluV2luZG93IGlzIG51bGxcIik7XG4gICAgY3JlYXRlV2luZG93KCk7XG4gIH1cbn0pO1xuXG5jb25zdCBydHNwT3BlbmRlcnMgPSB7fTtcbmxldCBhZGRQb3J0ID0gOTAwMDtcblxuLy8gXHU4QkJFXHU3RjZFaXBjTWFpblx1NzY4NFx1NzZEMVx1NTQyQ1x1NTY2OFx1NTkwNFx1NzQwNlx1NTQwQ1x1NkI2NVx1NkQ4OFx1NjA2RlxuaXBjTWFpbi5vbihcIm9wZW5SdHNwXCIsIChldmVudCwgcnRzcCwgaXNIaWdoUXVhbGl0eSA9IGZhbHNlKSA9PiB7XG4gIC8qKiBcdTUyMjRcdTY1QURcdTY2MkZcdTU0MjZcdTVERjJcdTVGMDBcdTU0MkYsXHU4MkU1XHU1REYyXHU1RjAwXHU1NDJGLFx1NzZGNFx1NjNBNVx1OEZENFx1NTZERXdzXHU1NzMwXHU1NzQwLCBcdTY3MkFcdTVGMDBcdTU0MkZcdTUyMTlcdTUxNDhcdTVGMDBcdTU0MkZcdTUxOERcdThGRDRcdTU2REUgKi9cbiAgY29uc29sZS5sb2coXCJvcGVuUnRzcFwiLCBydHNwKTtcbiAgaWYgKHJ0c3BPcGVuZGVyc1tydHNwXSkge1xuICAgIGV2ZW50LnJldHVyblZhbHVlID0ge1xuICAgICAgY29kZTogMjAwLFxuICAgICAgbXNnOiBcIlx1NUYwMFx1NTQyRlx1NjIxMFx1NTI5RlwiLFxuICAgICAgd3M6IHJ0c3BPcGVuZGVyc1tydHNwXS53cyxcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIGFkZFBvcnQrKztcbiAgICBjb25zdCBzdHJlYW0gPSBuZXcgU3RyZWFtKHtcbiAgICAgIG5hbWU6IGBzb2NrZXQtJHthZGRQb3J0fWAsXG4gICAgICBzdHJlYW1Vcmw6IHJ0c3AsXG4gICAgICB3c1BvcnQ6IGFkZFBvcnQsXG4gICAgICAvLyBmZm1wZWdQYXRoOiBjb25maWcuZmZtcGVnUGF0aCxcbiAgICAgIGZmbXBlZ09wdGlvbnM6IHtcbiAgICAgICAgXCItc3RhdHNcIjogXCJcIixcbiAgICAgICAgXCItclwiOiAyMCxcbiAgICAgICAgXCItc1wiOiBcIjMyMHgyNDBcIixcbiAgICAgICAgXCItcHJlc2V0XCI6IFwidWx0cmFmYXN0XCIsXG4gICAgICAgIFwiLXR1bmVcIjogXCJ6ZXJvbGF0ZW5jeVwiLFxuICAgICAgICBcIi1sb2dsZXZlbFwiOiBcInF1aWV0XCIsICAvLyBcdTRFMERcdTY2M0VcdTc5M0FmZm1wZWdcdTc2ODRcdTY1RTVcdTVGRDdcdTRGRTFcdTYwNkZcbiAgICAgICAgXCItbm9zdGF0c1wiOiBcIlwiLCAgLy8gXHU0RTBEXHU2NjNFXHU3OTNBZmZtcGVnXHU3Njg0XHU3RURGXHU4QkExXHU0RkUxXHU2MDZGXG4gICAgICB9LFxuICAgIH0pLm9uKFwiZXhpdFdpdGhFcnJvclwiLCAoKSA9PiB7XG4gICAgICBzdHJlYW0uc3RvcCgpO1xuICAgICAgZGVsZXRlIHJ0c3BPcGVuZGVyc1tydHNwXTtcbiAgICAgIGV2ZW50LnJldHVyblZhbHVlID0ge1xuICAgICAgICBjb2RlOiA0MDAsXG4gICAgICAgIG1zZzogXCJcdTVGMDBcdTU0MkZcdTU5MzFcdThEMjVcIixcbiAgICAgIH07XG4gICAgfSk7XG4gICAgcnRzcE9wZW5kZXJzW3J0c3BdID0ge1xuICAgICAgd3M6IGB3czovL2xvY2FsaG9zdDoke2FkZFBvcnR9YCxcbiAgICAgIHN0cmVhbTogc3RyZWFtLFxuICAgIH07XG4gICAgZXZlbnQucmV0dXJuVmFsdWUgPSB7XG4gICAgICBjb2RlOiAyMDAsXG4gICAgICBtc2c6IFwiXHU1RjAwXHU1NDJGXHU2MjEwXHU1MjlGXCIsXG4gICAgICB3czogcnRzcE9wZW5kZXJzW3J0c3BdLndzLFxuICAgIH07XG4gIH1cbn0pO1xuXG5pcGNNYWluLm9uKFwic3RvcFJ0c3BcIiwgKGV2ZW50LCBydHNwKSA9PiB7XG4gIGlmIChydHNwT3BlbmRlcnNbcnRzcF0pIHtcbiAgICBydHNwT3BlbmRlcnNbcnRzcF0uc3RyZWFtLnN0b3AoKTtcbiAgICBkZWxldGUgcnRzcE9wZW5kZXJzW3J0c3BdO1xuICB9XG59KTtcblxuLy8gXHU1MjFCXHU1RUZBXHU0RTAwXHU0RTJBIE1RVFQgXHU1QkEyXHU2MjM3XHU3QUVGXG5jb25zdCBjbGllbnQgPSBtcXR0LmNvbm5lY3QoXCJtcXR0Oi8vMTAuMTAuMC4xOTU6MTg4M1wiKTtcblxuLy8gXHU1QjU4XHU1MEE4XHU4QkEyXHU5NjA1XHU3Njg0XHU0RTNCXHU5ODk4XHU1NDhDXHU1QjgzXHU0RUVDXHU3Njg0XHU1NkRFXHU4QzAzXHU1MUZEXHU2NTcwXG5jb25zdCB0b3BpY3MgPSBuZXcgTWFwKCk7XG5cbi8vIFx1NUY1MyBNUVRUIFx1NUJBMlx1NjIzN1x1N0FFRlx1OEZERVx1NjNBNVx1NTIzMFx1NjcwRFx1NTJBMVx1NTY2OFx1NjVGNlxuY2xpZW50Lm9uKFwiY29ubmVjdFwiLCAoKSA9PiB7XG4gIGNvbnNvbGUubG9nKFwiQ29ubmVjdGVkIHRvIE1RVFQgYnJva2VyLlwiKTtcblxuICAvLyBcdThCRkJcdTUzRDZcdTkxNERcdTdGNkVcdTY1ODdcdTRFRjZcbiAgY29uc3QgY29uZmlnID0gSlNPTi5wYXJzZShcbiAgICBmcy5yZWFkRmlsZVN5bmMocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJtcXR0LWNvbmZpZy5qc29uXCIpLCBcInV0Zi04XCIpXG4gICk7XG5cbiAgLy8gXHU2ODM5XHU2MzZFXHU5MTREXHU3RjZFXHU2NTg3XHU0RUY2XHU4QkJFXHU3RjZFIE1RVFQgXHU1QkEyXHU2MjM3XHU3QUVGXG4gIGZvciAoY29uc3QgaXRlbSBvZiBjb25maWcpIHtcbiAgICBpZiAoaXRlbS50eXBlID09PSBcInB1Ymxpc2hcIikge1xuICAgICAgLy8gXHU1OTgyXHU2NzlDXHU2NjJGXHU1M0QxXHU1RTAzXHU0RTNCXHU5ODk4XHVGRjBDXHU1MjFCXHU1RUZBXHU0RTAwXHU0RTJBXHU1M0QxXHU1RTAzXHU1NjY4XG4gICAgICB0b3BpY3Muc2V0KGl0ZW0udG9waWMsIFtcbiAgICAgICAgKG1lc3NhZ2UpID0+IGNsaWVudC5wdWJsaXNoKGl0ZW0udG9waWMsIG1lc3NhZ2UpLFxuICAgICAgXSk7XG4gICAgfSBlbHNlIGlmIChpdGVtLnR5cGUgPT09IFwic3Vic2NyaWJlXCIpIHtcbiAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NjYyRlx1OEJBMlx1OTYwNVx1NEUzQlx1OTg5OFx1RkYwQ1x1OEJBMlx1OTYwNVx1NEUzQlx1OTg5OFx1NUU3Nlx1NUI1OFx1NTBBOFx1NTZERVx1OEMwM1x1NTFGRFx1NjU3MFxuICAgICAgY2xpZW50LnN1YnNjcmliZShpdGVtLnRvcGljKTtcbiAgICAgIHRvcGljcy5zZXQoaXRlbS50b3BpYywgW10pO1xuICAgIH1cbiAgfVxufSk7XG5cbi8vIFx1NTIxQlx1NUVGQVx1NEUwMFx1NEUyQVx1NUI1OFx1NTBBOFx1OEJBMlx1OTYwNVx1ODAwNVx1NzY4NFx1N0VEM1x1Njc4NFxuY29uc3Qgc3Vic2NyaWJlcnMgPSB7fTtcblxuaXBjTWFpbi5vbihcInN1YnNjcmliZVwiLCAoZXZlbnQsIHRvcGljKSA9PiB7XG4gIGNvbnN0IHdpbklkID0gZXZlbnQuc2VuZGVyLmlkO1xuICBpZiAoIXN1YnNjcmliZXJzW3RvcGljXSkge1xuICAgIHN1YnNjcmliZXJzW3RvcGljXSA9IG5ldyBTZXQoKTtcbiAgICBjbGllbnQuc3Vic2NyaWJlKHRvcGljKTsgLy8gXHU3ODZFXHU0RkREXHU0RTNCXHU5ODk4XHU4OEFCXHU4QkEyXHU5NjA1XG4gIH1cbiAgc3Vic2NyaWJlcnNbdG9waWNdLmFkZCh3aW5JZCk7XG59KTtcblxuaXBjTWFpbi5vbihcInVuc3Vic2NyaWJlXCIsIChldmVudCwgdG9waWMpID0+IHtcbiAgY29uc3Qgd2luSWQgPSBldmVudC5zZW5kZXIuaWQ7XG4gIGlmIChzdWJzY3JpYmVyc1t0b3BpY10pIHtcbiAgICBzdWJzY3JpYmVyc1t0b3BpY10uZGVsZXRlKHdpbklkKTtcbiAgICBpZiAoc3Vic2NyaWJlcnNbdG9waWNdLnNpemUgPT09IDApIHtcbiAgICAgIGRlbGV0ZSBzdWJzY3JpYmVyc1t0b3BpY107XG4gICAgICBjbGllbnQudW5zdWJzY3JpYmUodG9waWMpOyAvLyBcdTU5ODJcdTY3OUNcdTZDQTFcdTY3MDlcdThCQTJcdTk2MDVcdTgwMDVcdUZGMENcdTUzRDZcdTZEODhcdThCQTJcdTk2MDVcbiAgICB9XG4gIH1cbn0pO1xuXG4vLyBcdTVGNTMgTVFUVCBcdTVCQTJcdTYyMzdcdTdBRUZcdTY1MzZcdTUyMzBcdTZEODhcdTYwNkZcdTY1RjZcbmNsaWVudC5vbihcIm1lc3NhZ2VcIiwgKHRvcGljLCBtZXNzYWdlKSA9PiB7XG4gIGlmIChzdWJzY3JpYmVyc1t0b3BpY10pIHtcbiAgICBzdWJzY3JpYmVyc1t0b3BpY10uZm9yRWFjaCgod2luSWQpID0+IHtcbiAgICAgIGNvbnN0IHdpbiA9IEJyb3dzZXJXaW5kb3cuZnJvbUlkKHdpbklkKTtcbiAgICAgIGlmICh3aW4pIHtcbiAgICAgICAgd2luLndlYkNvbnRlbnRzLnNlbmQoXCJtZXNzYWdlXCIsIHRvcGljLCBtZXNzYWdlLnRvU3RyaW5nKCkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59KTtcblxuLy8gXHU1RjUzIE1RVFQgXHU1QkEyXHU2MjM3XHU3QUVGXHU2NUFEXHU1RjAwXHU4RkRFXHU2M0E1XHU2NUY2XG5jbGllbnQub24oXCJvZmZsaW5lXCIsICgpID0+IHtcbiAgY29uc29sZS5sb2coXCJEaXNjb25uZWN0ZWQgZnJvbSBNUVRUIGJyb2tlci5cIik7XG59KTtcblxuLy8gXHU1RjUzIE1RVFQgXHU1QkEyXHU2MjM3XHU3QUVGXHU1QzFEXHU4QkQ1XHU5MUNEXHU2NUIwXHU4RkRFXHU2M0E1XHU2NUY2XG5jbGllbnQub24oXCJyZWNvbm5lY3RcIiwgKCkgPT4ge1xuICBjb25zb2xlLmxvZyhcIlJlY29ubmVjdGluZyB0byBNUVRUIGJyb2tlci4uLlwiKTtcblxuICAvLyBcdTkxQ0RcdTY1QjBcdThCQTJcdTk2MDVcdTYyNDBcdTY3MDlcdTRFM0JcdTk4OThcbiAgZm9yIChjb25zdCBbdG9waWMsIGNhbGxiYWNrXSBvZiB0b3BpY3MuZW50cmllcygpKSB7XG4gICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBjbGllbnQuc3Vic2NyaWJlKHRvcGljKTtcbiAgICB9XG4gIH1cbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxzQkFNTztBQUNQLGtCQUFpQjtBQUNqQixnQkFBZTtBQUVmLDhCQUFtQjtBQUNuQixrQkFBNkI7QUFDN0IsSUFBQUEsbUJBQXdCO0FBQ3hCLGtCQUFpQjtBQUNqQixnQkFBZTtBQUdmLElBQU0sU0FBUyxLQUFLO0FBQUEsRUFDbEIsVUFBQUMsUUFBRyxhQUFhLFlBQUFDLFFBQUssUUFBUSxXQUFXLGFBQWEsR0FBRyxNQUFNO0FBQ2hFO0FBR0EsSUFBTSxXQUFXLFFBQVEsWUFBWSxVQUFBQyxRQUFHLFNBQVM7QUFFakQsSUFBSTtBQUVKLFNBQVMsZUFBZTtBQUl0QixlQUFhLElBQUksOEJBQWM7QUFBQSxJQUM3QixNQUFNLFlBQUFELFFBQUssUUFBUSxXQUFXLGdCQUFnQjtBQUFBLElBQzlDLE9BQU87QUFBQSxJQUNQLFFBQVE7QUFBQSxJQUNSLFlBQVk7QUFBQSxJQUNaLGdCQUFnQjtBQUFBLElBQ2hCLGdCQUFnQjtBQUFBLE1BQ2Qsa0JBQWtCO0FBQUEsTUFFbEIsU0FBUyxZQUFBQSxRQUFLLFFBQVEsV0FBVywyRUFBbUM7QUFBQSxJQUN0RTtBQUFBLEVBQ0YsQ0FBQztBQUVELGFBQVcsUUFBUSx1QkFBbUI7QUFFdEMsTUFBSSxNQUF1QjtBQUV6QixlQUFXLFlBQVksYUFBYTtBQUFBLEVBQ3RDLE9BQU87QUFFTCxlQUFXLFlBQVksR0FBRyxtQkFBbUIsTUFBTTtBQUNqRCxp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QixXQUFPLFVBQVUsS0FBSztBQUFBLEVBQ3hCO0FBQ0EsY0FBWSxPQUFPLElBQUksS0FBSztBQUM5QixDQUFDO0FBRUQseUJBQVEsR0FBRyxlQUFlLENBQUMsT0FBTyxVQUFVO0FBQzFDLFFBQU0sUUFBUSxNQUFNLE9BQU87QUFDM0IsTUFBSSxZQUFZLFFBQVE7QUFDdEIsZ0JBQVksT0FBTyxPQUFPLEtBQUs7QUFDL0IsUUFBSSxZQUFZLE9BQU8sU0FBUyxHQUFHO0FBQ2pDLGFBQU8sWUFBWTtBQUNuQixhQUFPLFlBQVksS0FBSztBQUFBLElBQzFCO0FBQUEsRUFDRjtBQUNGLENBQUM7QUFHRCxPQUFPLEdBQUcsV0FBVyxDQUFDLE9BQU8sWUFBWTtBQUN2QyxNQUFJLFlBQVksUUFBUTtBQUN0QixnQkFBWSxPQUFPLFFBQVEsQ0FBQyxVQUFVO0FBQ3BDLFlBQU0sTUFBTSw4QkFBYyxPQUFPLEtBQUs7QUFDdEMsVUFBSSxLQUFLO0FBQ1AsWUFBSSxZQUFZLEtBQUssV0FBVyxPQUFPLFFBQVEsU0FBUyxDQUFDO0FBQUEsTUFDM0Q7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQ0YsQ0FBQztBQUdELE9BQU8sR0FBRyxXQUFXLE1BQU07QUFDekIsVUFBUSxJQUFJLGdDQUFnQztBQUM5QyxDQUFDO0FBR0QsT0FBTyxHQUFHLGFBQWEsTUFBTTtBQUMzQixVQUFRLElBQUksZ0NBQWdDO0FBRzVDLGFBQVcsQ0FBQyxPQUFPLFFBQVEsS0FBSyxPQUFPLFFBQVEsR0FBRztBQUNoRCxRQUFJLE9BQU8sYUFBYSxZQUFZO0FBQ2xDLGFBQU8sVUFBVSxLQUFLO0FBQUEsSUFDeEI7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFsiaW1wb3J0X2VsZWN0cm9uIiwgImZzIiwgInBhdGgiLCAib3MiLCAiU3RyZWFtIiwgIm1xdHQiLCAiY29uZmlnIl0KfQo=
