
// import { WebVideoCtrl } from "./webVideoCtrl";
export class VideoControl {
  constructor(domId, ip, port, username, password, webctrl) {
    this.domId = domId;
    this.ip = ip;
    this.port = port;
    this.username = username;
    this.password = password;
    this.iWndIndex = 0;  // 当前选中的窗口
    this.webVideoCtrl = webctrl;
    this.g_iWndIndex = 0; // 当前选中的窗口
    this.init();
  }
  init() {
    console.log('domid', this.domId);
    this.webVideoCtrl.I_InsertOBJECTPlugin(this.domId).then(() => {
      // 检查插件是否最新
      // this.webVideoCtrl.I_CheckPluginVersion().then((bFlag) => {
      //     if (bFlag) {
      //         alert("检测到新的插件版本，双击开发包目录里的HCWebSDKPlugin.exe升级！");
      //     }
      // });
      // 登录
      this.login();
    }, () => {
      alert("插件初始化失败，请确认是否已安装插件；如果未安装，请双击开发包目录里的HCWebSDKPlugin.exe安装！");
    });
    // 初始化插件参数及插入插件
    // this.webVideoCtrl.I_InitPlugin({
    //   bWndFull: true,     //是否支持单窗口双击全屏，默认支持 true:支持 false:不支持
    //   iWndowType: 1,
    //   cbInitPluginComplete: function () {
    //     this.webVideoCtrl.I_InsertOBJECTPlugin(this.domId).then(() => {
    //           // 检查插件是否最新
    //           this.webVideoCtrl.I_CheckPluginVersion().then((bFlag) => {
    //               if (bFlag) {
    //                   alert("检测到新的插件版本，双击开发包目录里的HCWebSDKPlugin.exe升级！");
    //               }
    //           });
    //       }, () => {
    //           alert("插件初始化失败，请确认是否已安装插件；如果未安装，请双击开发包目录里的HCWebSDKPlugin.exe安装！");
    //       });
    //   }
    // });
  }
  login() {
    let self = this;
    // console.log('this.webvideoctrl is ', this.webVideoCtrl)
    this.webVideoCtrl.I_Login(this.ip, 1, this.port, this.username, this.password, {
      timeout: 3000,
      success: function (xmlDoc) {
        console.log("登录成功！");
        self.clickStartRealPlay(self);
      },
      error: function (oError) {
        console.log('login error', oError);
        // if (ERROR_CODE_LOGIN_REPEATLOGIN === status) {
        //     console.log("重复登录！");
        // } else {
        //     console.log("登录失败！");
        // }
      }
    });
  }
  // 开始预览
  clickStartRealPlay(that) {
    var szDeviceIdentify = that.ip
    var iRtspPort = 554
    var iChannelID = 1
    var bZeroChannel = false
    var szInfo = "";
    var iStreamType = 1;
    var oWndInfo = that.webVideoCtrl.I_GetWindowStatus(that.g_iWndIndex);
    var startRealPlay = function () {
      that.webVideoCtrl.I_StartRealPlay(szDeviceIdentify, {
        iStreamType: iStreamType,
        iChannelID: iChannelID,
        bZeroChannel: bZeroChannel,
        success: function () {
          szInfo = "开始预览成功！";
          console.log(szDeviceIdentify + " " + szInfo);
        },
        error: function (oError) {
          szInfo = "开始预览失败！";
          console.log(szDeviceIdentify + " " + szInfo);
        }
      });
    };
    if (oWndInfo != null) {// 已经在播放了，先停止
      that.webVideoCtrl.I_Stop({
        success: function () {
          startRealPlay();
        }
      });
    } else {
      startRealPlay();
    }
  }
  // 停止预览
  clickStopRealPlay(that) {
    var oWndInfo = that.webVideoCtrl.I_GetWindowStatus(that.g_iWndIndex);

    if (oWndInfo != null) {
      that.webVideoCtrl.I_Stop({
        success: function () {
          szInfo = "停止预览成功！";
          console.log(szDeviceIdentify + " " + szInfo);
        },
        error: function (oError) {
          console.log(szDeviceIdentify + " 停止预览失败！");
        }
      });
    }
  }
}

// 使用
// const videoControlInstance1 = new VideoControl('myDiv', '192.168.1.64', '80', 'admin', 'admin2020');
// videoControlInstance1.login();

