// import {
//   app,
//   BrowserWindow,
//   contextBridge,
//   ipcRenderer,
//   shell,
// } from "electron";
// import path from "path";
// import os from "os";
// // 在文件顶部导入模块
// import Stream from "node-rtsp-stream";
// import { v4 as uuidv4 } from "uuid";
// import { ipcMain } from "electron";
// import mqtt from "mqtt";
// import fs from "fs";

// // 读取配置文件，config.json
// const config = JSON.parse(
//   fs.readFileSync(path.resolve(__dirname, "config.json"), "utf8")
// );

// // needed in case process is undefined under Linux
// const platform = process.platform || os.platform();

// let mainWindow;

// function createWindow() {
//   /**
//    * Initial window options
//    */
//   mainWindow = new BrowserWindow({
//     icon: path.resolve(__dirname, "icons/icon.png"), // tray icon
//     width: 1000,
//     height: 600,
//     fullscreen: false, // 添加此行代码
//     useContentSize: true,
//     webPreferences: {
//       contextIsolation: true,
//       // More info: https://v2.quasar.dev/quasar-cli-webpack/developing-electron-apps/electron-preload-script
//       preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
//     },
//   });

//   mainWindow.loadURL(process.env.APP_URL);

//   if (process.env.DEBUGGING) {
//     // if on DEV or Production with debug enabled
//     mainWindow.webContents.openDevTools();
//   } else {
//     // we're on production; no access to devtools pls
//     mainWindow.webContents.on("devtools-opened", () => {
//       mainWindow.webContents.closeDevTools();
//     });
//   }

//   mainWindow.on("closed", () => {
//     mainWindow = null;
//   });
// }

// app.whenReady().then(createWindow);

// app.on("window-all-closed", () => {
//   if (platform !== "darwin") {
//     app.quit();
//   }
// });

// app.on("activate", () => {
//   if (mainWindow === null) {
//     console.log("mainWindow is null");
//     createWindow();
//   }
// });

// const rtspOpenders = {};
// let addPort = 9000;

// // 设置ipcMain的监听器处理同步消息
// ipcMain.on("openRtsp", (event, rtsp, isHighQuality = false) => {
//   /** 判断是否已开启,若已开启,直接返回ws地址, 未开启则先开启再返回 */
//   console.log("openRtsp", rtsp);
//   if (rtspOpenders[rtsp]) {
//     event.returnValue = {
//       code: 200,
//       msg: "开启成功",
//       ws: rtspOpenders[rtsp].ws,
//     };
//   } else {
//     addPort++;
//     const stream = new Stream({
//       name: `socket-${addPort}`,
//       streamUrl: rtsp,
//       wsPort: addPort,
//       // ffmpegPath: config.ffmpegPath,
//       ffmpegOptions: {
//         "-stats": "",
//         "-r": 20,
//         "-s": "320x240",
//         "-preset": "ultrafast",
//         "-tune": "zerolatency",
//         "-loglevel": "quiet",  // 不显示ffmpeg的日志信息
//         "-nostats": "",  // 不显示ffmpeg的统计信息
//       },
//     }).on("exitWithError", () => {
//       stream.stop();
//       delete rtspOpenders[rtsp];
//       event.returnValue = {
//         code: 400,
//         msg: "开启失败",
//       };
//     });
//     rtspOpenders[rtsp] = {
//       ws: `ws://localhost:${addPort}`,
//       stream: stream,
//     };
//     event.returnValue = {
//       code: 200,
//       msg: "开启成功",
//       ws: rtspOpenders[rtsp].ws,
//     };
//   }
// });

// ipcMain.on("stopRtsp", (event, rtsp) => {
//   if (rtspOpenders[rtsp]) {
//     rtspOpenders[rtsp].stream.stop();
//     delete rtspOpenders[rtsp];
//   }
// });

// // 创建一个 MQTT 客户端
// const client = mqtt.connect("mqtt://10.10.0.195:1883");
// // const client = mqtt.connect("mqtt://10.10.6.243:1883");

// // 存储订阅的主题和它们的回调函数
// const topics = new Map();

// // 当 MQTT 客户端连接到服务器时
// client.on("connect", () => {
//   console.log("Connected to MQTT broker.");

//   // 读取配置文件
//   const config = JSON.parse(
//     fs.readFileSync(path.resolve(__dirname, "mqtt-config.json"), "utf-8")
//   );

//   // 根据配置文件设置 MQTT 客户端
//   for (const item of config) {
//     if (item.type === "publish") {
//       // 如果是发布主题，创建一个发布器
//       topics.set(item.topic, [
//         (message) => client.publish(item.topic, message),
//       ]);
//     } else if (item.type === "subscribe") {
//       // 如果是订阅主题，订阅主题并存储回调函数
//       client.subscribe(item.topic);
//       topics.set(item.topic, []);
//     }
//   }
// });

// // 创建一个存储订阅者的结构
// const subscribers = {};

// ipcMain.on("subscribe", (event, topic) => {
//   const winId = event.sender.id;
//   if (!subscribers[topic]) {
//     subscribers[topic] = new Set();
//     client.subscribe(topic); // 确保主题被订阅
//   }
//   subscribers[topic].add(winId);
// });

// ipcMain.on("unsubscribe", (event, topic) => {
//   const winId = event.sender.id;
//   if (subscribers[topic]) {
//     subscribers[topic].delete(winId);
//     if (subscribers[topic].size === 0) {
//       delete subscribers[topic];
//       client.unsubscribe(topic); // 如果没有订阅者，取消订阅
//     }
//   }
// });

// // 当 MQTT 客户端收到消息时
// client.on("message", (topic, message) => {
//   if (subscribers[topic]) {
//     subscribers[topic].forEach((winId) => {
//       const win = BrowserWindow.fromId(winId);
//       if (win) {
//         win.webContents.send("message", topic, message.toString());
//       }
//     });
//   }
// });

// // 当 MQTT 客户端断开连接时
// client.on("offline", () => {
//   console.log("Disconnected from MQTT broker.");
// });

// // 当 MQTT 客户端尝试重新连接时
// client.on("reconnect", () => {
//   console.log("Reconnecting to MQTT broker...");

//   // 重新订阅所有主题
//   for (const [topic, callback] of topics.entries()) {
//     if (typeof callback !== "function") {
//       client.subscribe(topic);
//     }
//   }
// });

// import {
//   app,
//   BrowserWindow,
//   ipcMain
// } from "electron";
// import path from "path";
// import os from "os";
// import Stream from "node-rtsp-stream";
// import mqtt from "mqtt";
// import fs from "fs";

// const config = JSON.parse(
//   fs.readFileSync(path.resolve(__dirname, "config.json"), "utf8")
// );

// const platform = process.platform || os.platform();

// let mainWindow;

// function createWindow() {
//   mainWindow = new BrowserWindow({
//     icon: path.resolve(__dirname, "icons/icon.png"),
//     width: 1000,
//     height: 600,
//     fullscreen: false,
//     useContentSize: true,
//     webPreferences: {
//       contextIsolation: true,
//       preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
//     },
//   });

//   mainWindow.loadURL(process.env.APP_URL);

//   if (process.env.DEBUGGING) {
//     mainWindow.webContents.openDevTools();
//   } else {
//     mainWindow.webContents.on("devtools-opened", () => {
//       mainWindow.webContents.closeDevTools();
//     });
//   }

//   mainWindow.on("closed", () => {
//     mainWindow = null;
//   });
// }

// app.whenReady().then(createWindow);

// app.on("window-all-closed", () => {
//   if (platform !== "darwin") {
//     app.quit();
//   }
// });

// app.on("activate", () => {
//   if (mainWindow === null) {
//     console.log("mainWindow is null");
//     createWindow();
//   }
// });

// const rtspOpenders = {};
// let addPort = 9000;

// ipcMain.on("openRtsp", (event, rtsp) => {
//   if (rtspOpenders[rtsp]) {
//     event.returnValue = {
//       code: 200,
//       msg: "开启成功",
//       ws: rtspOpenders[rtsp].ws,
//     };
//   } else {
//     addPort++;
//     const stream = new Stream({
//       name: `socket-${addPort}`,
//       streamUrl: rtsp,
//       wsPort: addPort,
//       ffmpegOptions: {
//         "-stats": "",
//         "-r": 20,
//         "-s": "320x240",
//         "-preset": "ultrafast",
//         "-tune": "zerolatency",
//         "-loglevel": "quiet",
//         "-nostats": "",
//       },
//     }).on("exitWithError", () => {
//       stream.stop();
//       delete rtspOpenders[rtsp];
//       event.returnValue = {
//         code: 400,
//         msg: "开启失败",
//       };
//     });
//     rtspOpenders[rtsp] = {
//       ws: `ws://localhost:${addPort}`,
//       stream: stream,
//     };
//     event.returnValue = {
//       code: 200,
//       msg: "开启成功",
//       ws: rtspOpenders[rtsp].ws,
//     };
//   }
// });

// ipcMain.on("stopRtsp", (event, rtsp) => {
//   if (rtspOpenders[rtsp]) {
//     rtspOpenders[rtsp].stream.stop();
//     delete rtspOpenders[rtsp];
//   }
// });

// // 存储多个MQTT客户端实例和相关信息
// const mqttClients = [];

// // 初始化MQTT客户端
// const initMqttClients = () => {
//   const brokers = ["mqtt://10.10.0.195:1883", "mqtt://10.10.3.16:1883"];

//   for (const broker of brokers) {
//     const client = mqtt.connect(broker);
//     mqttClients.push({
//       client,
//       subscribers: new Map(),
//     });

//     client.on("connect", () => {
//       console.log(`Connected to MQTT broker at ${broker}`);
//       // 订阅所有主题
//       for (const { topic } of JSON.parse(fs.readFileSync(path.resolve(__dirname, "mqtt-config.json"), "utf-8"))) {
//         client.subscribe(topic);
//       }
//     });

//     client.on("message", (topic, message) => {
//       mqttClients.forEach(({ subscribers }) => {
//         if (subscribers.has(topic)) {
//           const wins = subscribers.get(topic);
//           wins.forEach(winId => {
//             const win = BrowserWindow.fromId(winId);
//             if (win) {
//               win.webContents.send("message", topic, message.toString());
//             }
//           });
//         }
//       });
//     });

//     client.on("offline", () => {
//       console.log(`Disconnected from MQTT broker at ${broker}`);
//     });

//     client.on("reconnect", () => {
//       console.log(`Reconnecting to MQTT broker at ${broker}...`);
//       // 重新订阅所有主题
//       for (const { topic } of JSON.parse(fs.readFileSync(path.resolve(__dirname, "mqtt-config.json"), "utf-8"))) {
//         client.subscribe(topic);
//       }
//     });
//   }
// };

// initMqttClients();

// ipcMain.on("subscribe", (event, topic) => {
//   const winId = event.sender.id;
//   mqttClients.forEach(({ client, subscribers }) => {
//     if (!subscribers.has(topic)) {
//       subscribers.set(topic, new Set());
//       client.subscribe(topic); // 确保每个客户端都订阅
//     }
//     subscribers.get(topic).add(winId);
//   });
// });

// ipcMain.on("unsubscribe", (event, topic) => {
//   const winId = event.sender.id;
//   mqttClients.forEach(({ client, subscribers }) => {
//     if (subscribers.has(topic)) {
//       const wins = subscribers.get(topic);
//       wins.delete(winId);
//       if (wins.size === 0) {
//         subscribers.delete(topic);
//         client.unsubscribe(topic); // 如果没有订阅者，取消订阅
//       }
//     }
//   });
// });

import {
  app,
  BrowserWindow,
  ipcMain
} from "electron";
import path from "path";
import os from "os";
import Stream from "node-rtsp-stream";
import mqtt from "mqtt";
import fs from "fs";

// const config = JSON.parse(
//   fs.readFileSync(path.resolve(__dirname, "config.json"), "utf8")
// );

const platform = process.platform || os.platform();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, "icons/icon.png"),
    width: 1000,
    height: 600,
    fullscreen: false,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
    },
  });

  mainWindow.loadURL(process.env.APP_URL);

  if (process.env.DEBUGGING) {
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

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    console.log("mainWindow is null");
    createWindow();
  }
});

const rtspOpenders = {};
let addPort = 9000;

ipcMain.on("openRtsp", (event, rtsp) => {
  if (rtspOpenders[rtsp]) {
    event.returnValue = {
      code: 200,
      msg: "开启成功",
      ws: rtspOpenders[rtsp].ws,
    };
  } else {
    addPort++;
    const stream = new Stream({
      name: `socket-${addPort}`,
      streamUrl: rtsp,
      wsPort: addPort,
      ffmpegOptions: {
        "-stats": "",
        "-r": 20,
        "-s": "640x480",
        "-preset": "ultrafast",
        "-tune": "zerolatency",
        "-loglevel": "quiet",
        "-nostats": "",
      },
    }).on("exitWithError", () => {
      stream.stop();
      delete rtspOpenders[rtsp];
      event.returnValue = {
        code: 400,
        msg: "开启失败",
      };
    });
    rtspOpenders[rtsp] = {
      ws: `ws://localhost:${addPort}`,
      stream: stream,
    };
    event.returnValue = {
      code: 200,
      msg: "开启成功",
      ws: rtspOpenders[rtsp].ws,
    };
  }
});

ipcMain.on("stopRtsp", (event, rtsp) => {
  if (rtspOpenders[rtsp]) {
    rtspOpenders[rtsp].stream.stop();
    delete rtspOpenders[rtsp];
  }
});

// 存储多个MQTT客户端实例和相关信息
const mqttClients = [];
const globalSubscribers = new Map();

// 初始化MQTT客户端
const initMqttClients = () => {
  const brokers = ["mqtt://10.10.0.195:1883", "mqtt://10.10.3.16:1883"];

  for (const broker of brokers) {
    const client = mqtt.connect(broker);
    mqttClients.push(client);

    client.on("connect", () => {
      console.log(`Connected to MQTT broker at ${broker}`);
      // 订阅全局所有主题
      globalSubscribers.forEach((_, topic) => {
        client.subscribe(topic);
      });
    });

    client.on("message", (topic, message) => {
      if (!message) return; // 确保消息有效
      const subscribers = globalSubscribers.get(topic);
      if (subscribers) {
        subscribers.forEach(winId => {
          const win = BrowserWindow.fromId(winId);
          if (win) {
            win.webContents.send("message", topic, message.toString());
          }
        });
      }
    });

    client.on("offline", () => {
      console.log(`Disconnected from MQTT broker at ${broker}`);
    });

    client.on("reconnect", () => {
      console.log(`Reconnecting to MQTT broker at ${broker}...`);
      // 重新订阅所有主题
      globalSubscribers.forEach((_, topic) => {
        client.subscribe(topic);
      });
    });
  }
};

initMqttClients();

ipcMain.on("subscribe", (event, topic) => {
  const winId = event.sender.id;
  if (!globalSubscribers.has(topic)) {
    globalSubscribers.set(topic, new Set());
    mqttClients.forEach(client => client.subscribe(topic));
  }
  globalSubscribers.get(topic).add(winId);
});

ipcMain.on("unsubscribe", (event, topic) => {
  const winId = event.sender.id;
  if (globalSubscribers.has(topic)) {
    const subscribers = globalSubscribers.get(topic);
    subscribers.delete(winId);
    if (subscribers.size === 0) {
      globalSubscribers.delete(topic);
      mqttClients.forEach(client => client.unsubscribe(topic));
    }
  }
});
