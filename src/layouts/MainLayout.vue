<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title> Dxr APP Test Version </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <div style="margin-top: 100px">速度</div>
    <div>v: {{ app_cmd_vel_msg.v }}</div>
    <div>w: {{ app_cmd_vel_msg.w }}</div>

    <q-page-container>
      <div class="row">
        <canvas
          id="video-canvas1"
          width="400"
          height="200"
          style="width: 1200px; height: 600px"
        ></canvas>
        <canvas
          id="overlay-canvas"
          width="400"
          height="200"
          style="
            position: absolute;
            top: 0;
            left: 0;
            width: 1200px;
            height: 600px;
            pointer-events: none;
          "
        ></canvas>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import JSMpeg from "jsmpeg-player";
import { useWebSocketSubscriptions } from "src/composables/useWebSocketSubscriptions";
const { subscribe, unsubscribe } = useWebSocketSubscriptions();

const app_cmd_vel_msg = ref({
  v: 0,
  w: 0,
});

onMounted(() => {
  // 初始化rtsp，通知后端，让后端进行rtsp拉流，并且转成websocket
  const res = window.mainApi.sendSync(
    "openRtsp",
    "rtsp://admin:Asb11023@10.20.0.122:554/Streaming/Channels/101"
  );
  if (res.code !== 200) {
    console.error(res.msg);
    // 前端直接弹框
    alert(res.msg);
    return;
  }
  const wsUrl = res.ws;
  try {
    const player = new JSMpeg.Player(wsUrl, {
      canvas: document.getElementById("video-canvas1"),
    });
    // 在这设定周期性调用绘制函数；这里的100是示例间隔毫秒数，您可以根据需要微调
    const overlayCanvas = document.getElementById("overlay-canvas");
    overlayCanvas.width = overlayCanvas.offsetWidth;
    overlayCanvas.height = overlayCanvas.offsetHeight;
    setInterval(() => {
      // 清除之前的绘制内容
      overlayCanvas
        .getContext("2d")
        .clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      // 画框和文字
      drawRectangleOnCanvas(overlayCanvas, 950, 100, 200, 100);
    }, 100);
  } catch (error) {
    console.error("Error playing video:", error);
  }
  subscribe("/app_cmd_vel", (message) => {
    // 这里处理/app_cmd_vel话题的消息
    console.log("Received /app_cmd_vel message:", message);
    let msg_obj = JSON.parse(JSON.parse(message));
    console.log("MSG Content:", msg_obj["msg"]);
    app_cmd_vel_msg.value = {
      v: msg_obj.msg?.v ?? 0, // 如果v不存在，使用默认值0
      w: msg_obj.msg?.w ?? 0, // 如果w不存在，使用默认值0
    };
  });
  subscribe("/cmd_status", (message) => {
    // 这里处理/app_cmd_vel话题的消息
    console.log("Received /app_cmd_vel message:", message);
  });
});
onUnmounted(() => {
  unsubscribe("/app_cmd_vel");
  unsubscribe("/cmd_status");
});

// 在canvas上绘制图形
function drawRectangleOnCanvas(canvas, x, y, width, height, color = "red") {
  const ctx = canvas.getContext("2d"); // 获取canvas的绘图上下文
  ctx.strokeStyle = color; // 设置绘制颜色
  ctx.lineWidth = 1; // 设置线条宽度
  ctx.strokeRect(x, y, width, height); // 绘制矩形框
  //在框的顶部绘制文字
  ctx.font = "20px Arial";
  ctx.fillStyle = "green";
  ctx.fillText("person", x, y - 2);
  // 绘制一个不规则形状
  // ctx.beginPath();
  // ctx.moveTo(175, 150);
  // ctx.lineTo(200, 175);
  // ctx.lineTo(200, 125);
  // ctx.fill();
  //绘制曲线
  // ctx.beginPath();
  // ctx.moveTo(75, 40);
  // ctx.bezierCurveTo(75, 137, 70, 125, 50, 125);
  // ctx.bezierCurveTo(20, 125, 20, 162.5, 20, 162.5);
  // ctx.bezierCurveTo(20, 180, 40, 202, 75, 220);
  // ctx.bezierCurveTo(110, 202, 130, 180, 130, 162.5);
  // ctx.bezierCurveTo(130, 162.5, 130, 125, 100, 125);
  // ctx.bezierCurveTo(85, 125, 75, 137, 75, 140);
  // ctx.fill();
}
</script>
