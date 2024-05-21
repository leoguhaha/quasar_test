<template>
  <div>
    <div :id="containerId" class="video-container"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';

const props = defineProps({
  containerId: {
    type: String,
    required: true
  }
});

const webVideoCtrlInstance = ref(null);

onMounted(() => {
  setTimeout(() => {
    try {
      webVideoCtrlInstance.value = deepClone(window.WebVideoCtrl);
      webVideoCtrlInstance.value.I_InitPlugin({
        szContainerID: props.containerId,
        cbInitPluginComplete: () => {
          console.log('Plugin initialized');
        }
      });
      webVideoCtrlInstance.value.I_InsertOBJECTPlugin(props.containerId).then(() => {
        init_video();
        console.log('OBJECT Plugin inserted');
      }).catch((error) => {
        console.error('Error inserting OBJECT Plugin:', error);
      });
    } catch (error) {
      console.error('Failed to instantiate WebVideoCtrl:', error);
    }
  }, 5000);

});
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

onBeforeUnmount(() => {
  if (webVideoCtrlInstance.value) {
    webVideoCtrlInstance.value.I_DestroyPlugin().then(() => {
      console.log('Plugin destroyed');
    }).catch((error) => {
      console.error('Error destroying plugin:', error);
    });
  }
});
function init_video() {
  // 获取video-container的宽高
  // var iWidth = videoContainer.value.clientWidth;
  // var iHeight = videoContainer.value.clientHeight;
  // console.log("iWidth", iWidth, "iHeight", iHeight);
  var oPlugin = {
    iWidth: 400, // plugin width
    iHeight: 400 // plugin height
  };

  // 使用URL中的参数更新oLiveView配置
  var oLiveView = {
    iProtocol: 1, // protocol 1: http, 2: https
    szIP: '10.20.0.122', // protocol ip
    szPort: '80', // protocol port
    szUsername: 'admin', // device username
    szPassword: 'Asb11023', // device password
    iStreamType: 1, // stream 1: main stream  2: sub-stream  3: third stream  4: transcode stream
    iChannelID: 1, // channel no
    bZeroChannel: false // zero channel
  };

  // 初始化插件参数及插入插件
  console.log('-------------------')
  // 初始化插件参数及插入插件
  webVideoCtrlInstance.value.I_InitPlugin({
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
      webVideoCtrlInstance.value.I_InsertOBJECTPlugin("divPlugin").then(() => {
        // 检查插件是否最新
        webVideoCtrlInstance.value.I_CheckPluginVersion().then((bFlag) => {
          console.log('flag-------------')
          if (bFlag) {
            alert("检测到新的插件版本，双击开发包目录里的HCWebSDKPlugin.exe升级！");
          }
          // 登录设备
          webVideoCtrlInstance.value.I_Login(oLiveView.szIP, oLiveView.iProtocol, oLiveView.szPort, oLiveView.szUsername, oLiveView.szPassword, {
            success: function (xmlDoc) {
              console.log('success')
              // 开始预览
              var szDeviceIdentify = oLiveView.szIP + "_" + oLiveView.szPort;
              setTimeout(function () {
                console.log('startRealPlay')
                webVideoCtrlInstance.value.I_StartRealPlay(szDeviceIdentify, {
                  iStreamType: oLiveView.iStreamType,
                  iChannelID: oLiveView.iChannelID,
                  bZeroChannel: oLiveView.bZeroChannel
                });
              }, 1000);
            }
          });
        });
      }, () => {
        alert("插件初始化失败，请确认是否已安装插件；如果未安装，请双击开发包目录里的HCWebSDKPlugin.exe安装！");
      });
    }
  });
}
</script>

<style scoped>
.video-container {
  width: 100%;
  height: 100%;
}
</style>
