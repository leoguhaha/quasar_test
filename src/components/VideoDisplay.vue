<template>
  <div class="video-container">
    <canvas :id="`video-canvas-${index}`"></canvas>
    <canvas :id="`overlay-canvas-${index}`" style="position: absolute; top: 0; left: 0; pointer-events: none"></canvas>
  </div>
</template>
<script setup>
import { onMounted, watch } from "vue";
import JSMpeg from "jsmpeg-player";

const props = defineProps({
  videoUrl: String,
  index: Number,
  width: {
    type: String,
    default: "100%",
  },
});
// 发射点击事件
const emit = defineEmits(['videoClicked']);
let player = null;
let res = null;

onMounted(() => {
  const videoUrl = props.videoUrl;
  // 初始化rtsp，通知后端，让后端进行rtsp拉流，并且转成websocket
  res = window.mainApi.sendSync("openRtsp", videoUrl);
  if (res.code !== 200) {
    console.error(res.msg);
    // 前端直接弹框
    alert(res.msg);
    return;
  }
  const wsUrl = res.ws;
  // console.log("wsUrl", wsUrl);
  initializePlayer(wsUrl);
  const videoCanvas = document.getElementById(`video-canvas-${props.index}`);
  videoCanvas.addEventListener('click', () => {
    // 当点击时，发送一个videoClicked事件，附带视频索引
    emit('videoClicked', props.index);
  });
  // const overlayCanvas = document.getElementById(`overlay-canvas-${props.index}`);
  // overlayCanvas.width = overlayCanvas.offsetWidth;
  // overlayCanvas.height = overlayCanvas.offsetHeight;
  // setInterval(() => {
  //   // 清除之前的绘制内容
  //   overlayCanvas
  //     .getContext("2d")
  //     .clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  //   // 画框和文字
  //   drawRectangleOnCanvas(overlayCanvas, 200, 100, 100, 50);
  // }, 100);

  // 假设一个用于重载视频的方法
  const reloadVideo = () => {
    console.log('Reloading video for URL', props.videoUrl);
    // 重载视频逻辑...
    reloadUrl();
  };

  // 使用Vue的响应性API监听props.videoUrl的变化
  watch(() => props.videoUrl, (newVal, oldVal) => {
    if (newVal !== oldVal) {
      reloadVideo();
    }
  });
});
// 重新加载视频
function reloadUrl() {
  const videoUrl = props.videoUrl;
  console.log("Reloading video for URL", videoUrl);
  const res = window.mainApi.sendSync("openRtsp", videoUrl);
  if (res.code !== 200) {
    console.error(res.msg);
    alert(res.msg);
    return;
  }
  player.stop();
  // player.destroy();
  player = null;
  console.log('res', res);
  const wsUrl = res.ws;
  initializePlayer(wsUrl);
}
function initializePlayer(wsUrl) {
  try {
    player = new JSMpeg.Player(wsUrl, {
      canvas: document.getElementById(`video-canvas-${props.index}`),
    });
  } catch (error) {
    console.error("Error playing video:", error);
  }
}
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
<style>
.video-container {
  position: relative;
  /* 确保容器有具体的尺寸 */
  width: 100%;
  /* 根据你的需要调整 */
  height: 100%;
  /* 例如，根据你的需要调整为视口高度的100% */
  overflow: hidden;
  border: 1px solid #ccc;
}

.video-container canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  /* 覆盖整个容器，不保持纵横比 */
}
</style>
