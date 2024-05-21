<template>
  <div class="video-container" style="background-color: yellow;">
    <iframe :src="computedUrl" ref="iframeRef" scrolling="no" frameborder="0"></iframe>
    <!-- <canvas :id="`video-canvas-${index}`"></canvas>
    <canvas :id="`overlay-canvas-${index}`" style="position: absolute; top: 0; left: 0; pointer-events: none"></canvas> -->
  </div>
</template>
<script setup>
import { onMounted, watch, computed, ref } from "vue";
import JSMpeg from "jsmpeg-player";
// import { VideoControl } from '../assets/VideoCtrl';
// import { WebVideoCtrl } from '../assets/webVideoCtrl';

const props = defineProps({
  videoUrl: String,
  index: Number,
  width: {
    type: String,
    default: "100%",
  },
});
const iframeRef = ref(null);
// 发射点击事件
const emit = defineEmits(['videoClicked']);
const url = `src/components/demo${props.index}.html`;
const computedUrl = computed(() => {
  // 比如你的路径可能依赖于视频的URL，这里简单地返回videoUrl
  // 实际上，你可能需要根据videoUrl进行更复杂的处理
  if (props.index === 0) {
    return `src/components/demo${props.index}.html`;
  } else {
    return `src/components/demo${props.index}.html`;
  }
});
let player = null;
function postIframe(tp, lt) {
  // let myMessage = iframeRef.value.offset; // iframe相对浏览器的偏移量 top 和left
  let myMessage = {
    top: tp,
    left: lt
  };
  let parentHeight = iframeRef.value.offsetHeight;  //iframe窗口大小
  let parentWidth = iframeRef.value.offsetWidth;  // //iframe窗口大小
  var receiver = iframeRef.value.contentWindow;
  console.log('info', parentHeight, parentWidth, myMessage, 'receiver', receiver);
  receiver.postMessage({ parentHeight, parentWidth, myMessage }, '*');
}
function fd(wait) {
  let timer = null
  return function () {
    if (timer != null) clearTimeout(timer)
    timer = setTimeout(() => {
      postIframe()
      console.log('函数防抖触发');
    }, wait)
  }
}
let myfd = fd(1000)
window.onresize = function () {
  myfd()
}
window.onload = function () {
  postIframe()
}

watch(() => props.videoUrl, () => {
  console.log("videoUrl changed from");
  if (iframeRef.value) {
    iframeRef.value.src = url;
  }
}, { immediate: true });

onMounted(() => {
  // 创建一个函数用于按顺序加载脚本
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(script);
      script.onerror = () => reject(new Error(`Script load error for ${src}`));
      document.head.appendChild(script);
    });
  }

  // 按顺序加载脚本
  async function loadScriptsInOrder() {
    try {
      // await loadScript('src/assets/jquery-1.7.1.min.js');
      console.log('jQuery loaded.');

      await loadScript('src/assets/jsVideoPlugin-1.0.0.min.js');
      console.log('jsvideo.js loaded.');

      // await loadScript('src/assets/webVideoCtrl.js');
      console.log('webVideoCtrl.js loaded.');

      // await loadScript('src/assets/VideoCtrl.js');
      console.log('demo.js loaded.');
      let divname = `video-canvas-${props.index}`
      // const videoControlInstance1 = new VideoControl(divname, '10.20.0.122', '80', 'admin', 'Asb11023', WebVideoCtrl);


    } catch (error) {
      console.error('Failed to load scripts:', error);
    }
  }

  loadScriptsInOrder();
  iframeRef.value.onload = () => {
    //获取iframe在整个页面的位置
    let iframeOffset = iframeRef.value.getBoundingClientRect();
    console.log('iframeOffset', iframeOffset);
    let top = iframeOffset.top;
    let left = iframeOffset.left;
    iframeRef.value.contentWindow.moveTo(top, left);
    iframeRef.value.contentWindow.initDemo();
    postIframe(top, left); // 现在调用postIframe
  };

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
  /* overflow: hidden; */
  border: 1px solid #ccc;
}

iframe {
  width: 100%;
  height: 100%;
  border: none;
  background-color: blueviolet;
  position: absolute;
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
