// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("mainApi", {
  sendSync: (channel, data) => {
    return ipcRenderer.sendSync(channel, data);
  },
  sendAsync: (channel, data) => {
    return ipcRenderer.invoke(channel, data);
  },
  receive: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
  subscribe: (topic) => {
    ipcRenderer.send("subscribe", topic); // 前端请求订阅主题
  },
  unsubscribe: (topic) => {
    ipcRenderer.send("unsubscribe", topic); // 前端请求取消订阅
  },
  sendMessage: (topic, message) => {
    ipcRenderer.send("sendMessage", topic, message); // 前端发送消息
  },
  onMessage: (func) => {
    // 从主进程接收消息
    ipcRenderer.on("message", (event, topic, message) => {
      func(topic, message);
    });
  },
});
