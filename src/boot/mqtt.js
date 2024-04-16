// import mqtt from 'mqtt'

// class MQTTService {
//   constructor() {
//     this.mqttClient = null;
//     this.host = 'wss://10.10.0.195:1883';  // 使用你的MQTT代理地址和端口
//     this.username = 'yourUsername';  // 你的MQTT用户名，如果有的话
//     this.password = 'yourPassword';  // 你的MQTT密码，如果有的话
//   }

//   connect() {
//     // 配置MQTT客户端选项
//     const options = {
//       connectTimeout: 4000,
//       clientId: 'quasar_' + Math.random().toString(16).substr(2, 8),
//       keepalive: 60,
//       clean: true,
//       username: this.username,
//       password: this.password,
//     }

//     // 连接到MQTT代理
//     this.mqttClient = mqtt.connect(this.host, options);

//     this.mqttClient.on('connect', () => {
//       console.log('Connected to MQTT Broker!');
//     });

//     this.mqttClient.on('error', (err) => {
//       console.log('Connection error: ', err);
//       this.mqttClient.end();
//     });

//     this.mqttClient.on('reconnect', () => {
//       console.log('Reconnecting...');
//     });

//     this.mqttClient.on('message', (topic, message) => {
//       console.log(`Received message: '${message.toString()}' from topic: '${topic}'`);
//     });
//   }

//   // 订阅主题的方法
//   subscribe(topic) {
//     this.mqttClient.subscribe(topic, { qos: 0 }, (error) => {
//       if (!error) {
//         console.log(`Subscribed to topic '${topic}'`);
//       } else {
//         console.log(`Subscribe error: ${error}`);
//       }
//     });
//   }

//   // 发布消息到主题的方法
//   publish(topic, message) {
//     this.mqttClient.publish(topic, message, { qos: 0, retain: false }, (error) => {
//       if (error) {
//         console.log(`Publish error: ${error}`);
//       }
//     });
//   }
// }

// // 导出MQTTService实例
// export default new MQTTService();


// 引入mqtt库
const mqtt = require('mqtt')

// MQTT服务器URL（根据实际情况进行修改）
const host = '10.10.0.195'
const port = '1883'
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 9010 }); // WebSocket服务器端口号

// 连接选项
const connectOptions = {
  host,
  port,
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: 'your_username', // 可能需要根据你的MQTT服务器配置来设置
  password: 'your_password',  // 可能需要根据你的MQTT服务器配置来设置
  reconnectPeriod: 1000,
}

// 创建MQTT客户端
const client = mqtt.connect(connectOptions)

// 定义你想要订阅的话题
const topic = '/cmd_status'

// 注册连接成功事件处理器
client.on('connect', () => {
  console.log('Connected to MQTT Broker')

  // 订阅话题
  client.subscribe([topic], () => {
    console.log(`Subscribed to topic '${topic}'`)
  })
})

// 注册接收消息事件处理器
client.on('message', (topic, payload) => {
  // 当收到消息时，打印出来
  // console.log('Received Message:', topic, payload.toString())
  // 当MQTT客户端接收消息时，通过WebSocket发送给所有连接的客户端
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload.toString());
    }
  });
})

// 注册错误处理器
client.on('error', (err) => {
  console.error('Connection to MQTT broker failed:', err)
})
