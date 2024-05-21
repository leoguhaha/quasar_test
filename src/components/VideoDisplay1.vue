<template>
  <div class="video-container" style="background-color: yellow;width: 100%; height: 100%;" ref="videoContainer">
    <!-- <iframe :src="computedUrl" ref="iframeRef" scrolling="no" frameborder="0"></iframe> -->
    <!-- <canvas :id="`video-canvas-${index}`"></canvas>
    <canvas :id="`overlay-canvas-${index}`" style="position: absolute; top: 0; left: 0; pointer-events: none"></canvas> -->
    <!-- <div id="divPlugin" style="width: 100%; height: 100%;"> </div> -->
    <div :id="`video-canvas-${index}`" style="width: 100%; height: 100%;"></div>
    <!-- <div id="camera1-sub" style="width: 100%; height: 50%;"></div> -->
  </div>
</template>
<script setup>
import { onMounted, watch, computed, ref } from "vue";
// import { VideoControl } from '../assets/VideoCtrl';
// import { WebVideoCtrl } from '../assets/webVideoCtrlBack.js';


const props = defineProps({
  videoUrl: String,
  index: Number,
  width: {
    type: String,
    default: "100%",
  },
});
// 使用正则表达式拆解URL
const parsedUrl = props.videoUrl.match(/^(rtsp):\/\/([^:]+):([^@]+)@([^:]+):(\d+)(\/.+)$/);
const ipAddress = parsedUrl[4];     // 10.20.0.122
let path = parsedUrl[6];          // /Streaming/Channels/101

// 提取最后的编号部分
const match = path.match(/\/(\d+)$/);
let channel = 1;
let streamType = 1;

if (match) {
  const fullNumber = match[1]; // 获取匹配的第一个捕获组，即101

  if (fullNumber.length === 3) {
    const channel = fullNumber.charAt(0);
    const streamType = fullNumber.charAt(2);
  } else {
    console.log('Unexpected format for the number.');
  }
}

onMounted(() => {
  init_video(`video-canvas-${props.index}`);
  // init_video(2, 'camera1-sub');

});
// const webctrlMap = [
//   windoWebVideoCtrl1,
//   // WebVideoCtrl2,
//   //   WebVideoCtrl3,
//   //   WebVideoCtrl4,
//   //   WebVideoCtrl5,
//   //   WebVideoCtrl6,
//   //   WebVideoCtrl7,
//   //   WebVideoCtrl8,
//   //   WebVideoCtrl9,
// ]

// const WebCtrl = webctrlMap[props.index];
const WebCtrl = WebVideoCtrl;
// console.log('WebCtrl', props.index, WebCtrl, WebCtrl.version)
function initPlugin(oLiveView, containerId, retryCount = 0) {
  console.log('initPlugin---------count', retryCount, new Date().toLocaleString());
  if (retryCount > 5) {
    alert("插件初始化多次失败，请确认是否已正确安装插件！");
    return;
  }
  WebCtrl.I_InitPlugin({
    bWndFull: true,     //是否支持单窗口双击全屏，默认支持 true:支持 false:不支持
    iWndowType: 1,
    cbSelWnd: function (xmlDoc) {
      g_iWndIndex = parseInt($(xmlDoc).find("SelectWnd").eq(0).text(), 10);
      var szInfo = "当前选择的窗口编号：" + g_iWndIndex;
      showCBInfo(szInfo);
    },
    cbDoubleClickWnd: function (iWndIndex, bFullScreen) {
      var szInfo = "当前放大的窗口编号：" + iWndIndex;
      if (!bFullScreen) {
        szInfo = "当前还原的窗口编号：" + iWndIndex;
      }
      showCBInfo(szInfo);
    },
    cbEvent: function (iEventType, iParam1, iParam2) {
      if (2 == iEventType) {// 回放正常结束
        showCBInfo("窗口" + iParam1 + "回放结束！");
      } else if (-1 == iEventType) {
        showCBInfo("设备" + iParam1 + "网络错误！");
      } else if (3001 == iEventType) {
        clickStopRecord(g_szRecordType, iParam1);
      }
    },
    cbInitPluginComplete: function () {
      console.log('Attempting to initialize plugin, try number:', retryCount + 1);
      WebCtrl.I_InsertOBJECTPlugin(containerId).then(() => {
        console.log('containerId-----', containerId);
        // 检查插件是否最新
        WebCtrl.I_CheckPluginVersion()
          .then((bFlag) => {
            console.log('flag-------------');
            if (bFlag) {
              alert("检测到新的插件版本，双击开发包目录里的HCWebSDKPlugin.exe升级！");
            }
            console.log('start to login....');
            // 登录设备
            return WebCtrl.I_Login(oLiveView.szIP, oLiveView.iProtocol, oLiveView.szPort, oLiveView.szUsername, oLiveView.szPassword, {
              success: function (xmlDoc) {
                console.log('success');
                // 开始预览
                var szDeviceIdentify = oLiveView.szIP + "_" + oLiveView.szPort;
                setTimeout(function () {
                  console.log('startRealPlay');
                  WebCtrl.I_StartRealPlay(szDeviceIdentify, containerId, {
                    iWndIndex: 0,
                    iStreamType: oLiveView.iStreamType,
                    iChannelID: oLiveView.iChannelID,
                    bZeroChannel: oLiveView.bZeroChannel,
                  });
                }, 1000);
              },
              error: function (error) {
                console.log('login XXXXXXX', error);
                console.error('Login error:', error);
                setTimeout(() => initPlugin(oLiveView, containerId, retryCount + 1), 2000);
              }
            });
          })
          .catch((error) => {
            console.log('check plugin error', error);
            // console.error("Error:", error);
            // alert(`An error occurred: ${error.message}`);
            // sleep 2000ms
            setTimeout(() => initPlugin(oLiveView, containerId, retryCount + 1), 2000);
          });
      }, (e) => {
        console.log('initplugin error', e);
        setTimeout(() => initPlugin(oLiveView, containerId, retryCount + 1), 2000);
      });
    }
  });
  if (retryCount > 5) {
    alert("插件初始化多次失败，请确认是否已正确安装插件！");
    return;
  }
}
// const videoContainer = ref(null);
function init_video(containerId) {
  // 获取video-container的宽高
  // var iWidth = videoContainer.value.clientWidth;
  // var iHeight = videoContainer.value.clientHeight;
  // console.log("iWidth", iWidth, "iHeight", iHeight);
  // var oPlugin = {
  //   iWidth: 400, // plugin width
  //   iHeight: 400 // plugin height
  // };
  // 随机赋值1或2
  let randomValue1 = Math.random() < 0.5 ? 1 : 2;
  let randomValue2 = Math.random() < 0.5 ? 1 : 2;
  // console.log('randow2', randomValue2)
  // 使用URL中的参数更新oLiveView配置
  var oLiveView = {
    iProtocol: 1, // protocol 1: http, 2: https
    szIP: ipAddress, // protocol ip
    szPort: '80', // protocol port
    szUsername: 'admin', // device username
    szPassword: 'Asb11023', // device password
    iStreamType: streamType, // stream 1: main stream  2: sub-stream  3: third stream  4: transcode stream
    iChannelID: channel, // channel no
    bZeroChannel: false // zero channel
  };

  // 初始化插件参数及插入插件
  console.log('-------------------')
  // 初始化插件参数及插入插件
  initPlugin(oLiveView, containerId, 0);
}
</script>
