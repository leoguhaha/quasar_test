<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          Dxr APP Test Version
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <div class="row">
        <canvas id="video-canvas1" width="400" height="200" style="width: 1200px; height: 600px;"></canvas>
        <canvas id="overlay-canvas" width="400" height="200" style="position: absolute; top: 0; left: 0; width: 1200px; height: 600px; pointer-events: none;"></canvas>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { onMounted } from 'vue';
import JSMpeg from 'jsmpeg-player';

onMounted(() => {
  const wsUrl = 'ws://localhost:9999'; // Replace with your actual WebSocket URL
  const wsMqtt = new WebSocket('ws://localhost:9010');

  // 订阅mqtt-websocket数据
  wsMqtt.onmessage = function(event) {
    const message = event.data;
    console.log('Received:', message);
    // 处理接收到的消息
    console.log('message type:', typeof message);
    // 将接收到的消息转换为对象
    const messageObj = JSON.parse(message);
    console.log('messageObj:', messageObj);
    console.log('type', typeof messageObj);
    // 获取对象中的键和值
    console.log('ins', messageObj.msg.ins_origin);
  };
  try {
    const player = new JSMpeg.Player(wsUrl,{canvas: document.getElementById('video-canvas1')});
    // 在这设定周期性调用绘制函数；这里的100是示例间隔毫秒数，您可以根据需要微调
    const overlayCanvas = document.getElementById('overlay-canvas');
    overlayCanvas.width = overlayCanvas.offsetWidth;
    overlayCanvas.height = overlayCanvas.offsetHeight;
    setInterval(() => {
      // 清除之前的绘制内容
      overlayCanvas.getContext('2d').clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

      // 画框和文字
      drawRectangleOnCanvas(overlayCanvas, 950, 100, 200, 100);
    }, 100);
  } catch (error) {
    console.error('Error playing video:', error);
  }
});
// 在canvas上绘制图形
function drawRectangleOnCanvas(canvas, x, y, width, height, color = 'red') {
  const ctx = canvas.getContext('2d'); // 获取canvas的绘图上下文
  ctx.strokeStyle = color; // 设置绘制颜色
  ctx.lineWidth = 1; // 设置线条宽度
  ctx.strokeRect(x, y, width, height); // 绘制矩形框
  //在框的顶部绘制文字
  ctx.font = '20px Arial';
  ctx.fillStyle = 'green';
  ctx.fillText('person', x, y - 2);
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
