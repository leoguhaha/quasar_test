(function () {
  if (window.WebVideoCtrl3) {
    return
  }
  var WebVideoCtrl3 = function () {
    var m_szWidth = "100%";
    var m_szHeight = "100%";
    var m_options = {
      szversion: "V3.3.1 build20231030",
      szContainerID: "",
      szColorProperty: "",
      szBasePath: "",
      iWndowType: 1,
      bWndFull: true,
      iPackageType: 2,
      bDebugMode: true,
      cbSelWnd: null,
      cbDoubleClickWnd: null,
      cbEvent: null,
      cbInitPluginComplete: null
    };
    var m_pluginOBJECT = null;
    var m_iSelWnd = 0;
    var m_bFullScreen = false;
    var m_deviceSet = [];
    var m_wndSet = [];
    var m_ISAPIProtocol = null;
    var m_utilsInc = null;
    var m_webVideoCtrl = this;
    var m_oLocalCfg = null;
    var PROTOCOL_DEVICE_ISAPI = 1;
    var ERROR_CODE_UNKNOWN = 1e3;
    var ERROR_CODE_NETWORKERROR = 1001;
    var ERROR_CODE_PARAMERROR = 1002;
    var ERROR_CODE_LOGIN_NOLOGIN = 2e3;
    var ERROR_CODE_LOGIN_REPEATLOGIN = 2001;
    var ERROR_CODE_LOGIN_NOSUPPORT = 2002;
    var ERROR_CODE_PLAY_PLUGININITFAIL = 3e3;
    var ERROR_CODE_PLAY_NOREPEATPLAY = 3001;
    var ERROR_CODE_PLAY_PLAYBACKABNORMAL = 3002;
    var ERROR_CODE_PLAY_PLAYBACKSTOP = 3003;
    var ERROR_CODE_PLAY_NOFREESPACE = 3004;
    var ERROR_CODE_TALK_FAIL = 5e3;
    var HTTP_STATUS_OK_200 = 200;
    var HTTP_STATUS_ERROR_403 = 403;
    var PLAY_STATUS_STOP = 0;
    var PLAY_STATUS_REALPLAY = 1;
    var PLAY_STATUS_PLAYBACK = 2;
    var PLAY_STATUS_PAUSE = 3;
    var PLAY_STATUS_FRAME = 4;
    var PLAY_STATUS_REVERSE_PLAYBACK = 5;
    var PLAY_STATUS_REVERSE_PAUSE = 6;
    var PROTOCOLTYPE_PLAY_TCP = 0;
    var PROTOCOLTYPE_PLAY_UDP = 1;
    var DEVICE_TYPE_IPCAMERA = "IPCamera";
    var DEVICE_TYPE_IPDOME = "IPDome";
    var DEVICE_TYPE_IPZOOM = "IPZoom";
    var DEVICE_TYPE_GATEWAY = "Gateway";
    var m_szVersion = "<?xml version='1.0' encoding='utf-8'?><FileVersion>" + "<Platform name='win32'>" + "<localServiceControl>1.0.0.40</localServiceControl>";
    "</Platform>" + "</FileVersion>";
    var _onGetSelectWndInfo = function (iWnd) {
      m_iSelWnd = iWnd;
      if (m_options.cbSelWnd) {
        var arrXml = [];
        arrXml.push("<RealPlayInfo>");
        arrXml.push("<SelectWnd>" + m_iSelWnd + "</SelectWnd>");
        arrXml.push("</RealPlayInfo>");
        m_options.cbSelWnd(m_utilsInc.loadXML(arrXml.join("")))
      }
    };
    var _onMouseEvent = function (oData) {
      if (m_options.cbDoubleClickWnd && 2 === oData.eventType) {
        if (m_options.bWndFull) {
          var iIndex = m_webVideoCtrl.findWndIndexByIndex(oData.wndIndex);
          if (iIndex != -1) {
            m_bFullScreen = !m_bFullScreen
          }
        }
        m_options.cbDoubleClickWnd(oData.wndIndex, m_bFullScreen)
      }
    };
    var _onPluginEventHandler = function (iWndIndex, iErrorCode, oError) {
      var iNewError = ERROR_CODE_UNKNOWN;
      if (0 === iErrorCode) {
        iNewError = ERROR_CODE_PLAY_PLAYBACKABNORMAL
      } else if (2 === iErrorCode) {
        iNewError = ERROR_CODE_PLAY_PLAYBACKSTOP
      } else if (3 === iErrorCode) {
        iNewError = ERROR_CODE_TALK_FAIL
      } else if (21 === iErrorCode) {
        iNewError = ERROR_CODE_PLAY_NOFREESPACE
      }
      if (ERROR_CODE_PLAY_PLAYBACKABNORMAL == iNewError || ERROR_CODE_PLAY_PLAYBACKSTOP == iNewError) {
        m_webVideoCtrl.I_Stop(iWndIndex)
      } else if (ERROR_CODE_PLAY_NOFREESPACE == iNewError) {
        m_webVideoCtrl.I_StopRecord(iWndIndex)
      } else if (ERROR_CODE_TALK_FAIL == iNewError) {
        m_webVideoCtrl.I_StopVoiceTalk()
      } else { }
      if (m_options.cbEvent) {
        m_options.cbEvent(iNewError, iWndIndex, oError)
      }
    };
    var _onKeyBoardEvent = function (iKeyCode) {
      if (100 === parseInt(iKeyCode, 10)) {
        m_bFullScreen = false;
        if (m_options.cbDoubleClickWnd) {
          m_options.cbDoubleClickWnd(m_iSelWnd, m_bFullScreen)
        }
      }
    };
    var _onZoomInfoCallback = function (oPoints) {
      var iIndex = m_webVideoCtrl.findWndIndexByIndex(m_iSelWnd);
      if (iIndex != -1) {
        var oWndInfo = m_wndSet[iIndex];
        iIndex = m_webVideoCtrl.findDeviceIndexByIP(oWndInfo.szDeviceIdentify);
        if (iIndex != -1) {
          var oDeviceInfo = m_deviceSet[iIndex];
          oDeviceInfo.oProtocolInc.set3DZoom(oDeviceInfo, oWndInfo, oPoints, {})
        }
      }
    };
    var _oNoLoginError = {
      errorCode: ERROR_CODE_LOGIN_NOLOGIN,
      errorMsg: "The device is not login."
    };
    var _oUnKnownError = {
      errorCode: ERROR_CODE_UNKNOWN,
      errorMsg: "Unknown error."
    };
    var _oParamsError = {
      errorCode: ERROR_CODE_PARAMERROR,
      errorMsg: "Params error."
    };
    var _printString = function () {
      if (m_options.bDebugMode) {
        var printString = m_utilsInc.formatString(arguments);
        console.log(printString)
      }
    };
    var _initLocalCfg = function () {
      let oPromise = new Promise(function (resolve, reject) {
        m_pluginOBJECT.JS_GetLocalConfig()
          .then(oLocalCofing => {
            m_oLocalCfg = oLocalCofing;
            resolve()
          }, () => {
            reject()
          })
      });
      return oPromise
    };
    var _initDeviceInfo = function (oDeviceInfo) {
      let oPromise = new Promise(function (resolve, reject) {
        let oP1 = oDeviceInfo.oProtocolInc.getDeviceInfo(oDeviceInfo, {});
        let oP2 = oDeviceInfo.oProtocolInc.getAnalogChannelInfo(oDeviceInfo, {});
        let oP3 = oDeviceInfo.oProtocolInc.getAudioInfo(oDeviceInfo, {});
        let oP4 = _getPort(oDeviceInfo);
        let oP5 = oDeviceInfo.oProtocolInc.getDeviceMinusLocalTime(oDeviceInfo);
        Promise.all([oP1, oP2, oP3, oP4, oP5])
          .then(() => {
            resolve()
          }, () => {
            resolve()
          })
      });
      return oPromise
    };
    var _initPlugin = function (szContainerID) {
      let oPromise = new Promise(function (resolve, reject) {
        if (!m_utilsInc.isUndefined(szContainerID)) {
          m_options.szContainerID = szContainerID
        }
        if (document.getElementById(m_options.szContainerID) == null) {
          reject(_oParamsError);
          return
        }
        var oParam = {
          szId: szContainerID,
          iType: 1,
          iWidth: m_szWidth,
          iHeight: m_szHeight,
          iMaxSplit: 4,
          iCurrentSplit: m_options.iWndowType,
          iServicePortStart: 34686,
          iServicePortEnd: 34690,
          oSessionInfo: {
            sessionID: "11c12b3257f037bb50052db3ac5e342572c3d963622baca122755c482ce8823a",
            user: "admin",
            challenge: "275816f02ec2dca22b6a6ae87c7cb7e3",
            iterations: 100,
            random: "34765058"
          },
          iPluginType: 2,
          onConnectSuccess: () => {
            var oElem = $("#" + szContainerID);
            m_pluginOBJECT.JS_Resize(oElem.width(), oElem.height());
            if (2 !== m_pluginOBJECT.iPluginMode) {
              reject({
                errorCode: ERROR_CODE_PLAY_PLUGININITFAIL,
                errorMsg: "Plugin init failed."
              });
              return
            }
            var iWndFull = m_options.bWndFull ? 1 : 0;
            m_pluginOBJECT.JS_SetFullScreenCapability(iWndFull);
            m_pluginOBJECT.JS_SetPackageType(m_options.iPackageType);
            _initPluginEvent();
            _initLocalCfg()
              .then(() => {
                resolve()
              })
          },
          onConnectError: () => {
            reject({
              errorCode: ERROR_CODE_PLAY_PLUGININITFAIL,
              errorMsg: "Plugin init failed."
            })
          },
          szBasePath: m_utilsInc.getDirName()
        };
        m_pluginOBJECT = new JSVideoPlugin(oParam)
      });
      return oPromise
    };
    var _initPluginEvent = function () {
      m_pluginOBJECT.JS_SetWindowControlCallback({
        onGetSelectWndInfo: iwnd => {
          _onGetSelectWndInfo(iwnd)
        },
        onPluginEventHandler: (iWndIndex, iEventType, iParam2) => {
          _onPluginEventHandler(iWndIndex, iEventType, iParam2)
        },
        KeyBoardEvent: szXml => {
          _onKeyBoardEvent(szXml)
        },
        onMouseEvent: function (oData) {
          _onMouseEvent(oData)
        }
      })
    };
    var _getPort = function (oDeviceInfo) {
      let oPromise = new Promise(async (resolve, reject) => {
        var oPort = null;
        let bPPPoE = await _getPPPoEEnable(oDeviceInfo);
        if (bPPPoE) {
          oPort = await _getInternalPort(oDeviceInfo)
        } else {
          var ipset = await _getDeviceIPAddr(oDeviceInfo);
          var bSame = false;
          for (var i = 0; i < ipset.length; i++) {
            if (ipset[i].ipv4 == oDeviceInfo.szIP || ipset[i].ipv6 == oDeviceInfo.szIP) {
              bSame = true;
              break
            }
          }
          if (bSame) {
            oPort = await _getInternalPort(oDeviceInfo)
          } else {
            oPort = await _getExternalPort(oDeviceInfo);
            if (-1 == oPort.iRtspPort && -1 == oPort.iDevicePort) {
              oPort = await _getInternalPort(oDeviceInfo)
            }
          }
        }
        oDeviceInfo.iRtspPort = oPort.iRtspPort;
        oDeviceInfo.iHttpPort = oPort.iHttpPort;
        resolve(oPort)
      });
      return oPromise
    };
    var _getInternalPort = function (oDeviceInfo) {
      let oPromise = new Promise((resolve, reject) => {
        var iRtspPort = -1,
          iHttpPort = -1,
          iDevicePort = -1;
        oDeviceInfo.oProtocolInc.getPortInfo(oDeviceInfo, {
          async: false,
          success: function (xmlDoc) {
            var nodeList = NS.$XML(xmlDoc)
              .find("AdminAccessProtocol", true);
            iRtspPort = 554;
            for (var i = 0, iLen = nodeList.length; i < iLen; i++) {
              if (NS.$XML(nodeList)
                .eq(i)
                .find("protocol")
                .eq(0)
                .text()
                .toLowerCase() === "rtsp") {
                iRtspPort = parseInt(NS.$XML(nodeList)
                  .eq(i)
                  .find("portNo")
                  .eq(0)
                  .text(), 10)
              }
              if (NS.$XML(nodeList)
                .eq(i)
                .find("protocol")
                .eq(0)
                .text()
                .toLowerCase() === "http") {
                iHttpPort = parseInt(NS.$XML(nodeList)
                  .eq(i)
                  .find("portNo")
                  .eq(0)
                  .text(), 10)
              }
              if (NS.$XML(nodeList)
                .eq(i)
                .find("protocol")
                .eq(0)
                .text()
                .toLowerCase() === "dev_manage") {
                iDevicePort = parseInt(NS.$XML(nodeList)
                  .eq(i)
                  .find("portNo")
                  .eq(0)
                  .text(), 10)
              }
            }
            resolve({
              iRtspPort: iRtspPort,
              iHttpPort: iHttpPort,
              iDevicePort: iDevicePort
            })
          },
          error: function () {
            resolve({
              iRtspPort: -1,
              iHttpPort: -1,
              iDevicePort: -1
            })
          }
        })
      });
      return oPromise
    };
    var _getExternalPort = function (oDeviceInfo) {
      let oPromise = new Promise((resolve, reject) => {
        var iRtspPort = -1,
          iHttpPort = -1,
          iDevicePort = -1;
        oDeviceInfo.oProtocolInc.getUPnPPortStatus(oDeviceInfo, {
          async: false,
          success: function (xmlDoc) {
            var nodeList = NS.$XML(xmlDoc)
              .find("portStatus", true);
            for (var i = 0, iLen = nodeList.length; i < iLen; i++) {
              if (NS.$XML(nodeList)
                .eq(i)
                .find("internalPort")
                .eq(0)
                .text()
                .toLowerCase() == "rtsp") {
                iRtspPort = parseInt(NS.$XML(nodeList)
                  .eq(i)
                  .find("externalPort")
                  .eq(0)
                  .text(), 10)
              }
              if (NS.$XML(nodeList)
                .eq(i)
                .find("internalPort")
                .eq(0)
                .text()
                .toLowerCase() == "http") {
                iHttpPort = parseInt(NS.$XML(nodeList)
                  .eq(i)
                  .find("externalPort")
                  .eq(0)
                  .text(), 10)
              }
              if (NS.$XML(nodeList)
                .eq(i)
                .find("internalPort")
                .eq(0)
                .text()
                .toLowerCase() == "admin") {
                iDevicePort = parseInt(NS.$XML(nodeList)
                  .eq(i)
                  .find("externalPort")
                  .eq(0)
                  .text(), 10)
              }
            }
            resolve({
              iRtspPort: iRtspPort,
              iHttpPort: iHttpPort,
              iDevicePort: iDevicePort
            })
          },
          error: function () {
            resolve({
              iRtspPort: -1,
              iHttpPort: -1,
              iDevicePort: -1
            })
          }
        })
      });
      return oPromise
    };
    var _getDeviceIPAddr = function (oDeviceInfo) {
      let oPromise = new Promise(function (resolve) {
        var arrIP = [];
        oDeviceInfo.oProtocolInc.getNetworkBond(oDeviceInfo, {
          async: false,
          success: function (xmlDoc) {
            if (NS.$XML(xmlDoc)
              .find("enabled")
              .eq(0)
              .text() == "true") {
              arrIP.push({
                ipv4: NS.$XML(xmlDoc)
                  .find("ipAddress")
                  .eq(0)
                  .text(),
                ipv6: NS.$XML(xmlDoc)
                  .find("ipv6Address")
                  .eq(0)
                  .text()
              });
              resolve(arrIP)
            } else {
              oDeviceInfo.oProtocolInc.getNetworkInterface(oDeviceInfo, {
                async: false,
                success: function (xmlDoc) {
                  var nodeList = NS.$XML(xmlDoc)
                    .find("NetworkInterface", true);
                  for (var i = 0, iLen = nodeList.length; i < iLen; i++) {
                    arrIP.push({
                      ipv4: NS.$XML(xmlDoc)
                        .find("ipAddress")
                        .eq(0)
                        .text(),
                      ipv6: NS.$XML(xmlDoc)
                        .find("ipv6Address")
                        .eq(0)
                        .text()
                    });
                    break
                  }
                  resolve(arrIP)
                },
                error: function () {
                  resolve(arrIP)
                }
              })
            }
          },
          error: function () {
            oDeviceInfo.oProtocolInc.getNetworkInterface(oDeviceInfo, {
              async: false,
              success: function (xmlDoc) {
                var nodeList = NS.$XML(xmlDoc)
                  .find("NetworkInterface", true);
                for (var i = 0, iLen = nodeList.length; i < iLen; i++) {
                  arrIP.push({
                    ipv4: NS.$XML(xmlDoc)
                      .find("ipAddress")
                      .eq(0)
                      .text(),
                    ipv6: NS.$XML(xmlDoc)
                      .find("ipv6Address")
                      .eq(0)
                      .text()
                  });
                  break
                }
                resolve(arrIP)
              },
              error: function () {
                resolve(arrIP)
              }
            })
          }
        })
      });
      return oPromise
    };
    var _getPPPoEEnable = function (oDeviceInfo) {
      let oPromise = new Promise(function (resolve) {
        var bEnabled = false;
        oDeviceInfo.oProtocolInc.getPPPoEStatus(oDeviceInfo, {
          success: function (xmlDoc) {
            if (NS.$XML(xmlDoc)
              .find("ipAddress", true)
              .length > 0) {
              bEnabled = true
            } else if (NS.$XML(xmlDoc)
              .find("ipv6Address", true)
              .length > 0) {
              bEnabled = true
            } else {
              bEnabled = false
            }
            resolve(bEnabled)
          },
          error: function () {
            bEnabled = false;
            resolve(bEnabled)
          }
        })
      });
      return oPromise
    };
    var _generateTransCodeXml = function (oTransCodeParam) {
      var oDefaultParam = {
        TransFrameRate: "",
        TransResolution: "",
        TransBitrate: ""
      };
      m_utilsInc.extend(oDefaultParam, oTransCodeParam);
      if (oDefaultParam.TransFrameRate == "" || oDefaultParam.TransResolution == "" || oDefaultParam.TransBitrate == "") {
        return ""
      }
      var ArraySet = [];
      ArraySet.push("<?xml version='1.0' encoding='UTF-8'?>");
      ArraySet.push("<CompressionInfo>");
      ArraySet.push("<TransFrameRate>" + oDefaultParam.TransFrameRate + "</TransFrameRate>");
      ArraySet.push("<TransResolution>" + oDefaultParam.TransResolution + "</TransResolution>");
      ArraySet.push("<TransBitrate>" + oDefaultParam.TransBitrate + "</TransBitrate>");
      ArraySet.push("</CompressionInfo>");
      return ArraySet.join("")
    };
    var _setDeviceInfo = function (cgiInstance, oDeviceInfo, szIP, iProtocol, iPort, szUserName, szPassword) {
      oDeviceInfo.szIP = szIP;
      if (iProtocol == 2) {
        oDeviceInfo.szHttpProtocol = "https://";
        oDeviceInfo.iHttpsPort = iPort
      } else {
        oDeviceInfo.szHttpProtocol = "http://";
        oDeviceInfo.iHttpPort = iPort
      }
      oDeviceInfo.iCGIPort = iPort;
      oDeviceInfo.szDeviceIdentify = szIP + "_" + iPort;
      oDeviceInfo.iDeviceProtocol = PROTOCOL_DEVICE_ISAPI;
      oDeviceInfo.oProtocolInc = cgiInstance;
      oDeviceInfo.szAuth = m_utilsInc.Base64.encode(":" + szUserName + ":" + szPassword)
    };
    var _doLogin = function (cgiInstance, oDeviceInfo, szIP, iProtocol, iPort, szUserName, szPassword, options) {
      var newOptions = {
        success: null,
        error: null
      };
      m_utilsInc.extend(newOptions, options);
      m_utilsInc.extend(newOptions, {
        success: function (xmlDoc) {
          _setDeviceInfo(cgiInstance, oDeviceInfo, szIP, iProtocol, iPort, szUserName, szPassword);
          m_deviceSet.push(oDeviceInfo);
          _initDeviceInfo(oDeviceInfo)
            .then(() => {
              if (options.success) {
                options.success(xmlDoc)
              }
            })
        },
        error: function (oError) {
          if (options.error) {
            options.error(oError)
          }
        }
      });
      return cgiInstance.digestLogin(szIP, iProtocol, iPort, szUserName, szPassword, newOptions)
    };
    this.I_SupportNoPlugin = function () {
      return false
    };
    this.I_Resize = function (iWidth, iHeight) {
      return m_pluginOBJECT.JS_Resize(iWidth, iHeight)
    };
    this.I_InitPlugin = function (options) {
      m_utilsInc.extend(m_options, options);
      var szDirName = m_utilsInc.getDirName();
      console.log('szDirName', szDirName);
      if (szDirName) {
        if ("object" === typeof exports && typeof module !== "undefined") { } else if ("function" === typeof define && define.amd) {
          require([szDirName + "../assets/jsVideoPlugin-1.0.0.min.js"], function (o) {
            window.JSVideoPlugin = o.JSVideoPlugin;
            if (options.cbInitPluginComplete) {
              options.cbInitPluginComplete()
            }
          })
        } else {
          m_utilsInc.loadScript(szDirName + "../assets/jsVideoPlugin-1.0.0.min.js", function () {
            if (options.cbInitPluginComplete) {
              options.cbInitPluginComplete()
            }
          })
        }
      }
      window.addEventListener("resize", function () {
        if (m_pluginOBJECT !== null) {
          console.log('resize info', m_options.szContainerID)
          var oElem = $("#" + m_options.szContainerID);
          m_pluginOBJECT.JS_Resize(oElem.width(), oElem.height())
          console.log('resize info', oElem.width(), oElem.height())
        }
      });
      window.addEventListener("unload", function () { })
      //监听message
      window.addEventListener('message', function (e) {
        console.log('data', e.data)  //e.data为传递过来的数据
        inittop = e.data.myMessage.top
        initLeft = e.data.myMessage.left
        newheight = e.data.parentHeight
        newWidth = e.data.parentWidth

        $("#test").css("width", newWidth + "px");
        $("#test").css("height", newheight + "px");
        //操作dom元素 修改插件的相对浏览器的相对位置
        $("#test").css("margin-top", Number(inittop) + 1 + "px");
        $("#test").css("margin-left", Number(initLeft) + 1 + "px");
        if (m_pluginOBJECT != null) {
          m_pluginOBJECT.JS_Resize(newWidth, newheight);
        }
      })
    };
    this.I_InsertOBJECTPlugin = function (szContainerID) {
      return _initPlugin(szContainerID)
    };
    this.I_WriteOBJECT_XHTML = function () {
      return 0
    };
    this.I_OpenFileDlg = async function (iType) {
      let oPromise = new Promise(function (resolve, reject) {
        m_pluginOBJECT.JS_OpenFileBrowser(iType, "")
          .then(szFilePath => {
            resolve(szFilePath)
          }, () => {
            reject(_oUnKnownError)
          })
      });
      return oPromise
    };
    this.I_GetLocalCfg = function () {
      let oPromise = new Promise(function (resolve, reject) {
        m_pluginOBJECT.JS_GetLocalConfig()
          .then(oLocalCofing => {
            resolve(oLocalCofing)
          }, () => {
            reject(_oUnKnownError)
          })
      });
      return oPromise
    };
    this.I_SetLocalCfg = function (oLocalCofing) {
      let oPromise = new Promise(function (resolve, reject) {
        m_pluginOBJECT.JS_SetLocalConfig(oLocalCofing)
          .then(() => {
            resolve()
          }, () => {
            reject(_oUnKnownError)
          })
      });
      return oPromise
    };
    this.I_Login = function (szIP, iProtocol, iPort, szUserName, szPassword, options) {
      let oPromise = new Promise(function (resolve, reject) {
        var szDeviceIdentify = szIP + "_" + iPort;
        var iIndex = this.findDeviceIndexByIP(szDeviceIdentify);
        if (iIndex != -1) {
          if (options.error) {
            options.error({
              errorCode: ERROR_CODE_LOGIN_REPEATLOGIN,
              errorMsg: "The device is already login."
            })
          }
          reject({
            errorCode: ERROR_CODE_LOGIN_REPEATLOGIN,
            errorMsg: "The device is already login."
          });
          return
        }
        var cgiInstance = m_ISAPIProtocol;
        var oDeviceInfo = new deviceInfoClass;
        _doLogin(cgiInstance, oDeviceInfo, szIP, iProtocol, iPort, szUserName, szPassword, options)
          .then(() => {
            resolve()
          }, oError => {
            reject(oError)
          })
      });
      return oPromise
    };
    this.I_Logout = function (szDeviceIdentify) {
      let oPromise = new Promise(function (resolve, reject) {
        var iIndex = this.findDeviceIndexByIP(szDeviceIdentify);
        if (iIndex != -1) {
          m_deviceSet.splice(iIndex, 1);
          resolve()
        }
      });
      return oPromise
    };
    this.I_GetAudioInfo = function (szDeviceIdentify, options) {
      let oPromise = new Promise(function (resolve, reject) {
        var iIndex = this.findDeviceIndexByIP(szDeviceIdentify);
        if (iIndex != -1) {
          var oDeviceInfo = m_deviceSet[iIndex];
          oDeviceInfo.oProtocolInc.getAudioInfo(oDeviceInfo, options)
            .then(oData => {
              resolve(oData)
            }, oError => {
              reject(oError)
            })
        } else {
          reject(_oNoLoginError)
        }
      });
      return oPromise
    };
    this.I_GetDeviceInfo = function (szDeviceIdentify, options) {
      let oPromise = new Promise(function (resolve, reject) {
        var iIndex = this.findDeviceIndexByIP(szDeviceIdentify);
        if (iIndex != -1) {
          var oDeviceInfo = m_deviceSet[iIndex];
          oDeviceInfo.oProtocolInc.getDeviceInfo(oDeviceInfo, options)
            .then(oData => {
              resolve(oData)
            }, oError => {
              reject(oError)
            })
        } else {
          reject(_oNoLoginError)
        }
      });
      return oPromise
    };
    this.I_GetAnalogChannelInfo = function (szDeviceIdentify, options) {
      let oPromise = new Promise(function (resolve, reject) {
        var iIndex = this.findDeviceIndexByIP(szDeviceIdentify);
        if (iIndex != -1) {
          var oDeviceInfo = m_deviceSet[iIndex];
          oDeviceInfo.oProtocolInc.getAnalogChannelInfo(oDeviceInfo, options)
            .then(oData => {
              resolve(oData)
            }, oError => {
              reject(oError)
            })
        } else {
          reject(_oNoLoginError)
        }
      });
      return oPromise
    };
    this.I_GetDigitalChannelInfo = function (szDeviceIdentify, options) {
      let oPromise = new Promise(function (resolve, reject) {
        var iIndex = this.findDeviceIndexByIP(szDeviceIdentify);
        if (iIndex != -1) {
          var oDeviceInfo = m_deviceSet[iIndex];
          oDeviceInfo.oProtocolInc.getDigitalChannelInfo(oDeviceInfo, options)
            .then(oData => {
              resolve(oData)
            }, oError => {
              reject(oError)
            })
        } else {
          reject(_oNoLoginError)
        }
      });
      return oPromise
    };
    this.I_GetZeroChannelInfo = function (szDeviceIdentify, options) {
      let oPromise = new Promise(function (resolve, reject) {
        var iIndex = this.findDeviceIndexByIP(szDeviceIdentify);
        if (iIndex != -1) {
          var oDeviceInfo = m_deviceSet[iIndex];
          oDeviceInfo.oProtocolInc.getZeroChannelInfo(oDeviceInfo, options)
            .then(oData => {
              resolve(oData)
            }, oError => {
              reject(oError)
            })
        } else {
          reject(_oNoLoginError)
        }
      });
      return oPromise
    };
    this.I_StartRealPlay = function (szDeviceIdentify, options) {
      let oPromise = new Promise(function (resolve, reject) {
        var iIndex = this.findDeviceIndexByIP(szDeviceIdentify);
        var newOptions = {
          iWndIndex: m_iSelWnd,
          iStreamType: 1,
          iChannelID: 1,
          bZeroChannel: false
        };
        m_utilsInc.extend(newOptions, options);
        if (iIndex != -1) {
          var oDeviceInfo = m_deviceSet[iIndex];
          var iWndIndex = this.findWndIndexByIndex(newOptions.iWndIndex);
          if (-1 == iWndIndex) {
            oDeviceInfo.oProtocolInc.startRealPlay(oDeviceInfo, newOptions)
              .then(function () {
                if (options.success) {
                  options.success()
                }
                resolve()
              }, function () {
                if (options.error) {
                  options.error(_oUnKnownError)
                }
                reject(_oUnKnownError)
              })
          } else {
            reject({
              errorCode: ERROR_CODE_PLAY_NOREPEATPLAY,
              errorMsg: "The window is already playing."
            })
          }
        } else {
          if (options.error) {
            options.error(_oNoLoginError)
          }
          reject(_oNoLoginError)
        }
      });
      return oPromise
    };
    this.I_StartPlay = function (szDeviceIdentify, options) {
      let oPromise = new Promise(async function (resolve, reject) {
        var iIndex = this.findDeviceIndexByIP(szDeviceIdentify);
        var newOptions = {
          iWndIndex: m_iSelWnd
        };
        m_utilsInc.extend(newOptions, options);
        var oDeviceInfo = m_deviceSet[iIndex];
        iIndex = this.findWndIndexByIndex(newOptions.iWndIndex);
        if (-1 == iIndex) {
          oDeviceInfo.oProtocolInc.startPlay(oDeviceInfo, newOptions)
            .then(function () {
              if (options.success) {
                options.success()
              }
              resolve()
            }, function () {
              if (options.error) {
                options.error(_oUnKnownError)
              }
              reject(_oUnKnownError)
            })
        } else {
          reject({
            errorCode: ERROR_CODE_PLAY_NOREPEATPLAY,
            errorMsg: "The window is already playing."
          })
        }
      });
      return oPromise
    };
    this.I_SetSecretKey = function (szSecretKey) {
      let oPromise = new Promise((resolve, reject) => {
        m_pluginOBJECT.JS_SetSecretKey(0, szSecretKey, 1)
          .then(() => {
            resolve()
          }, () => {
            reject(_oUnKnownError)
          })
      });
      return oPromise
    };
    this.I_GetEncryptString = function (szSecretKey) {
      let oPromise = new Promise((resolve, reject) => {
        m_pluginOBJECT.JS_GetEncryptString(3, szSecretKey)
          .then(szEncode => {
            resolve(szEncode)
          }, () => {
            reject(_oUnKnownError)
          })
      });
      return oPromise
    };
    this.I_Stop = function (options) {
      let oPromise = new Promise(async function (resolve, reject) {
        var newOptions = {
          iWndIndex: m_iSelWnd
        };
        if (m_utilsInc.isObject(options)) {
          m_utilsInc.extend(newOptions, options)
        } else {
          if (!m_utilsInc.isUndefined(options)) {
            newOptions.iWndIndex = options
          }
        }
        var iIndex = this.findWndIndexByIndex(newOptions.iWndIndex);
        if (iIndex != -1) {
          var wndInfo = m_wndSet[iIndex];
          if (wndInfo.bRecord) {
            m_pluginOBJECT.JS_StopSave(wndInfo.iIndex)
          }
          if (wndInfo.bSound) {
            m_pluginOBJECT.JS_CloseSound()
          }
          if (wndInfo.bEZoom) {
            m_pluginOBJECT.JS_DisableZoom(wndInfo.iIndex)
          }
          m_pluginOBJECT.JS_Stop(newOptions.iWndIndex)
            .then(() => {
              m_wndSet.splice(iIndex, 1);
              if (newOptions.success) {
                newOptions.success()
              }
              resolve()
            }, () => {
              if (newOptions.error) {
                newOptions.error(_oUnKnownError)
              }
              reject(_oUnKnownError)
            })
        } else {
          resolve()
        }
      });
      return oPromise
    };
    this.I_StopAllPlay = function () {
      let oPromise = new Promise(async function (resolve, reject) {
        m_pluginOBJECT.JS_StopRealPlayAll()
          .then(() => {
            m_wndSet.length = 0;
            resolve()
          }, () => {
            reject(_oUnKnownError)
          })
      });
      return oPromise
    };
    this.I_OpenSound = function (iWndIndex) {
      iWndIndex = m_utilsInc.isUndefined(iWndIndex) ? m_iSelWnd : iWndIndex;
      let oPromise = new Promise((resolve, reject) => {
        var iIndex = this.findWndIndexByIndex(iWndIndex);
        if (iIndex != -1) {
          var wndInfo = m_wndSet[iIndex];
          if (!wndInfo.bSound) {
            m_pluginOBJECT.JS_OpenSound(iWndIndex)
              .then(() => {
                wndInfo.bSound = true;
                resolve()
              }, () => {
                reject(_oUnKnownError)
              })
          } else {
            reject(_oUnKnownError)
          }
        } else {
          reject(_oUnKnownError)
        }
      });
      return oPromise
    };
    this.I_CloseSound = function (iWndIndex) {
      iWndIndex = m_utilsInc.isUndefined(iWndIndex) ? m_iSelWnd : iWndIndex;
      let oPromise = new Promise((resolve, reject) => {
        var iIndex = this.findWndIndexByIndex(iWndIndex);
        if (iIndex != -1) {
          var wndInfo = m_wndSet[iIndex];
          if (wndInfo.bSound) {
            m_pluginOBJECT.JS_CloseSound()
              .then(() => {
                wndInfo.bSound = false;
                resolve()
              }, () => {
                reject(_oUnKnownError)
              })
          } else {
            reject(_oUnKnownError)
          }
        } else {
          reject(_oUnKnownError)
        }
      });
      return oPromise
    };
    this.I_SetVolume = function (iVolume, iWndIndex) {
      let oPromise = new Promise((resolve, reject) => {
        var iRet = -1;
        iVolume = parseInt(iVolume, 10);
        if (isNaN(iVolume)) {
          reject(_oParamsError);
          return
        }
        if (iVolume < 0 || iVolume > 100) {
          reject(_oParamsError);
          return
        }
        iWndIndex = m_utilsInc.isUndefined(iWndIndex) ? m_iSelWnd : iWndIndex;
        var iIndex = this.findWndIndexByIndex(iWndIndex);
        if (iIndex != -1) {
          m_pluginOBJECT.JS_SetVolume(iWndIndex, iVolume)
            .then(() => {
              resolve()
            }, () => {
              reject(_oUnKnownError)
            })
        } else {
          reject(_oUnKnownError)
        }
      });
      return oPromise
    };
    this.I_CapturePic = function (szPicName, options) {
      let oPromise = new Promise((resolve, reject) => {
        var newOptions = {
          iWndIndex: m_iSelWnd,
          bDateDir: true
        };
        if (m_utilsInc.isObject(options)) {
          m_utilsInc.extend(newOptions, options)
        } else {
          if (!m_utilsInc.isUndefined(options)) {
            newOptions.iWndIndex = options
          }
        }
        var iIndex = this.findWndIndexByIndex(newOptions.iWndIndex);
        if (iIndex != -1) {
          if (".jpg" === szPicName.slice(-4)
            .toLowerCase()) {
            szPicName = szPicName.slice(0, -4)
          } else if (".jpeg" === szPicName.slice(-5)
            .toLowerCase()) {
            szPicName = szPicName.slice(0, -5)
          }
          m_pluginOBJECT.JS_CapturePicture(newOptions.iWndIndex, szPicName, newOptions.bDateDir)
            .then(() => {
              resolve()
            }, () => {
              reject(_oUnKnownError)
            })
        } else {
          reject(_oUnKnownError)
        }
      });
      return oPromise
    };
    this.I_CapturePicData = function (options) {
      let oPromise = new Promise((resolve, reject) => {
        var newOptions = {
          iWndIndex: m_iSelWnd,
          bDateDir: true
        };
        if (m_utilsInc.isObject(options)) {
          m_utilsInc.extend(newOptions, options)
        } else {
          if (!m_utilsInc.isUndefined(options)) {
            newOptions.iWndIndex = options
          }
        }
        var iIndex = this.findWndIndexByIndex(newOptions.iWndIndex);
        if (iIndex != -1) {
          m_pluginOBJECT.JS_GetCaptureData(newOptions.iWndIndex)
            .then(function (data) {
              resolve(data)
            }, function (data) {
              reject(_oUnKnownError)
            })
        } else {
          reject(_oUnKnownError)
        }
      });
      return oPromise
    };
    this.I_StartRecord = function (szFileName, options) {
      let oPromise = new Promise((resolve, reject) => {
        var newOptions = {
          iWndIndex: m_iSelWnd,
          bDateDir: true
        };
        if (m_utilsInc.isObject(options)) {
          m_utilsInc.extend(newOptions, options)
        } else {
          if (!m_utilsInc.isUndefined(options)) {
            newOptions.iWndIndex = options
          }
        }
        var iIndex = this.findWndIndexByIndex(newOptions.iWndIndex);
        if (iIndex != -1) {
          var wndInfo = m_wndSet[iIndex];
          if (!wndInfo.bRecord) {
            m_pluginOBJECT.JS_StartSave(newOptions.iWndIndex, szFileName)
              .then(function () {
                wndInfo.bRecord = true;
                if (newOptions.success) {
                  newOptions.success()
                }
                resolve()
              }, function () {
                if (newOptions.error) {
                  newOptions.error(_oUnKnownError)
                }
                reject(_oUnKnownError)
              })
          } else {
            if (newOptions.error) {
              newOptions.error(_oUnKnownError)
            }
            reject(_oUnKnownError)
          }
        } else {
          if (newOptions.error) {
            newOptions.error(_oUnKnownError)
          }
          reject(_oUnKnownError)
        }
      });
      return oPromise
    };
    this.I_StopRecord = function (options) {
      let oPromise = new Promise((resolve, reject) => {
        var newOptions = {
          iWndIndex: m_iSelWnd
        };
        if (m_utilsInc.isObject(options)) {
          m_utilsInc.extend(newOptions, options)
        } else {
          if (!m_utilsInc.isUndefined(options)) {
            newOptions.iWndIndex = options
          }
        }
        var iIndex = this.findWndIndexByIndex(newOptions.iWndIndex);
        if (iIndex != -1) {
          var wndInfo = m_wndSet[iIndex];
          if (wndInfo.bRecord) {
            m_pluginOBJECT.JS_StopSave(newOptions.iWndIndex)
              .then(function () {
                wndInfo.bRecord = false;
                if (newOptions.success) {
                  newOptions.success()
                }
                resolve()
              }, function () {
                if (newOptions.error) {
                  newOptions.error(_oUnKnownError)
                }
                reject(_oUnKnownError)
              })
          } else {
            if (newOptions.error) {
              newOptions.error(_oUnKnownError)
            }
            reject(_oUnKnownError)
          }
        } else {
          if (newOptions.error) {
            newOptions.error(_oUnKnownError)
          }
          reject(_oUnKnownError)
        }
      });
      return oPromise
    };
    this.I_StartVoiceTalk = function (szDeviceIdentify, iAudioChannel) {
      let oPromise = new Promise((resolve, reject) => {
        if (isNaN(parseInt(iAudioChannel, 10))) {
          reject(_oParamsError);
          return
        }
        var iIndex = this.findDeviceIndexByIP(szDeviceIdentify);
        if (iIndex != -1) {
          var oDeviceInfo = m_deviceSet[iIndex];
          if (!oDeviceInfo.bVoiceTalk) {
            oDeviceInfo.oProtocolInc.startVoiceTalk(oDeviceInfo, iAudioChannel)
              .then(() => {
                m_deviceSet[iIndex].bVoiceTalk = true;
                resolve()
              }, () => {
                reject(_oUnKnownError)
              })
          } else {
            reject(_oUnKnownError)
          }
        } else {
          reject(_oUnKnownError)
        }
      });
      return oPromise
    };
    this.I_StopVoiceTalk = function () {
      let oPromise = new Promise((resolve, reject) => {
        m_pluginOBJECT.JS_StopTalk()
          .then(() => {
            for (var i = 0, iLen = m_deviceSet.length; i < iLen; i++) {
              if (m_deviceSet[i].bVoiceTalk) {
                m_deviceSet[i].bVoiceTalk = false;
                break
              }
            }
            resolve()
          }, () => {
            reject(_oUnKnownError)
          })
      });
      return oPromise
    };
    this.I_StartAudioPlay = function (szDeviceIdentify, options) {
      let oPromise = new Promise((resolve, reject) => {
        var iIndex = this.findDeviceIndexByIP(szDeviceIdentify);
        if (iIndex != -1) {
          var oDeviceInfo = m_deviceSet[iIndex];
          options.szAuth = oDeviceInfo.szAuth;
          if (!oDeviceInfo.bVoiceTalk) {
            oDeviceInfo.oProtocolInc.audioPlay(options)
              .then(() => {
                m_deviceSet[iIndex].bVoiceTalk = true;
                resolve()
              }, () => {
                reject(_oUnKnownError)
              })
          } else {
            reject(_oUnKnownError)
          }
        } else {
          reject(_oUnKnownError)
        }
      });
      return oPromise
    };
    this.I_StopAudioPlay = function () {
      let oPromise = new Promise((resolve, reject) => {
        m_pluginOBJECT.JS_StopAudioPlay()
          .then(() => {
            for (var i = 0, iLen = m_deviceSet.length; i < iLen; i++) {
              if (m_deviceSet[i].bVoiceTalk) {
                m_deviceSet[i].bVoiceTalk = false;
                break
              }
            }
            resolve()
          }, () => {
            reject(_oUnKnownError)
          })
      });
      return oPromise
    };
    this.I_PTZControl = function (iPTZIndex, bStop, options) {
      let oPromise = new Promise((resolve, reject) => {
        var newOptions = {
          iWndIndex: m_iSelWnd,
          iPTZIndex: iPTZIndex,
          iPTZSpeed: 4
        };
        m_utilsInc.extend(newOptions, options);
        var iIndex = this.findWndIndexByIndex(newOptions.iWndIndex);
        if (iIndex != -1) {
          var wndInfo = m_wndSet[iIndex];
          iIndex = this.findDeviceIndexByIP(wndInfo.szIP);
          if (iIndex != -1) {
            var oDeviceInfo = m_deviceSet[iIndex];
            if (9 == iPTZIndex) {
              oDeviceInfo.oProtocolInc.ptzAutoControl(oDeviceInfo, bStop, wndInfo, newOptions)
                .then(() => {
                  resolve()
                }, oError => {
                  reject(oError)
                })
            } else {
              oDeviceInfo.oProtocolInc.ptzControl(oDeviceInfo, bStop, wndInfo, newOptions)
                .then(() => {
                  resolve()
                }, oError => {
                  reject(oError)
                })
            }
          }
        }
      });
      return oPromise
    };
    this.I_EnableEZoom = function (iWndIndex) {
      let oPromise = new Promise((resolve, reject) => {
        iWndIndex = m_utilsInc.isUndefined(iWndIndex) ? m_iSelWnd : iWndIndex;
        var iIndex = this.findWndIndexByIndex(iWndIndex);
        if (iIndex != -1) {
          var wndInfo = m_wndSet[iIndex];
          if (!wndInfo.bEZoom) {
            m_pluginOBJECT.JS_EnableZoom(iWndIndex)
              .then(() => {
                wndInfo.bEZoom = true;
                resolve()
              }, () => {
                reject(_oUnKnownError)
              })
          }
        } else {
          reject(_oUnKnownError)
        }
      });
      return oPromise
    };
    this.I_DisableEZoom = function (iWndIndex) {
      let oPromise = new Promise((resolve, reject) => {
        iWndIndex = m_utilsInc.isUndefined(iWndIndex) ? m_iSelWnd : iWndIndex;
        var iIndex = this.findWndIndexByIndex(iWndIndex);
        if (iIndex != -1) {
          var wndInfo = m_wndSet[iIndex];
          if (wndInfo.bEZoom) {
            m_pluginOBJECT.JS_DisableZoom(iWndIndex)
              .then(() => {
                wndInfo.bEZoom = false;
                resolve()
              }, () => {
                reject(_oUnKnownError)
              })
          } else {
            resolve()
          }
        } else {
          reject(_oUnKnownError)
        }
      });
      return oPromise
    };
    this.I_Enable3DZoom = function (iWndIndex) {
      let oPromise = new Promise((resolve, reject) => {
        iWndIndex = m_utilsInc.isUndefined(iWndIndex) ? m_iSelWnd : iWndIndex;
        var iIndex = this.findWndIndexByIndex(iWndIndex);
        if (iIndex != -1) {
          var wndInfo = m_wndSet[iIndex];
          if (!wndInfo.b3DZoom) {
            m_pluginOBJECT.JS_SetDrawCallback(iWndIndex, true, "Rect", false, function (oRect) {
              _onZoomInfoCallback(oRect.points)
            });
            wndInfo.b3DZoom = true;
            resolve()
          } else {
            resolve()
          }
        } else {
          reject(_oUnKnownError)
        }
      });
      return oPromise
    };
    this.I_Disable3DZoom = function (iWndIndex) {
      let oPromise = new Promise((resolve, reject) => {
        iWndIndex = m_utilsInc.isUndefined(iWndIndex) ? m_iSelWnd : iWndIndex;
        var iIndex = this.findWndIndexByIndex(iWndIndex);
        if (iIndex != -1) {
          var wndInfo = m_wndSet[iIndex];
          if (wndInfo.b3DZoom) {
            m_pluginOBJECT.JS_SetDrawCallback(iWndIndex, false, "Rect", false, function () { });
            wndInfo.b3DZoom = false;
            resolve()
          } else {
            resolve()
          }
        } else {
          reject(_oUnKnownError)
        }
      });
      return oPromise
    };
    this.I_FullScreen = function (bFull) {
      let oPromise = new Promise(function (resolve, reject) {
        m_pluginOBJECT.JS_FullScreenDisplay(bFull)
          .then(() => {
            resolve()
          }, () => {
            reject(_oUnKnownError)
          })
      });
      return oPromise
    };
    this.I_SetPreset = function (iPresetID, options) {
      let oPromise = new Promise(function (resolve, reject) {
        var newOptions = {
          iWndIndex: m_iSelWnd,
          iPresetID: iPresetID
        };
        m_utilsInc.extend(newOptions, options);
        var iIndex = this.findWndIndexByIndex(newOptions.iWndIndex);
        if (iIndex != -1) {
          var wndInfo = m_wndSet[iIndex];
          iIndex = this.findDeviceIndexByIP(wndInfo.szIP);
          if (iIndex != -1) {
            var oDeviceInfo = m_deviceSet[iIndex];
            oDeviceInfo.oProtocolInc.setPreset(oDeviceInfo, wndInfo, newOptions)
              .then(() => {
                resolve()
              }, oError => {
                reject(oError)
              })
          } else {
            reject(_oUnKnownError)
          }
        } else {
          reject(_oUnKnownError)
        }
      });
      return oPromise
    };
    this.I_GoPreset = function (iPresetID, options) {
      let oPromise = new Promise(async function (resolve, reject) {
        var newOptions = {
          iWndIndex: m_iSelWnd,
          iPresetID: iPresetID
        };
        m_utilsInc.extend(newOptions, options);
        var iIndex = this.findWndIndexByIndex(newOptions.iWndIndex);
        if (iIndex != -1) {
          var wndInfo = m_wndSet[iIndex];
          iIndex = this.findDeviceIndexByIP(wndInfo.szIP);
          if (iIndex != -1) {
            var oDeviceInfo = m_deviceSet[iIndex];
            oDeviceInfo.oProtocolInc.goPreset(oDeviceInfo, wndInfo, newOptions)
              .then(() => {
                resolve()
              }, oError => {
                reject(oError)
              })
          } else {
            reject(_oUnKnownError)
          }
        } else {
          reject(_oUnKnownError)
        }
      });
      return oPromise
    };
    this.I_RecordSearch = function (szDeviceIdentify, iChannelID, szStartTime, szEndTime, options) {
      let oPromise = new Promise(async function (resolve, reject) {
        var iIndex = this.findDeviceIndexByIP(szDeviceIdentify);
        if (iIndex != -1) {
          var oDeviceInfo = m_deviceSet[iIndex];
          if (oDeviceInfo.szDeviceType === DEVICE_TYPE_IPCAMERA || oDeviceInfo.szDeviceType === DEVICE_TYPE_IPDOME || oDeviceInfo.szDeviceType === DEVICE_TYPE_IPZOOM) {
            szStartTime = m_utilsInc.convertToUTCTime(szStartTime);
            szEndTime = m_utilsInc.convertToUTCTime(szEndTime)
          }
          var newOptions = {
            iChannelID: iChannelID,
            szStartTime: szStartTime,
            szEndTime: szEndTime,
            iSearchPos: 0,
            iStreamType: 1
          };
          m_utilsInc.extend(newOptions, options);
          newOptions.success = null;
          oDeviceInfo.oProtocolInc.recordSearch(oDeviceInfo, newOptions)
            .then(oData => {
              if (oDeviceInfo.szDeviceType === DEVICE_TYPE_IPCAMERA || oDeviceInfo.szDeviceType === DEVICE_TYPE_IPDOME || oDeviceInfo.szDeviceType === DEVICE_TYPE_IPZOOM) {
                var szRecordStartTime = "";
                var szRecordEndTime = "";
                for (var i = 0, nLen = $(oData)
                  .find("searchMatchItem")
                  .length; i < nLen; i++) {
                  szRecordStartTime = $(oData)
                    .find("startTime")
                    .eq(i)
                    .text();
                  szRecordEndTime = $(oData)
                    .find("endTime")
                    .eq(i)
                    .text();
                  szRecordStartTime = m_utilsInc.convertToLocalTime(szRecordStartTime, oDeviceInfo.iDeviceMinusLocalTime);
                  szRecordEndTime = m_utilsInc.convertToLocalTime(szRecordEndTime, oDeviceInfo.iDeviceMinusLocalTime);
                  $(oData)
                    .find("startTime")
                    .eq(i)
                    .text(szRecordStartTime);
                  $(oData)
                    .find("endTime")
                    .eq(i)
                    .text(szRecordEndTime)
                }
              }
              if (options.success) {
                options.success(oData)
              }
              resolve(oData)
            }, oError => {
              reject(oError)
            })
        } else {
          reject(_oNoLoginError)
        }
      });
      return oPromise
    };
    this.I_StartPlayback = function (szDeviceIdentify, options) {
      let oPromise = new Promise(function (resolve, reject) {
        var iIndex = this.findDeviceIndexByIP(szDeviceIdentify),
          cgi = "",
          urlProtocol = "",
          iChannelID = 1,
          iStream = 0;
        var szCurTime = m_utilsInc.dateFormat(new Date, "yyyy-MM-dd");
        var newOptions = {
          iWndIndex: m_iSelWnd,
          iStreamType: 1,
          iChannelID: 1,
          szStartTime: szCurTime + " 00:00:00",
          szEndTime: szCurTime + " 23:59:59"
        };
        m_utilsInc.extend(newOptions, options);
        if (iIndex != -1) {
          var oDeviceInfo = m_deviceSet[iIndex];
          cgi = oDeviceInfo.oProtocolInc.CGI.startPlayback;
          urlProtocol = "rtsp://";
          iStream = newOptions.iStreamType;
          iChannelID = newOptions.iChannelID * 100 + iStream;
          m_utilsInc.extend(newOptions, {
            urlProtocol: urlProtocol,
            cgi: cgi,
            iChannelID: iChannelID
          });
          iIndex = this.findWndIndexByIndex(newOptions.iWndIndex);
          if (-1 == iIndex) {
            if (oDeviceInfo.szDeviceType === DEVICE_TYPE_IPCAMERA || oDeviceInfo.szDeviceType === DEVICE_TYPE_IPDOME || oDeviceInfo.szDeviceType === DEVICE_TYPE_IPZOOM) {
              newOptions.szStartTime = m_utilsInc.convertToUTCTime(newOptions.szStartTime);
              newOptions.szEndTime = m_utilsInc.convertToUTCTime(newOptions.szEndTime)
            }
            newOptions.szStartTime = newOptions.szStartTime.replace(/[-:]/g, "")
              .replace(" ", "T") + "Z";
            newOptions.szEndTime = newOptions.szEndTime.replace(/[-:]/g, "")
              .replace(" ", "T") + "Z";
            oDeviceInfo.oProtocolInc.startPlayback(oDeviceInfo, newOptions)
              .then(function () {
                if (options.success) {
                  options.success()
                }
                resolve()
              }, function () {
                if (options.error) {
                  options.error(_oUnKnownError)
                }
                reject(_oUnKnownError)
              })
          }
        } else {
          if (options.error) {
            options.error(_oNoLoginError)
          }
          reject(_oNoLoginError)
        }
      });
      return oPromise
    };
    this.I_ReversePlayback = function (szDeviceIdentify, options) {
      let oPromise = new Promise(function (resolve, reject) {
        var iIndex = this.findDeviceIndexByIP(szDeviceIdentify),
          iRet = -1,
          cgi = "",
          urlProtocol = "",
          iPort = -1,
          iChannelID = -1,
          iStream = 0;
        var szCurTime = m_utilsInc.dateFormat(new Date, "yyyy-MM-dd");
        var newOptions = {
          iWndIndex: m_iSelWnd,
          iStreamType: 1,
          iChannelID: 1,
          szStartTime: szCurTime + " 00:00:00",
          szEndTime: szCurTime + " 23:59:59"
        };
        m_utilsInc.extend(newOptions, options);
        if (iIndex != -1) {
          var oDeviceInfo = m_deviceSet[iIndex];
          var iProtocolType = parseInt(m_oLocalCfg.protocolType, 10);
          cgi = oDeviceInfo.oProtocolInc.CGI.startPlayback;
          urlProtocol = "rtsp://";
          iStream = newOptions.iStreamType;
          iChannelID = newOptions.iChannelID * 100 + iStream;
          m_utilsInc.extend(newOptions, {
            urlProtocol: urlProtocol,
            cgi: cgi,
            iChannelID: iChannelID
          });
          iIndex = this.findWndIndexByIndex(newOptions.iWndIndex);
          if (-1 == iIndex) {
            newOptions.szStartTime = newOptions.szStartTime.replace(/[-:]/g, "")
              .replace(" ", "T") + "Z";
            newOptions.szEndTime = newOptions.szEndTime.replace(/[-:]/g, "")
              .replace(" ", "T") + "Z";
            oDeviceInfo.oProtocolInc.reversePlayback(oDeviceInfo, newOptions)
              .then(function () {
                if (options.success) {
                  options.success()
                }
                resolve()
              }, function () {
                if (options.error) {
                  options.error(_oUnKnownError)
                }
                reject(_oUnKnownError)
              })
          }
        }
      });
      return oPromise
    };
    this.I_Frame = function (options) {
      let oPromise = new Promise(async function (resolve, reject) {
        var newOptions = {
          iWndIndex: m_iSelWnd
        };
        if (m_utilsInc.isObject(options)) {
          m_utilsInc.extend(newOptions, options)
        } else {
          if (!m_utilsInc.isUndefined(options)) {
            newOptions.iWndIndex = options
          }
        }
        var iIndex = this.findWndIndexByIndex(newOptions.iWndIndex);
        if (iIndex != -1) {
          var wndInfo = m_wndSet[iIndex],
            iPlayStatus = wndInfo.iPlayStatus;
          if (iPlayStatus == PLAY_STATUS_PLAYBACK || iPlayStatus == PLAY_STATUS_FRAME) {
            m_pluginOBJECT.JS_FrameForward(newOptions.iWndIndex)
              .then(function () {
                wndInfo.iPlayStatus = PLAY_STATUS_FRAME;
                if (newOptions.success) {
                  newOptions.success()
                }
                resolve()
              }, function () {
                if (newOptions.error) {
                  newOptions.error(_oUnKnownError)
                }
                reject(_oUnKnownError)
              })
          } else {
            if (newOptions.error) {
              newOptions.error(_oUnKnownError)
            }
            reject(_oUnKnownError)
          }
        } else {
          if (newOptions.error) {
            newOptions.error(_oUnKnownError)
          }
          reject(_oUnKnownError)
        }
      });
      return oPromise
    };
    this.I_Pause = function (options) {
      let oPromise = new Promise(async function (resolve, reject) {
        var newOptions = {
          iWndIndex: m_iSelWnd
        };
        if (m_utilsInc.isObject(options)) {
          m_utilsInc.extend(newOptions, options)
        } else {
          if (!m_utilsInc.isUndefined(options)) {
            newOptions.iWndIndex = options
          }
        }
        var iIndex = this.findWndIndexByIndex(newOptions.iWndIndex);
        if (iIndex != -1) {
          var wndInfo = m_wndSet[iIndex],
            iPlayStatus = wndInfo.iPlayStatus,
            iNextStatus = -1;
          if (iPlayStatus == PLAY_STATUS_PLAYBACK) {
            iNextStatus = PLAY_STATUS_PAUSE
          } else if (iPlayStatus == PLAY_STATUS_REVERSE_PLAYBACK) {
            iNextStatus = PLAY_STATUS_REVERSE_PAUSE
          } else {
            if (newOptions.error) {
              newOptions.error(_oUnKnownError)
            }
            reject(_oUnKnownError);
            return
          }
          m_pluginOBJECT.JS_Pause(newOptions.iWndIndex)
            .then(function () {
              wndInfo.iPlayStatus = iNextStatus;
              if (newOptions.success) {
                newOptions.success()
              }
              resolve()
            }, function () {
              if (newOptions.error) {
                newOptions.error(_oUnKnownError)
              }
              reject(_oUnKnownError)
            })
        } else {
          if (newOptions.error) {
            newOptions.error(_oUnKnownError)
          }
          reject(_oUnKnownError)
        }
      });
      return oPromise
    };
    this.I_Resume = function (options) {
      let oPromise = new Promise(async function (resolve, reject) {
        var newOptions = {
          iWndIndex: m_iSelWnd
        };
        if (m_utilsInc.isObject(options)) {
          m_utilsInc.extend(newOptions, options)
        } else {
          if (!m_utilsInc.isUndefined(options)) {
            newOptions.iWndIndex = options
          }
        }
        var iIndex = this.findWndIndexByIndex(newOptions.iWndIndex);
        if (iIndex != -1) {
          var wndInfo = m_wndSet[iIndex],
            iPlayStatus = wndInfo.iPlayStatus,
            iNextStatus = -1;
          if (iPlayStatus == PLAY_STATUS_PAUSE || iPlayStatus == PLAY_STATUS_FRAME) {
            iNextStatus = PLAY_STATUS_PLAYBACK
          } else if (iPlayStatus == PLAY_STATUS_REVERSE_PAUSE) {
            iNextStatus = PLAY_STATUS_REVERSE_PLAYBACK
          } else {
            if (newOptions.error) {
              newOptions.error(_oUnKnownError)
            }
            reject(_oUnKnownError);
            return
          }
          m_pluginOBJECT.JS_Resume(newOptions.iWndIndex)
            .then(function () {
              wndInfo.iPlayStatus = iNextStatus;
              if (newOptions.success) {
                newOptions.success()
              }
              resolve()
            }, function () {
              if (newOptions.error) {
                newOptions.error(_oUnKnownError)
              }
              reject(_oUnKnownError)
            })
        } else {
          if (newOptions.error) {
            newOptions.error(_oUnKnownError)
          }
          reject(_oUnKnownError)
        }
      });
      return oPromise
    };
    this.I_PlaySlow = function (options) {
      let oPromise = new Promise(async function (resolve, reject) {
        var newOptions = {
          iWndIndex: m_iSelWnd
        };
        if (m_utilsInc.isObject(options)) {
          m_utilsInc.extend(newOptions, options)
        } else {
          if (!m_utilsInc.isUndefined(options)) {
            newOptions.iWndIndex = options
          }
        }
        var iIndex = this.findWndIndexByIndex(newOptions.iWndIndex);
        if (iIndex != -1) {
          var wndInfo = m_wndSet[iIndex];
          if (wndInfo.iPlayStatus == PLAY_STATUS_PLAYBACK) {
            m_pluginOBJECT.JS_Slow(newOptions.iWndIndex)
              .then(function () {
                if (newOptions.success) {
                  newOptions.success()
                }
                resolve()
              }, function () {
                if (newOptions.error) {
                  newOptions.error(_oUnKnownError)
                }
                reject(_oUnKnownError)
              })
          } else {
            if (newOptions.error) {
              newOptions.error(_oUnKnownError)
            }
            reject(_oUnKnownError)
          }
        } else {
          if (newOptions.error) {
            newOptions.error(_oUnKnownError)
          }
          reject(_oUnKnownError)
        }
      });
      return oPromise
    };
    this.I_PlayFast = function (options) {
      let oPromise = new Promise(async function (resolve, reject) {
        var newOptions = {
          iWndIndex: m_iSelWnd
        };
        if (m_utilsInc.isObject(options)) {
          m_utilsInc.extend(newOptions, options)
        } else {
          if (!m_utilsInc.isUndefined(options)) {
            newOptions.iWndIndex = options
          }
        }
        var iIndex = this.findWndIndexByIndex(newOptions.iWndIndex);
        if (iIndex != -1) {
          var wndInfo = m_wndSet[iIndex];
          if (wndInfo.iPlayStatus == PLAY_STATUS_PLAYBACK) {
            m_pluginOBJECT.JS_Fast(newOptions.iWndIndex)
              .then(function () {
                if (newOptions.success) {
                  newOptions.success()
                }
                resolve()
              }, function () {
                if (newOptions.error) {
                  newOptions.error(_oUnKnownError)
                }
                reject(_oUnKnownError)
              })
          } else {
            if (newOptions.error) {
              newOptions.error(_oUnKnownError)
            }
            reject(_oUnKnownError)
          }
        } else {
          if (newOptions.error) {
            newOptions.error(_oUnKnownError)
          }
          reject(_oUnKnownError)
        }
      });
      return oPromise
    };
    this.I_GetOSDTime = function (options) {
      let oPromise = new Promise(async function (resolve, reject) {
        var newOptions = {
          iWndIndex: m_iSelWnd
        };
        if (m_utilsInc.isObject(options)) {
          m_utilsInc.extend(newOptions, options)
        } else {
          if (!m_utilsInc.isUndefined(options)) {
            newOptions.iWndIndex = options
          }
        }
        var iIndex = this.findWndIndexByIndex(newOptions.iWndIndex);
        if (iIndex != -1) {
          m_pluginOBJECT.JS_GetOSDTime(newOptions.iWndIndex)
            .then(function (iTime) {
              if (newOptions.success) {
                var szOSDTime = m_utilsInc.dateFormat(new Date(iTime * 1e3), "yyyy-MM-dd hh:mm:ss");
                newOptions.success(szOSDTime)
              }
              resolve(szOSDTime)
            }, function () {
              if (newOptions.error) {
                newOptions.error(_oUnKnownError)
              }
              reject(_oUnKnownError)
            })
        } else {
          if (newOptions.error) {
            newOptions.error(_oUnKnownError)
          }
          reject(_oUnKnownError)
        }
      });
      return oPromise
    };
    this.I_StartDownloadRecord = function (szDeviceIdentify, szPlaybackURI, szFileName, options) {
      let oPromise = new Promise((resolve, reject) => {
        var iIndex = this.findDeviceIndexByIP(szDeviceIdentify);
        if (iIndex != -1) {
          var oDeviceInfo = m_deviceSet[iIndex];
          var newOptions = {
            szPlaybackURI: szPlaybackURI,
            szFileName: szFileName + ".mp4",
            bDateDir: true
          };
          if (!m_utilsInc.isUndefined(options)) {
            m_utilsInc.extend(newOptions, options)
          }
          oDeviceInfo.oProtocolInc.startDownloadRecord(oDeviceInfo, newOptions)
            .then(iDownloadID => {
              resolve(iDownloadID)
            }, oError => {
              reject(oError)
            })
        } else {
          reject(_oNoLoginError)
        }
      });
      return oPromise
    };
    this.I_StartDownloadRecordByTime = function (szDeviceIdentify, szPlaybackURI, szFileName, szStartTime, szEndTime, options) {
      let oPromise = new Promise((resolve, reject) => {
        var iIndex = this.findDeviceIndexByIP(szDeviceIdentify);
        if (iIndex != -1) {
          var oDeviceInfo = m_deviceSet[iIndex];
          szPlaybackURI = szPlaybackURI.split("?")[0] + "?starttime=" + szStartTime.replace(" ", "T") + "Z&endtime=" + szEndTime.replace(" ", "T") + "Z";
          var newOptions = {
            szPlaybackURI: szPlaybackURI,
            szFileName: szFileName + ".mp4",
            bDateDir: true
          };
          if (!m_utilsInc.isUndefined(options)) {
            m_utilsInc.extend(newOptions, options)
          }
          oDeviceInfo.oProtocolInc.startDownloadRecord(oDeviceInfo, newOptions)
            .then(iDownloadID => {
              resolve(iDownloadID)
            }, oError => {
              reject(oError)
            })
        }
      });
      return oPromise
    };
    this.I_GetDownloadStatus = function (iDownloadID) {
      let oPromise = new Promise((resolve, reject) => {
        m_pluginOBJECT.JS_GetDownloadStatus(iDownloadID)
          .then(data => {
            resolve(data)
          }, () => {
            reject(_oUnKnownError)
          })
      });
      return oPromise
    };
    this.I_GetDownloadProgress = function (iDownloadID) {
      let oPromise = new Promise((resolve, reject) => {
        m_pluginOBJECT.JS_GetDownloadProgress(iDownloadID)
          .then(data => {
            resolve(data)
          }, () => {
            reject(_oUnKnownError)
          })
      });
      return oPromise
    };
    this.I_StopDownloadRecord = function (iDownloadID) {
      let oPromise = new Promise((resolve, reject) => {
        m_pluginOBJECT.JS_StopAsyncDownload(iDownloadID)
          .then(() => {
            resolve()
          }, () => {
            reject(_oUnKnownError)
          })
      });
      return oPromise
    };
    this.I_ExportDeviceConfig = function (szDeviceIdentify) {
      let oPromise = new Promise((resolve, reject) => {
        var iIndex = this.findDeviceIndexByIP(szDeviceIdentify);
        if (iIndex != -1) {
          var oDeviceInfo = m_deviceSet[iIndex];
          oDeviceInfo.oProtocolInc.exportDeviceConfig(oDeviceInfo)
            .then(() => {
              resolve()
            }, () => {
              reject(_oUnKnownError)
            })
        } else {
          reject(_oNoLoginError)
        }
      });
      return oPromise
    };
    this.I_ImportDeviceConfig = function (szDeviceIdentify, szFileName) {
      let oPromise = new Promise((resolve, reject) => {
        var iIndex = this.findDeviceIndexByIP(szDeviceIdentify);
        if (iIndex != -1) {
          var oDeviceInfo = m_deviceSet[iIndex];
          var newOptions = {
            szFileName: szFileName
          };
          oDeviceInfo.oProtocolInc.importDeviceConfig(oDeviceInfo, newOptions)
            .then(() => {
              resolve()
            }, () => {
              reject(_oUnKnownError)
            })
        } else {
          reject(_oNoLoginError)
        }
      });
      return oPromise
    };
    this.I_RestoreDefault = function (szDeviceIdentify, szMode, options) {
      let oPromise = new Promise((resolve, reject) => {
        var newOptions = {
          success: null,
          error: null
        };
        m_utilsInc.extend(newOptions, options);
        var iIndex = this.findDeviceIndexByIP(szDeviceIdentify);
        if (iIndex != -1) {
          var oDeviceInfo = m_deviceSet[iIndex];
          oDeviceInfo.oProtocolInc.restore(oDeviceInfo, szMode, newOptions)
            .then(() => {
              resolve()
            }, oError => {
              reject(oError)
            })
        } else {
          reject(_oNoLoginError)
        }
      });
      return oPromise
    };
    this.I_Restart = function (szDeviceIdentify, options) {
      let oPromise = new Promise((resolve, reject) => {
        var newOptions = {
          success: null,
          error: null
        };
        m_utilsInc.extend(newOptions, options);
        var iIndex = this.findDeviceIndexByIP(szDeviceIdentify);
        if (iIndex != -1) {
          var oDeviceInfo = m_deviceSet[iIndex];
          oDeviceInfo.oProtocolInc.restart(oDeviceInfo, newOptions)
            .then(() => {
              resolve()
            }, oError => {
              reject(oError)
            })
        } else {
          reject(_oNoLoginError)
        }
      });
      return oPromise
    };
    this.I_Reconnect = function (szDeviceIdentify, options) {
      let oPromise = new Promise((resolve, reject) => {
        var newOptions = {
          success: null,
          error: null
        };
        m_utilsInc.extend(newOptions, options);
        var iIndex = this.findDeviceIndexByIP(szDeviceIdentify);
        if (iIndex != -1) {
          var oDeviceInfo = m_deviceSet[iIndex];
          oDeviceInfo.oProtocolInc.login(oDeviceInfo.szIP, oDeviceInfo.iCGIPort, oDeviceInfo.szAuth, newOptions)
            .then(() => {
              resolve()
            }, oError => {
              reject(oError)
            })
        } else {
          reject(_oNoLoginError)
        }
      });
      return oPromise
    };
    this.I_StartUpgrade = function (szDeviceIdentify, szFileName) {
      let oPromise = new Promise((resolve, reject) => {
        var iIndex = this.findDeviceIndexByIP(szDeviceIdentify);
        if (iIndex != -1) {
          var oDeviceInfo = m_deviceSet[iIndex];
          oDeviceInfo.oProtocolInc.startUpgrade(oDeviceInfo, szFileName)
            .then(() => {
              resolve()
            }, () => {
              reject(_oUnKnownError)
            })
        } else {
          reject(_oNoLoginError)
        }
      });
      return oPromise
    };
    this.I_UpgradeStatus = function (szDeviceIdentify) {
      let oPromise = new Promise((resolve, reject) => {
        this.I_SendHTTPRequest(szDeviceIdentify, m_ISAPIProtocol.CGI.startUpgrade.status, {})
          .then(data => {
            var bUpgrading = $(data)
              .find("upgrading")
              .eq(0)
              .text() === "true";
            resolve(bUpgrading)
          }, () => {
            reject(_oUnKnownError)
          })
      });
      return oPromise
    };
    this.I_UpgradeProgress = function (szDeviceIdentify) {
      let oPromise = new Promise((resolve, reject) => {
        this.I_SendHTTPRequest(szDeviceIdentify, m_ISAPIProtocol.CGI.startUpgrade.status, {})
          .then(data => {
            var iPercent = parseInt($(data)
              .find("percent")
              .eq(0)
              .text(), 10);
            resolve(iPercent)
          }, () => {
            reject(_oUnKnownError)
          })
      });
      return oPromise
    };
    this.I_StopUpgrade = function () {
      let oPromise = new Promise((resolve, reject) => {
        m_pluginOBJECT.JS_StopUpgrade()
          .then(() => {
            resolve()
          }, () => {
            reject(_oUnKnownError)
          })
      });
      return oPromise
    };
    this.I_CheckPluginInstall = function () {
      return true
    };
    this.I_CheckPluginVersion = function () {
      let oPromise = new Promise((resolve, reject) => {
        m_pluginOBJECT.JS_CheckUpdate(m_szVersion)
          .then(bFlag => {
            resolve(bFlag)
          }, () => {
            reject(_oUnKnownError)
          })
      });
      return oPromise
    };
    this.I_SendHTTPRequest = function (szDeviceIdentify, szURI, options) {
      let oPromise = new Promise(async function (resolve, reject) {
        var httpClient = new HttpPluginClient;
        var szURL = "";
        var szAuth = "";
        var iIndex = this.findDeviceIndexByIP(szDeviceIdentify);
        if (iIndex >= 0) {
          if ("%" === szURI.substr(0, 1)) {
            szURI = szURI.substr(8)
          }
          var oDeviceInfo = m_deviceSet[iIndex];
          szURL = oDeviceInfo.szHttpProtocol + oDeviceInfo.szIP + ":" + oDeviceInfo.iCGIPort + "/" + szURI;
          szAuth = oDeviceInfo.szAuth
        }
        var newOptions = {
          type: "GET",
          url: szURL,
          auth: szAuth,
          success: null,
          error: null
        };
        m_utilsInc.extend(newOptions, options);
        httpClient.submitRequest(newOptions)
          .then(function (oRes) {
            if (200 === oRes.httpStatusCode) {
              let oData;
              if (0 === oRes.httpResponse.indexOf("<?xml")) {
                oData = m_utilsInc.loadXML(oRes.httpResponse)
              } else {
                oData = JSON.parse(oRes.httpResponse)
              }
              options.success && options.success(oData);
              resolve(oData)
            } else if (200 !== oRes.httpStatusCode) {
              let oData = m_utilsInc.loadXML(oRes.httpResponse);
              if (!oData) {
                oData = JSON.parse(oRes.httpResponse)
              }
              options.error && options.error({
                errorCode: oRes.httpStatusCode,
                errorMsg: oData
              });
              reject({
                errorCode: oRes.httpStatusCode,
                errorMsg: oData
              })
            }
          }, function (errorCode) {
            if (options.error) {
              options.error({
                errorCode: errorCode,
                errorMsg: ""
              })
            }
            reject({
              errorCode: errorCode,
              errorMsg: ""
            })
          })
      });
      return oPromise
    };
    this.I_ChangeWndNum = function (iWndType) {
      let oPromise = new Promise((resolve, reject) => {
        m_pluginOBJECT.JS_ArrangeWindow(iWndType)
          .then(() => {
            resolve()
          }, () => {
            reject(_oUnKnownError)
          })
      });
      return oPromise
    };
    this.I_GetLastError = function () {
      let oPromise = new Promise((resolve, reject) => {
        m_pluginOBJECT.JS_GetLastError()
          .then(data => {
            resolve(data)
          }, () => {
            reject(_oUnKnownError)
          })
      });
      return oPromise
    };
    this.I_GetWindowStatus = function (iWndIndex) {
      if (m_utilsInc.isUndefined(iWndIndex)) {
        var wndSet = [];
        m_utilsInc.extend(wndSet, m_wndSet);
        return wndSet
      } else {
        var i = this.findWndIndexByIndex(iWndIndex);
        if (i != -1) {
          var wndSet = {};
          m_utilsInc.extend(wndSet, m_wndSet[i]);
          return wndSet
        } else {
          return null
        }
      }
    };
    this.I_GetIPInfoByMode = function (iMode, szAddress, iPort, szDeviceInfo) {
      return
    };
    this.I_SetPlayModeType = function (iMode) {
      let oPromise = new Promise((resolve, reject) => {
        m_pluginOBJECT.JS_SetPlayMode(iMode)
          .then(() => {
            resolve()
          }, () => {
            reject(_oUnKnownError)
          })
      });
      return oPromise
    };
    this.I_SetSnapDrawMode = function (iWndIndex, iMode) {
      let bType = false;
      if (iMode !== -1) {
        bType = true
      }
      let oPromise = new Promise((resolve, reject) => {
        m_pluginOBJECT.JS_SetDrawStatus(bType, iMode)
          .then(() => {
            resolve()
          }, () => {
            reject(_oUnKnownError)
          })
      });
      return oPromise
    };
    this.I_SetSnapPolygonInfo = function (iWndIndex, szInfo) {
      let oPromise = new Promise((resolve, reject) => {
        var aP = [];
        var oData = m_utilsInc.formatPolygonXmlToJson(szInfo);
        if (oData.aAddRect.length > 0) {
          aP.push(m_pluginOBJECT.JS_SetDrawShapeInfo("Rect", oData.aAddRect[0]))
        }
        if (oData.aAddPolygon.length > 0) {
          aP.push(m_pluginOBJECT.JS_SetDrawShapeInfo("Polygon", oData.aAddPolygon[0]))
        }
        if (oData.aRect.length > 0) {
          aP.push(m_pluginOBJECT.JS_SetRectInfo(oData.aRect))
        }
        if (oData.aPolygon.length > 0) {
          aP.push(m_pluginOBJECT.JS_SetPolygonInfo(oData.aPolygon))
        }
        Promise.all(aP)
          .then(() => {
            resolve()
          }, () => {
            reject(_oUnKnownError)
          })
      });
      return oPromise
    };
    this.I_GetSnapPolygonInfo = function (iWndIndex) {
      let oPromise = new Promise((resolve, reject) => {
        var aP = [];
        aP.push(m_pluginOBJECT.JS_GetPolygonInfo());
        aP.push(m_pluginOBJECT.JS_GetRectInfo());
        Promise.all(aP)
          .then(aData => {
            var szXmlData = m_utilsInc.formatPolygonJsonToXml(aData);
            resolve(szXmlData)
          }, () => {
            reject(_oUnKnownError)
          })
      });
      return oPromise
    };
    this.I_ClearSnapInfo = function (iWndIndex, aShapes) {
      let oPromise = new Promise((resolve, reject) => {
        if (aShapes) {
          var aPolygon = [];
          var aRect = [];
          aShapes.forEach(item => {
            if (1 === item.polygonType) {
              aPolygon.push(item.id)
            } else {
              aRect.push(item.id)
            }
            var aP = [];
            if (aPolygon.length) {
              aP.push(m_pluginOBJECT.JS_ClearShapeByType("Polygon", aPolygon))
            }
            if (aRect.length) {
              aP.push(m_pluginOBJECT.JS_ClearShapeByType("Rect", aRect))
            }
            Promise.all(aP)
              .then(() => {
                resolve()
              }, () => {
                reject(_oUnKnownError)
              })
          })
        } else {
          m_pluginOBJECT.JS_ClearShapeByType("AllWindows")
            .then(() => {
              resolve()
            }, () => {
              reject(_oUnKnownError)
            })
        }
      });
      return oPromise
    };
    this.I_DeviceCapturePic = function (szDeviceIdentify, iChannelID, szPicName, options) {
      return false;
      var iIndex = this.findDeviceIndexByIP(szDeviceIdentify);
      var iRet = -1;
      if (iIndex != -1) {
        var oDeviceInfo = m_deviceSet[iIndex];
        var newOptions = {
          bDateDir: true
        };
        m_utilsInc.extend(newOptions, options);
        if (!m_utilsInc.isUndefined(newOptions.iResolutionWidth) && !m_utilsInc.isInt(newOptions.iResolutionWidth)) {
          return iRet
        }
        if (!m_utilsInc.isUndefined(newOptions.iResolutionHeight) && !m_utilsInc.isInt(newOptions.iResolutionHeight)) {
          return iRet
        }
        iRet = oDeviceInfo.oProtocolInc.deviceCapturePic(oDeviceInfo, iChannelID, szPicName, newOptions)
      }
      return iRet
    };
    this.I_SetPackageType = function (iPackageType) {
      let oPromise = new Promise((resolve, reject) => {
        m_pluginOBJECT.JS_SetPackageType(iPackageType)
          .then(() => {
            resolve()
          }, () => {
            reject(_oUnKnownError)
          })
      });
      return oPromise
    };
    this.I_GetDevicePort = function (szDeviceIdentify) {
      let oPromise = new Promise(async (resolve, reject) => {
        var iIndex = this.findDeviceIndexByIP(szDeviceIdentify);
        var oPort = null;
        if (iIndex != -1) {
          var oDeviceInfo = m_deviceSet[iIndex];
          try {
            oPort = await _getPort(oDeviceInfo);
            resolve(oPort)
          } catch (err) {
            reject({
              errorCode: ERROR_CODE_NETWORKERROR,
              errorMsg: ""
            })
          }
        } else {
          reject(_oNoLoginError)
        }
      });
      return oPromise
    };
    this.I_GetTextOverlay = function (szUrl, szDeviceIdentify, options) {
      let oPromise = new Promise((resolve, reject) => {
        var iIndex = this.findDeviceIndexByIP(szDeviceIdentify);
        if (iIndex != -1) {
          var oDeviceInfo = m_deviceSet[iIndex];
          var wndInfo = m_wndSet[iIndex];
          var newOptions = {
            type: "GET",
            success: options.success,
            error: options.error
          };
          this.I_SendHTTPRequest(oDeviceInfo.szIP + "_" + oDeviceInfo.iCGIPort, szUrl, newOptions)
            .then(oData => {
              resolve(oData)
            }, oError => {
              reject(oError)
            })
        } else {
          reject(_oNoLoginError)
        }
      });
      return oPromise
    };
    this.findDeviceIndexByIP = function (szDeviceIdentify) {
      if (szDeviceIdentify.indexOf("_") > -1) {
        for (var i = 0, iLen = m_deviceSet.length; i < iLen; i++) {
          if (m_deviceSet[i].szDeviceIdentify == szDeviceIdentify) {
            return i
          }
        }
      } else {
        for (var i = 0, iLen = m_deviceSet.length; i < iLen; i++) {
          if (m_deviceSet[i].szIP == szDeviceIdentify) {
            return i
          }
        }
      }
      return -1
    };
    this.findWndIndexByIndex = function (iWndIndex) {
      for (var i = 0, iLen = m_wndSet.length; i < iLen; i++) {
        if (m_wndSet[i].iIndex == iWndIndex) {
          return i
        }
      }
      return -1
    };

    function deviceInfoClass() {
      this.szIP = "";
      this.szHostName = "";
      this.szAuth = "";
      this.szHttpProtocol = "http://";
      this.iCGIPort = 80;
      this.szDeviceIdentify = "";
      this.iDevicePort = -1;
      this.iHttpPort = -1;
      this.iHttpsPort = -1;
      this.iRtspPort = -1;
      this.iAudioType = 1;
      this.m_iAudioBitRate = -1;
      this.m_iAudioSamplingRate = -1;
      this.iDeviceProtocol = PROTOCOL_DEVICE_ISAPI;
      this.oProtocolInc = null;
      this.iAnalogChannelNum = 0;
      this.szDeviceType = "";
      this.bVoiceTalk = false;
      this.iDeviceMinusLocalTime = 0
    }
    var wndInfoClass = function () {
      this.iIndex = 0;
      this.szIP = "";
      this.iCGIPort = 80;
      this.szDeviceIdentify = "";
      this.iChannelID = "";
      this.iPlayStatus = PLAY_STATUS_STOP;
      this.bSound = false;
      this.bRecord = false;
      this.bPTZAuto = false;
      this.bEZoom = false;
      this.b3DZoom = false
    };
    var HttpPluginClient = function () {
      this.options = {
        type: "GET",
        url: "",
        auth: "",
        timeout: 3e4,
        data: "",
        async: true,
        success: null,
        error: null
      };
      this.m_szHttpHead = "";
      this.m_szHttpContent = "";
      this.m_szHttpData = ""
    };
    HttpPluginClient.prototype.submitRequest = function (options) {
      options.method = this.getHttpMethod(options.type);
      options.content = options.data;
      delete options.type;
      delete options.data;
      return m_pluginOBJECT.JS_SubmitHttpRequest(options)
    };
    HttpPluginClient.prototype.getHttpMethod = function (szMethod) {
      var oMethod = {
        GET: 1,
        POST: 2,
        PUT: 5,
        DELETE: 6
      },
        iMethod = oMethod[szMethod];
      return iMethod ? iMethod : -1
    };
    var ISAPIProtocol = function () { };
    ISAPIProtocol.prototype.CGI = {
      login: "%s%s:%s/ISAPI/Security/userCheck?format=json",
      getAudioInfo: "%s%s:%s/ISAPI/System/TwoWayAudio/channels",
      getDeviceInfo: "%s%s:%s/ISAPI/System/deviceInfo",
      getAnalogChannelInfo: "%s%s:%s/ISAPI/System/Video/inputs/channels",
      getDigitalChannel: "%s%s:%s/ISAPI/ContentMgmt/InputProxy/channels",
      getDigitalChannelInfo: "%s%s:%s/ISAPI/ContentMgmt/InputProxy/channels/status",
      getZeroChannelInfo: "%s%s:%s/ISAPI/ContentMgmt/ZeroVideo/channels",
      getStreamChannels: {
        analog: "%s%s:%s/ISAPI/Streaming/channels",
        digital: "%s%s:%s/ISAPI/ContentMgmt/StreamingProxy/channels"
      },
      startRealPlay: {
        channels: "video://%s:%s/%s",
        zeroChannels: "%s%s:%s/PSIA/Custom/SelfExt/ContentMgmt/ZeroStreaming/channels/%s"
      },
      startVoiceTalk: {
        open: "%s%s:%s/ISAPI/System/TwoWayAudio/channels/%s/open",
        close: "%s%s:%s/ISAPI/System/TwoWayAudio/channels/%s/close",
        audioData: "%s%s:%s/ISAPI/System/TwoWayAudio/channels/%s/audioData"
      },
      ptzControl: {
        analog: "%s%s:%s/ISAPI/PTZCtrl/channels/%s/continuous",
        digital: "%s%s:%s/ISAPI/ContentMgmt/PTZCtrlProxy/channels/%s/continuous"
      },
      ptzAutoControl: {
        analog: "%s%s:%s/ISAPI/PTZCtrl/channels/%s/autoPan",
        digital: "%s%s:%s/ISAPI/ContentMgmt/PTZCtrlProxy/channels/%s/autoPan"
      },
      setPreset: {
        analog: "%s%s:%s/ISAPI/PTZCtrl/channels/%s/presets/%s",
        digital: "%s%s:%s/ISAPI/ContentMgmt/PTZCtrlProxy/channels/%s/presets/%s"
      },
      goPreset: {
        analog: "%s%s:%s/ISAPI/PTZCtrl/channels/%s/presets/%s/goto",
        digital: "%s%s:%s/ISAPI/ContentMgmt/PTZCtrlProxy/channels/%s/presets/%s/goto"
      },
      ptzFocus: {
        analog: "%s%s:%s/ISAPI/System/Video/inputs/channels/%s/focus",
        digital: "%s%s:%s/ISAPI/ContentMgmt/ImageProxy/channels/%s/focus"
      },
      ptzIris: {
        analog: "%s%s:%s/ISAPI/System/Video/inputs/channels/%s/iris",
        digital: "%s%s:%s/ISAPI/ContentMgmt/ImageProxy/channels/%s/iris"
      },
      getNetworkBond: "%s%s:%s/ISAPI/System/Network/Bond",
      getNetworkInterface: "%s%s:%s/ISAPI/System/Network/interfaces",
      getUPnPPortStatus: "%s%s:%s/ISAPI/System/Network/UPnP/ports/status",
      getPPPoEStatus: "%s%s:%s/ISAPI/System/Network/PPPoE/1/status",
      getPortInfo: "%s%s:%s/ISAPI/Security/adminAccesses",
      recordSearch: "%s%s:%s/ISAPI/ContentMgmt/search",
      startPlayback: "video://%s:%s/%s",
      startWsPlayback: "%s%s:%s/%s",
      startShttpPlayback: "%s%s:%s/SDK/playback/%s",
      startShttpReversePlayback: "%s%s:%s/SDK/playback/%s/reversePlay",
      startTransCodePlayback: "%s%s:%s/SDK/playback/%s/transcoding",
      startDownloadRecord: "%s%s:%s/ISAPI/ContentMgmt/download",
      downloaddeviceConfig: "%s%s:%s/ISAPI/System/configurationData",
      uploaddeviceConfig: "%s%s:%s/ISAPI/System/configurationData",
      restart: "%s%s:%s/ISAPI/System/reboot",
      restore: "%s%s:%s/ISAPI/System/factoryReset?mode=%s",
      startUpgrade: {
        upgrade: "%s%s:%s/ISAPI/System/updateFirmware",
        status: "%s%s:%s/ISAPI/System/upgradeStatus"
      },
      set3DZoom: {
        analog: "%s%s:%s/ISAPI/PTZCtrl/channels/%s/position3D",
        digital: "%s%s:%s/ISAPI/ContentMgmt/PTZCtrlProxy/channels/%s/position3D"
      },
      getSecurityVersion: "%s%s:%s/ISAPI/Security/capabilities?username=admin",
      SDKCapabilities: "%s%s:%s/SDK/capabilities",
      deviceCapture: {
        channels: "%s%s:%s/ISAPI/Streaming/channels/%s/picture"
      },
      overlayInfo: {
        analog: "%s%s:%s/ISAPI/System/Video/inputs/channels/%s/overlays/",
        digital: "%s%s:%s/ISAPI/ContentMgmt/InputProxy/channels/%s/video/overlays"
      },
      sessionCap: "%s%s:%s/ISAPI/Security/sessionLogin/capabilities?username=%s",
      sessionLogin: "%s%s:%s/ISAPI/Security/sessionLogin",
      sessionHeartbeat: "%s%s:%s/ISAPI/Security/sessionHeartbeat",
      sessionLogout: "%s%s:%s/ISAPI/Security/sessionLogout",
      systemCapabilities: "%s%s:%s/ISAPI/System/capabilities",
      time: "ISAPI/System/time"
    };
    ISAPIProtocol.prototype.login = function (szIP, iPort, szAuth, options) {
      return m_webVideoCtrl.I_SendHTTPRequest(oDeviceInfo.szDeviceIdentify, this.CGI.login, options)
    };
    ISAPIProtocol.prototype.getAudioInfo = function (oDeviceInfo, options) {
      let oPromise = new Promise(function (resolve, reject) {
        var newOptions = {};
        m_utilsInc.extend(newOptions, options);
        m_utilsInc.extend(newOptions, {
          success: function (oData) {
            var oNodeList = NS.$XML(oData)
              .find("audioCompressionType", true);
            if (oNodeList.length > 0) {
              var szAudioCompressionType = NS.$XML(oNodeList)
                .eq(0)
                .text(),
                iAudioType = 0;
              if ("G.711ulaw" == szAudioCompressionType) {
                iAudioType = 1
              } else if ("G.711alaw" == szAudioCompressionType) {
                iAudioType = 2
              } else if ("G.726" == szAudioCompressionType) {
                iAudioType = 3
              } else if ("MP2L2" == szAudioCompressionType || "MPEL2" == szAudioCompressionType) {
                iAudioType = 4
              } else if ("G.722.1" == szAudioCompressionType) {
                iAudioType = 0
              } else if ("AAC" == szAudioCompressionType) {
                iAudioType = 5
              } else if ("PCM" == szAudioCompressionType) {
                iAudioType = 6
              } else if ("MP3" == szAudioCompressionType) {
                iAudioType = 7
              }
              oDeviceInfo.iAudioType = iAudioType
            }
            if (NS.$XML(oData)
              .find("audioBitRate")
              .eq(0)
              .text() !== "") {
              oDeviceInfo.m_iAudioBitRate = parseInt(NS.$XML(oData)
                .find("audioBitRate")
                .eq(0)
                .text(), 10) * 1e3
            } else {
              oDeviceInfo.m_iAudioBitRate = 0
            }
            if (NS.$XML(oData)
              .find("audioSamplingRate")
              .eq(0)
              .text() !== "") {
              oDeviceInfo.m_iAudioSamplingRate = parseInt(NS.$XML(oData)
                .find("audioSamplingRate")
                .eq(0)
                .text(), 10) * 1e3
            } else {
              oDeviceInfo.m_iAudioSamplingRate = 0
            }
            if (NS.$XML(oData)
              .find("channelNum")
              .eq(0)
              .text() !== "") {
              oDeviceInfo.m_iSoundChan = parseInt(NS.$XML(oData)
                .find("channelNum")
                .eq(0)
                .text(), 10)
            } else {
              oDeviceInfo.m_iSoundChan = 1
            }
            if (NS.$XML(oData)
              .find("deviceCastChannelNum")
              .eq(0)
              .text() !== "") {
              oDeviceInfo.m_iDeviceAudioSoundChan = parseInt(NS.$XML(oData)
                .find("deviceCastChannelNum")
                .eq(0)
                .text(), 10)
            } else {
              oDeviceInfo.m_iDeviceAudioSoundChan = 1
            }
            if (options.success) {
              options.success(oData)
            }
            resolve(oData)
          },
          error: function (oError) {
            if (options.error) {
              options.error(oError)
            }
            reject(oError)
          }
        });
        m_webVideoCtrl.I_SendHTTPRequest(oDeviceInfo.szDeviceIdentify, m_ISAPIProtocol.CGI.getAudioInfo, newOptions)
      });
      return oPromise
    };
    ISAPIProtocol.prototype.getDeviceInfo = function (oDeviceInfo, options) {
      let oPromise = new Promise(function (resolve, reject) {
        var newOptions = {};
        m_utilsInc.extend(newOptions, options);
        m_utilsInc.extend(newOptions, {
          success: function (xmlDoc) {
            var oData;
            oDeviceInfo.szDeviceType = NS.$XML(xmlDoc)
              .find("deviceType")
              .eq(0)
              .text();
            var arrXml = [];
            arrXml.push("<DeviceInfo>");
            arrXml.push("<deviceName>" + m_utilsInc.escape(NS.$XML(xmlDoc)
              .find("deviceName")
              .eq(0)
              .text()) + "</deviceName>");
            arrXml.push("<deviceID>" + NS.$XML(xmlDoc)
              .find("deviceID")
              .eq(0)
              .text() + "</deviceID>");
            arrXml.push("<deviceType>" + NS.$XML(xmlDoc)
              .find("deviceType")
              .eq(0)
              .text() + "</deviceType>");
            arrXml.push("<model>" + NS.$XML(xmlDoc)
              .find("model")
              .eq(0)
              .text() + "</model>");
            arrXml.push("<serialNumber>" + NS.$XML(xmlDoc)
              .find("serialNumber")
              .eq(0)
              .text() + "</serialNumber>");
            arrXml.push("<macAddress>" + NS.$XML(xmlDoc)
              .find("macAddress")
              .eq(0)
              .text() + "</macAddress>");
            arrXml.push("<firmwareVersion>" + NS.$XML(xmlDoc)
              .find("firmwareVersion")
              .eq(0)
              .text() + "</firmwareVersion>");
            arrXml.push("<firmwareReleasedDate>" + NS.$XML(xmlDoc)
              .find("firmwareReleasedDate")
              .eq(0)
              .text() + "</firmwareReleasedDate>");
            arrXml.push("<encoderVersion>" + NS.$XML(xmlDoc)
              .find("encoderVersion")
              .eq(0)
              .text() + "</encoderVersion>");
            arrXml.push("<encoderReleasedDate>" + NS.$XML(xmlDoc)
              .find("encoderReleasedDate")
              .eq(0)
              .text() + "</encoderReleasedDate>");
            arrXml.push("</DeviceInfo>");
            oData = m_utilsInc.loadXML(arrXml.join(""));
            if (options.success) {
              options.success(oData)
            }
            resolve(oData)
          },
          error: function (oError) {
            if (options.error) {
              options.error(oError)
            }
            reject(oError)
          }
        });
        m_webVideoCtrl.I_SendHTTPRequest(oDeviceInfo.szDeviceIdentify, m_ISAPIProtocol.CGI.getDeviceInfo, newOptions)
      });
      return oPromise
    };
    ISAPIProtocol.prototype.getDeviceMinusLocalTime = function (oDeviceInfo) {
      let oPromise = new Promise(function (resolve, reject) {
        var newOptions = {
          success: xmlDoc => {
            var szDeviceTime = $(xmlDoc)
              .find("localTime")
              .eq(0)
              .text()
              .substring(0, 19);
            var arDTms = szDeviceTime.match(/(\d+)-(\d+)-(\d+)(\D+)(\d+):(\d+):(\d+)/);
            if (arDTms.length !== 8) {
              return
            }
            var dtDeviceDate = new Date(arDTms[1], arDTms[2] - 1, arDTms[3], arDTms[5], arDTms[6], arDTms[7]);
            var szTimeZone = $(xmlDoc)
              .find("timeZone")
              .eq(0)
              .text();
            var iDSTTime = 0;
            var iDSTPos = szTimeZone.indexOf("DST");
            if (iDSTPos != -1) {
              var dtDSTStart = new Date(dtDeviceDate.getTime());
              dtDSTStart.setMinutes(0);
              dtDSTStart.setSeconds(0);
              var dtDSTStop = new Date(dtDeviceDate.getTime());
              dtDSTStop.setMinutes(0);
              dtDSTStop.setSeconds(0);
              var szDSTStartTime = szTimeZone.split(",")[1];
              var szDSTStopTime = szTimeZone.split(",")[2];
              var iDSTStartMonth = parseInt(szDSTStartTime.split(".")[0].replace("M", ""), 10);
              dtDSTStart.setMonth(iDSTStartMonth - 1);
              var iDSTStartWeek = parseInt(szDSTStartTime.split(".")[1], 10);
              var iDSTStartDay = parseInt(szDSTStartTime.split(".")[2].split("/")[0]);
              var iDSTStartTime = parseInt(szDSTStartTime.split(".")[2].split("/")[1].split(":")[0], 10);
              dtDSTStart.setHours(iDSTStartTime);
              var iTime = 0;
              var iDate = 0;
              for (var i = 1; i <= 31; i++) {
                dtDSTStart.setDate(i);
                if (dtDSTStart.getMonth() !== iDSTStartMonth - 1) {
                  break
                }
                if (dtDSTStart.getDay() == iDSTStartDay) {
                  iTime++;
                  iDate = i;
                  if (iTime == iDSTStartWeek) {
                    break
                  }
                }
              }
              dtDSTStart.setDate(iDate);
              dtDSTStart.setMonth(iDSTStartMonth - 1);
              var iDSTStopMonth = parseInt(szDSTStopTime.split(".")[0].replace("M", ""), 10);
              dtDSTStop.setMonth(iDSTStopMonth - 1);
              var iDSTStopWeek = parseInt(szDSTStopTime.split(".")[1], 10);
              var iDSTStopDay = parseInt(szDSTStopTime.split(".")[2].split("/")[0]);
              var iDSTStopTime = parseInt(szDSTStopTime.split(".")[2].split("/")[1].split(":")[0], 10);
              dtDSTStop.setHours(iDSTStopTime);
              iTime = 0;
              iDate = 0;
              for (var i = 1; i <= 31; i++) {
                dtDSTStop.setDate(i);
                if (dtDSTStop.getMonth() !== iDSTStopMonth - 1) {
                  break
                }
                if (dtDSTStop.getDay() == iDSTStopDay) {
                  iTime++;
                  iDate = i;
                  if (iTime == iDSTStopWeek) {
                    break
                  }
                }
              }
              dtDSTStop.setDate(iDate);
              dtDSTStop.setMonth(iDSTStopMonth - 1);
              if (dtDSTStart.getTime() < dtDSTStop.getTime()) {
                if (dtDeviceDate.getTime() >= dtDSTStart.getTime() && dtDeviceDate.getTime() <= dtDSTStop.getTime()) {
                  var szDSTTime = szTimeZone.substring(iDSTPos + 3, iDSTPos + 11);
                  iDSTTime = parseInt(szDSTTime.split(":")[0], 10) * 60 + parseInt(szDSTTime.split(":")[1], 10)
                }
              } else {
                if (dtDeviceDate.getTime() >= dtDSTStart.getTime() || dtDeviceDate.getTime() <= dtDSTStop.getTime()) {
                  var szDSTTime = szTimeZone.substring(iDSTPos + 3, iDSTPos + 11);
                  iDSTTime = parseInt(szDSTTime.split(":")[0], 10) * 60 + parseInt(szDSTTime.split(":")[1], 10)
                }
              }
            }
            var arDTZms = szTimeZone.match(/\D+([+-])(\d+):(\d+):(\d+)/);
            if (arDTZms.length == 5) {
              var dtNow = new Date;
              var iLocalOffsetMin = dtNow.getTimezoneOffset();
              var iDeviceOffsetMin = parseInt(arDTZms[2]) * 60 + parseInt(arDTZms[3]);
              iDeviceOffsetMin = arDTZms[1] === "+" ? iDeviceOffsetMin : -iDeviceOffsetMin;
              iDeviceMinusLocalTime = (iLocalOffsetMin - iDeviceOffsetMin + iDSTTime) * 60 * 1e3
            }
            oDeviceInfo.iDeviceMinusLocalTime = iDeviceMinusLocalTime;
            resolve(iDeviceMinusLocalTime)
          },
          error: () => {
            reject()
          }
        };
        m_webVideoCtrl.I_SendHTTPRequest(oDeviceInfo.szDeviceIdentify, m_ISAPIProtocol.CGI.time, newOptions)
      });
      return oPromise
    };
    ISAPIProtocol.prototype.getAnalogChannelInfo = function (oDeviceInfo, options) {
      let oPromise = new Promise(function (resolve, reject) {
        var newOptions = {};
        m_utilsInc.extend(newOptions, options);
        m_utilsInc.extend(newOptions, {
          success: function (xmlData) {
            var arrXml = [];
            arrXml.push("<VideoInputChannelList>");
            var nodeList = NS.$XML(xmlData)
              .find("VideoInputChannel", true);
            oDeviceInfo.iAnalogChannelNum = nodeList.length;
            for (var i = 0, iLen = nodeList.length; i < iLen; i++) {
              var node = nodeList[i];
              arrXml.push("<VideoInputChannel>");
              arrXml.push("<id>" + NS.$XML(node)
                .find("id")
                .eq(0)
                .text() + "</id>");
              arrXml.push("<inputPort>" + NS.$XML(node)
                .find("inputPort")
                .eq(0)
                .text() + "</inputPort>");
              arrXml.push("<name>" + m_utilsInc.escape(NS.$XML(node)
                .find("name")
                .eq(0)
                .text()) + "</name>");
              arrXml.push("<videoFormat>" + NS.$XML(node)
                .find("videoFormat")
                .eq(0)
                .text() + "</videoFormat>");
              arrXml.push("</VideoInputChannel>")
            }
            arrXml.push("</VideoInputChannelList>");
            var xmlDoc = m_utilsInc.loadXML(arrXml.join(""));
            if (options.success) {
              options.success(xmlDoc)
            }
            resolve(xmlDoc)
          },
          error: function (oError) {
            if (options.error) {
              options.error(oError)
            }
            reject(oError)
          }
        });
        m_webVideoCtrl.I_SendHTTPRequest(oDeviceInfo.szDeviceIdentify, m_ISAPIProtocol.CGI.getAnalogChannelInfo, newOptions)
      });
      return oPromise
    };
    ISAPIProtocol.prototype.getDigitalChannel = function (oDeviceInfo, options) {
      let oPromise = new Promise(function (resolve, reject) {
        var newOptions = {};
        m_utilsInc.extend(newOptions, options);
        m_utilsInc.extend(newOptions, {
          success: function (xmlData) {
            var arrXml = [];
            arrXml.push("<InputProxyChannelList>");
            var nodeList = NS.$XML(xmlData)
              .find("InputProxyChannel", true);
            for (var i = 0, iLen = nodeList.length; i < iLen; i++) {
              var node = nodeList[i];
              arrXml.push("<InputProxyChannel>");
              arrXml.push("<id>" + NS.$XML(node)
                .find("id")
                .eq(0)
                .text() + "</id>");
              arrXml.push("<name>" + m_utilsInc.escape(NS.$XML(node)
                .find("name")
                .eq(0)
                .text()) + "</name>");
              arrXml.push("</InputProxyChannel>")
            }
            arrXml.push("</InputProxyChannelList>");
            var xmlDoc = m_utilsInc.loadXML(arrXml.join(""));
            if (options.success) {
              options.success(xmlDoc)
            }
            resolve(xmlDoc)
          },
          error: function (oError) {
            if (options.error) {
              options.error(oError)
            }
            reject(oError)
          }
        });
        m_webVideoCtrl.I_SendHTTPRequest(oDeviceInfo.szDeviceIdentify, m_ISAPIProtocol.CGI.getDigitalChannel, newOptions)
      });
      return oPromise
    };
    ISAPIProtocol.prototype.getDigitalChannelInfo = function (oDeviceInfo, options) {
      let oPromise = new Promise(async (resolve, reject) => {
        var oDigitalChannelXML = null,
          oDigitalChannelName = {};
        try {
          oDigitalChannelXML = await m_ISAPIProtocol.getDigitalChannel(oDeviceInfo, {})
        } catch (oError) {
          reject(oError)
        }
        var nodeList = NS.$XML(oDigitalChannelXML)
          .find("InputProxyChannel", true);
        for (var i = 0, iLen = nodeList.length; i < iLen; i++) {
          var node = nodeList[i],
            szId = NS.$XML(node)
              .find("id")
              .eq(0)
              .text(),
            szName = NS.$XML(node)
              .find("name")
              .eq(0)
              .text();
          oDigitalChannelName[szId] = szName
        }
        var newOptions = {};
        m_utilsInc.extend(newOptions, options);
        m_utilsInc.extend(newOptions, {
          success: function (xmlData) {
            var arrXml = [];
            arrXml.push("<InputProxyChannelStatusList>");
            var nodeList = NS.$XML(xmlData)
              .find("InputProxyChannelStatus", true);
            for (var i = 0, iLen = nodeList.length; i < iLen; i++) {
              var node = nodeList[i],
                szId = NS.$XML(node)
                  .find("id")
                  .eq(0)
                  .text();
              arrXml.push("<InputProxyChannelStatus>");
              arrXml.push("<id>" + szId + "</id>");
              arrXml.push("<sourceInputPortDescriptor>");
              arrXml.push("<proxyProtocol>" + NS.$XML(node)
                .find("proxyProtocol")
                .eq(0)
                .text() + "</proxyProtocol>");
              arrXml.push("<addressingFormatType>" + NS.$XML(node)
                .find("addressingFormatType")
                .eq(0)
                .text() + "</addressingFormatType>");
              arrXml.push("<ipAddress>" + NS.$XML(node)
                .find("ipAddress")
                .eq(0)
                .text() + "</ipAddress>");
              arrXml.push("<managePortNo>" + NS.$XML(node)
                .find("managePortNo")
                .eq(0)
                .text() + "</managePortNo>");
              arrXml.push("<srcInputPort>" + NS.$XML(node)
                .find("srcInputPort")
                .eq(0)
                .text() + "</srcInputPort>");
              arrXml.push("<userName>" + m_utilsInc.escape(NS.$XML(node)
                .find("userName")
                .eq(0)
                .text()) + "</userName>");
              arrXml.push("<streamType>" + NS.$XML(node)
                .find("streamType")
                .eq(0)
                .text() + "</streamType>");
              arrXml.push("<online>" + NS.$XML(node)
                .find("online")
                .eq(0)
                .text() + "</online>");
              arrXml.push("<name>" + m_utilsInc.escape(oDigitalChannelName[szId]) + "</name>");
              arrXml.push("</sourceInputPortDescriptor>");
              arrXml.push("</InputProxyChannelStatus>")
            }
            arrXml.push("</InputProxyChannelStatusList>");
            var xmlDoc = m_utilsInc.loadXML(arrXml.join(""));
            if (options.success) {
              options.success(xmlDoc)
            }
            resolve(xmlDoc)
          },
          error: function (oError) {
            if (options.error) {
              options.error(oError)
            }
            reject(oError)
          }
        });
        m_webVideoCtrl.I_SendHTTPRequest(oDeviceInfo.szDeviceIdentify, m_ISAPIProtocol.CGI.getDigitalChannelInfo, newOptions)
      });
      return oPromise
    };
    ISAPIProtocol.prototype.getZeroChannelInfo = function (oDeviceInfo, options) {
      return m_webVideoCtrl.I_SendHTTPRequest(oDeviceInfo.szDeviceIdentify, this.CGI.getZeroChannelInfo, options)
    };
    ISAPIProtocol.prototype.getStreamChannels = function (oDeviceInfo, options) {
      if (oDeviceInfo.iAnalogChannelNum != 0) {
        var url = m_utilsInc.formatString(this.CGI.getStreamChannels.analog, oDeviceInfo.szHttpProtocol, oDeviceInfo.szIP, oDeviceInfo.iCGIPort)
      } else {
        var url = m_utilsInc.formatString(this.CGI.getStreamChannels.digital, oDeviceInfo.szHttpProtocol, oDeviceInfo.szIP, oDeviceInfo.iCGIPort)
      }
      let szURI;
      if (oDeviceInfo.iAnalogChannelNum != 0) {
        szURI = this.CGI.getStreamChannels.analog
      } else {
        szURI = this.CGI.getStreamChannels.digital
      }
      return m_webVideoCtrl.I_SendHTTPRequest(oDeviceInfo.szDeviceIdentify, szURI, options)
    };
    ISAPIProtocol.prototype.getPPPoEStatus = function (oDeviceInfo, options) {
      return m_webVideoCtrl.I_SendHTTPRequest(oDeviceInfo.szDeviceIdentify, this.CGI.getPPPoEStatus, options)
    };
    ISAPIProtocol.prototype.getUPnPPortStatus = function (oDeviceInfo, options) {
      return m_webVideoCtrl.I_SendHTTPRequest(oDeviceInfo.szDeviceIdentify, this.CGI.getUPnPPortStatus, options)
    };
    ISAPIProtocol.prototype.getNetworkBond = function (oDeviceInfo, options) {
      return m_webVideoCtrl.I_SendHTTPRequest(oDeviceInfo.szDeviceIdentify, this.CGI.getNetworkBond, options)
    };
    ISAPIProtocol.prototype.getNetworkInterface = function (oDeviceInfo, options) {
      return m_webVideoCtrl.I_SendHTTPRequest(oDeviceInfo.szDeviceIdentify, this.CGI.getNetworkInterface, options)
    };
    ISAPIProtocol.prototype.getPortInfo = function (oDeviceInfo, options) {
      return m_webVideoCtrl.I_SendHTTPRequest(oDeviceInfo.szDeviceIdentify, this.CGI.getPortInfo, options)
    };
    ISAPIProtocol.prototype.startRealPlay = function (oDeviceInfo, options) {
      let oPromise = new Promise(async function (resolve, reject) {
        var iChannelID = options.iChannelID * 100 + options.iStreamType,
          szUrl = "";
        var szRtspIP = m_utilsInc.delPort(oDeviceInfo.szIP);
        var iRtspPort = oDeviceInfo.iRtspPort;
        if (options.iPort) {
          iRtspPort = options.iPort
        }
        if (options.bZeroChannel) {
          szUrl = m_utilsInc.formatString(oDeviceInfo.oProtocolInc.CGI.startRealPlay.zeroChannels, szRtspIP, iRtspPort, iChannelID)
        } else {
          szUrl = m_utilsInc.formatString(oDeviceInfo.oProtocolInc.CGI.startRealPlay.channels, szRtspIP, iRtspPort, iChannelID)
        }
        var addToWndSet = function () {
          var wndInfo = new wndInfoClass;
          wndInfo.iIndex = options.iWndIndex;
          wndInfo.szIP = oDeviceInfo.szIP;
          wndInfo.iCGIPort = oDeviceInfo.iCGIPort;
          wndInfo.szDeviceIdentify = oDeviceInfo.szDeviceIdentify;
          wndInfo.iChannelID = options.iChannelID;
          wndInfo.iPlayStatus = PLAY_STATUS_REALPLAY;
          m_wndSet.push(wndInfo)
        };
        await m_pluginOBJECT.JS_SetSecretKey(0, m_oLocalCfg.secretKey, 1);
        m_pluginOBJECT.JS_Play(szUrl, {
          auth: oDeviceInfo.szAuth,
          userInfo: oDeviceInfo.szAuth
        }, options.iWndIndex, "", "", options.bFlag)
          .then(() => {
            addToWndSet();
            resolve()
          }, () => {
            reject()
          })
      });
      return oPromise
    };
    ISAPIProtocol.prototype.startPlay = function (oDeviceInfo, options) {
      let oPromise = new Promise(async function (resolve, reject) {
        var addToWndSet = function () {
          var wndInfo = new wndInfoClass;
          wndInfo.iIndex = options.iWndIndex;
          wndInfo.szIP = oDeviceInfo.szIP;
          wndInfo.szDeviceIdentify = oDeviceInfo.szDeviceIdentify;
          wndInfo.iPlayStatus = PLAY_STATUS_PLAYBACK;
          m_wndSet.push(wndInfo)
        };
        m_pluginOBJECT.JS_Play(options.szUrl, {
          auth: oDeviceInfo.szAuth,
          userInfo: oDeviceInfo.szAuth
        }, options.iWndIndex, options.startTime, options.endTime, true)
          .then(() => {
            addToWndSet();
            resolve()
          }, () => {
            reject()
          })
      });
      return oPromise
    };
    ISAPIProtocol.prototype.startVoiceTalk = function (oDeviceInfo, iAudioChannel) {
      var szOpenUrl = m_utilsInc.formatString(this.CGI.startVoiceTalk.open, oDeviceInfo.szHttpProtocol, oDeviceInfo.szIP, oDeviceInfo.iCGIPort, iAudioChannel),
        szCloseUrl = m_utilsInc.formatString(this.CGI.startVoiceTalk.close, oDeviceInfo.szHttpProtocol, oDeviceInfo.szIP, oDeviceInfo.iCGIPort, iAudioChannel),
        szAudioDataUrl = m_utilsInc.formatString(this.CGI.startVoiceTalk.audioData, oDeviceInfo.szHttpProtocol, oDeviceInfo.szIP, oDeviceInfo.iCGIPort, iAudioChannel);
      return m_pluginOBJECT.JS_StartTalk(szOpenUrl, szCloseUrl, szAudioDataUrl, oDeviceInfo.szAuth, oDeviceInfo.iAudioType, oDeviceInfo.m_iAudioBitRate, oDeviceInfo.m_iAudioSamplingRate, oDeviceInfo.m_iSoundChan, oDeviceInfo.m_iDeviceAudioSoundChan)
    };
    ISAPIProtocol.prototype.audioPlay = function (options) {
      return m_pluginOBJECT.JS_AudioPlay(options.szUrl, options.szAuth, -1, -1, true, options.iAudioType)
    };
    ISAPIProtocol.prototype.ptzAutoControl = function (oDeviceInfo, bStop, oWndInfo, options) {
      let oPromise = new Promise((resolve, reject) => {
        var iChannelID = oWndInfo.iChannelID,
          szUrl = "",
          szData = "";
        options.iPTZSpeed = options.iPTZSpeed < 7 ? options.iPTZSpeed * 15 : 100;
        if (bStop) {
          options.iPTZSpeed = 0
        }
        if (iChannelID <= oDeviceInfo.iAnalogChannelNum) {
          szUrl = m_utilsInc.formatString(m_ISAPIProtocol.CGI.ptzAutoControl.analog, oDeviceInfo.szHttpProtocol, oDeviceInfo.szIP, oDeviceInfo.iCGIPort, oWndInfo.iChannelID)
        } else {
          szUrl = m_utilsInc.formatString(m_ISAPIProtocol.CGI.ptzAutoControl.digital, oDeviceInfo.szHttpProtocol, oDeviceInfo.szIP, oDeviceInfo.iCGIPort, oWndInfo.iChannelID)
        }
        szData = "<?xml version='1.0' encoding='UTF-8'?>" + "<autoPanData>" + "<autoPan>" + options.iPTZSpeed + "</autoPan>" + "</autoPanData>";
        var newOptions = {
          type: "PUT",
          url: szUrl,
          data: szData,
          success: null,
          error: null
        };
        var self = this;
        m_utilsInc.extend(newOptions, options);
        m_utilsInc.extend(newOptions, {
          success: function () {
            oWndInfo.bPTZAuto = !oWndInfo.bPTZAuto;
            if (options.success) {
              options.success()
            }
            resolve()
          },
          error: function (oError) {
            if (options.error) {
              options.error(oError)
            }
            reject(oError)
          }
        });
        m_webVideoCtrl.I_SendHTTPRequest(oDeviceInfo.szDeviceIdentify, "", newOptions)
      });
      return oPromise
    };
    ISAPIProtocol.prototype.ptzControl = function (oDeviceInfo, bStop, oWndInfo, options) {
      var iChannelID = oWndInfo.iChannelID,
        szUrl = "";
      if (oWndInfo.bPTZAuto) {
        this.ptzAutoControl(oDeviceInfo, true, oWndInfo, {
          iPTZSpeed: 0
        })
      }
      if (bStop) {
        options.iPTZSpeed = 0
      } else {
        options.iPTZSpeed = options.iPTZSpeed < 7 ? options.iPTZSpeed * 15 : 100
      }
      var oDirection = [{}, {
        pan: 0,
        tilt: options.iPTZSpeed
      }, {
        pan: 0,
        tilt: -options.iPTZSpeed
      }, {
        pan: -options.iPTZSpeed,
        tilt: 0
      }, {
        pan: options.iPTZSpeed,
        tilt: 0
      }, {
        pan: -options.iPTZSpeed,
        tilt: options.iPTZSpeed
      }, {
        pan: -options.iPTZSpeed,
        tilt: -options.iPTZSpeed
      }, {
        pan: options.iPTZSpeed,
        tilt: options.iPTZSpeed
      }, {
        pan: options.iPTZSpeed,
        tilt: -options.iPTZSpeed
      }, {}, {
        speed: options.iPTZSpeed
      }, {
        speed: -options.iPTZSpeed
      }, {
        speed: options.iPTZSpeed
      }, {
        speed: -options.iPTZSpeed
      }, {
        speed: options.iPTZSpeed
      }, {
        speed: -options.iPTZSpeed
      }];
      var szData = "";
      var oCommond = {};
      switch (options.iPTZIndex) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
          oCommond = this.CGI.ptzControl;
          szData = "<?xml version='1.0' encoding='UTF-8'?>" + "<PTZData>" + "<pan>" + oDirection[options.iPTZIndex].pan + "</pan>" + "<tilt>" + oDirection[options.iPTZIndex].tilt + "</tilt>" + "</PTZData>";
          break;
        case 10:
        case 11:
          oCommond = this.CGI.ptzControl;
          szData = "<?xml version='1.0' encoding='UTF-8'?>" + "<PTZData>" + "<zoom>" + oDirection[options.iPTZIndex].speed + "</zoom>" + "</PTZData>";
          break;
        case 12:
        case 13:
          oCommond = this.CGI.ptzFocus;
          szData = "<?xml version='1.0' encoding='UTF-8'?>" + "<FocusData>" + "<focus>" + oDirection[options.iPTZIndex].speed + "</focus>" + "</FocusData>";
          break;
        case 14:
        case 15:
          oCommond = this.CGI.ptzIris;
          szData = "<?xml version='1.0' encoding='UTF-8'?>" + "<IrisData>" + "<iris>" + oDirection[options.iPTZIndex].speed + "</iris>" + "</IrisData>";
          break;
        default:
          return
      }
      if (iChannelID <= oDeviceInfo.iAnalogChannelNum) {
        szUrl = m_utilsInc.formatString(oCommond.analog, oDeviceInfo.szHttpProtocol, oDeviceInfo.szIP, oDeviceInfo.iCGIPort, oWndInfo.iChannelID)
      } else {
        szUrl = m_utilsInc.formatString(oCommond.digital, oDeviceInfo.szHttpProtocol, oDeviceInfo.szIP, oDeviceInfo.iCGIPort, oWndInfo.iChannelID)
      }
      var newOptions = {
        type: "PUT",
        url: szUrl,
        data: szData,
        success: null,
        error: null
      };
      m_utilsInc.extend(newOptions, options);
      return m_webVideoCtrl.I_SendHTTPRequest(oDeviceInfo.szDeviceIdentify, "", newOptions)
    };
    ISAPIProtocol.prototype.setPreset = function (oDeviceInfo, oWndInfo, options) {
      var iChannelID = oWndInfo.iChannelID,
        szUrl = "",
        szData = "";
      if (iChannelID <= oDeviceInfo.iAnalogChannelNum) {
        szUrl = m_utilsInc.formatString(this.CGI.setPreset.analog, oDeviceInfo.szHttpProtocol, oDeviceInfo.szIP, oDeviceInfo.iCGIPort, oWndInfo.iChannelID, options.iPresetID)
      } else {
        szUrl = m_utilsInc.formatString(this.CGI.setPreset.digital, oDeviceInfo.szHttpProtocol, oDeviceInfo.szIP, oDeviceInfo.iCGIPort, oWndInfo.iChannelID, options.iPresetID)
      }
      szData = "<?xml version='1.0' encoding='UTF-8'?>";
      szData += "<PTZPreset>";
      szData += "<id>" + options.iPresetID + "</id>";
      if (oDeviceInfo.szDeviceType != DEVICE_TYPE_IPDOME) {
        szData += "<presetName>" + "Preset" + options.iPresetID + "</presetName>"
      }
      szData += "</PTZPreset>";
      var newOptions = {
        type: "PUT",
        url: szUrl,
        data: szData,
        success: null,
        error: null
      };
      m_utilsInc.extend(newOptions, options);
      return m_webVideoCtrl.I_SendHTTPRequest(oDeviceInfo.szDeviceIdentify, "", newOptions)
    };
    ISAPIProtocol.prototype.goPreset = function (oDeviceInfo, oWndInfo, options) {
      var iChannelID = oWndInfo.iChannelID,
        szUrl = "";
      if (iChannelID <= oDeviceInfo.iAnalogChannelNum) {
        szUrl = m_utilsInc.formatString(this.CGI.goPreset.analog, oDeviceInfo.szHttpProtocol, oDeviceInfo.szIP, oDeviceInfo.iCGIPort, oWndInfo.iChannelID, options.iPresetID)
      } else {
        szUrl = m_utilsInc.formatString(this.CGI.goPreset.digital, oDeviceInfo.szHttpProtocol, oDeviceInfo.szIP, oDeviceInfo.iCGIPort, oWndInfo.iChannelID, options.iPresetID)
      }
      var newOptions = {
        type: "PUT",
        url: szUrl,
        success: null,
        error: null
      };
      m_utilsInc.extend(newOptions, options);
      return m_webVideoCtrl.I_SendHTTPRequest(oDeviceInfo.szDeviceIdentify, "", newOptions)
    };
    ISAPIProtocol.prototype.recordSearch = function (oDeviceInfo, options) {
      let oPromise = new Promise((resolve, reject) => {
        var szUrl = "",
          szData = "",
          iChannelID = options.iChannelID,
          iStreamType = options.iStreamType,
          szStartTime = options.szStartTime.replace(" ", "T") + "Z",
          szEndTime = options.szEndTime.replace(" ", "T") + "Z";
        szUrl = m_utilsInc.formatString(m_ISAPIProtocol.CGI.recordSearch, oDeviceInfo.szHttpProtocol, oDeviceInfo.szIP, oDeviceInfo.iCGIPort);
        szData = "<?xml version='1.0' encoding='UTF-8'?>" + "<CMSearchDescription>" + "<searchID>" + new UUID + "</searchID>" + "<trackList><trackID>" + (iChannelID * 100 + iStreamType) + "</trackID></trackList>" + "<timeSpanList>" + "<timeSpan>" + "<startTime>" + szStartTime + "</startTime>" + "<endTime>" + szEndTime + "</endTime>" + "</timeSpan>" + "</timeSpanList>" + "<maxResults>50</maxResults>" + "<searchResultPostion>" + options.iSearchPos + "</searchResultPostion>" + "<metadataList>" + "<metadataDescriptor>//metadata.ISAPI.org/VideoMotion</metadataDescriptor>" + "</metadataList>" + "</CMSearchDescription>";
        var httpClient = new HttpPluginClient;
        var newOptions = {
          type: "POST",
          url: szUrl,
          data: szData,
          success: null,
          error: null
        };
        m_utilsInc.extend(newOptions, options);
        m_utilsInc.extend(newOptions, {
          success: function (xmlDoc) {
            var arrXml = [];
            arrXml.push("<CMSearchResult>");
            arrXml.push("<responseStatus>" + NS.$XML(xmlDoc)
              .find("responseStatus")
              .eq(0)
              .text() + "</responseStatus>");
            arrXml.push("<responseStatusStrg>" + NS.$XML(xmlDoc)
              .find("responseStatusStrg")
              .eq(0)
              .text() + "</responseStatusStrg>");
            arrXml.push("<numOfMatches>" + NS.$XML(xmlDoc)
              .find("numOfMatches")
              .eq(0)
              .text() + "</numOfMatches>");
            arrXml.push("<matchList>");
            var nodeList = NS.$XML(xmlDoc)
              .find("searchMatchItem", true);
            for (var i = 0, iLen = nodeList.length; i < iLen; i++) {
              var node = nodeList[i];
              arrXml.push("<searchMatchItem>");
              arrXml.push("<trackID>" + NS.$XML(node)
                .find("trackID")
                .eq(0)
                .text() + "</trackID>");
              arrXml.push("<startTime>" + NS.$XML(node)
                .find("startTime")
                .eq(0)
                .text() + "</startTime>");
              arrXml.push("<endTime>" + NS.$XML(node)
                .find("endTime")
                .eq(0)
                .text() + "</endTime>");
              arrXml.push("<playbackURI>" + m_utilsInc.escape(NS.$XML(node)
                .find("playbackURI")
                .eq(0)
                .text()) + "</playbackURI>");
              arrXml.push("<metadataDescriptor>" + NS.$XML(node)
                .find("metadataDescriptor")
                .eq(0)
                .text()
                .split("/")[1] + "</metadataDescriptor>");
              arrXml.push("</searchMatchItem>")
            }
            arrXml.push("</matchList>");
            arrXml.push("</CMSearchResult>");
            xmlDoc = m_utilsInc.loadXML(arrXml.join(""));
            if (options.success) {
              options.success(xmlDoc)
            }
            resolve(xmlDoc)
          },
          error: function (oError) {
            if (options.error) {
              options.error(oError)
            }
            reject(oError)
          }
        });
        m_webVideoCtrl.I_SendHTTPRequest(oDeviceInfo.szDeviceIdentify, "", newOptions)
      });
      return oPromise
    };
    ISAPIProtocol.prototype.startPlayback = function (oDeviceInfo, options) {
      let oPromise = new Promise(async function (resolve, reject) {
        var iWndIndex = options.iWndIndex,
          szUrl = "",
          szStartTime = options.szStartTime,
          szEndTime = options.szEndTime;
        var szRtspIP = m_utilsInc.delPort(oDeviceInfo.szIP);
        var iRtspPort = oDeviceInfo.iRtspPort;
        if (options.iPort) {
          iRtspPort = options.iPort
        }
        szUrl = m_utilsInc.formatString(options.cgi, szRtspIP, iRtspPort, options.iChannelID);
        if (!m_utilsInc.isUndefined(options.oTransCodeParam)) {
          var szTransStreamXml = _generateTransCodeXml(options.oTransCodeParam);
          if ("" == szTransStreamXml) {
            return -1
          }
          m_pluginOBJECT.JS_SetTrsPlayBackParam(iWndIndex, szTransStreamXml)
        }
        var addToWndSet = function () {
          var wndInfo = new wndInfoClass;
          wndInfo.iIndex = iWndIndex;
          wndInfo.szIP = oDeviceInfo.szIP;
          wndInfo.iCGIPort = oDeviceInfo.iCGIPort;
          wndInfo.szDeviceIdentify = oDeviceInfo.szDeviceIdentify;
          wndInfo.iChannelID = options.iChannelID;
          wndInfo.iPlayStatus = PLAY_STATUS_PLAYBACK;
          m_wndSet.push(wndInfo)
        };
        m_pluginOBJECT.JS_Play(szUrl, {
          auth: oDeviceInfo.szAuth,
          userInfo: oDeviceInfo.szAuth
        }, iWndIndex, szStartTime, szEndTime, options.bFlag)
          .then(() => {
            addToWndSet();
            resolve()
          }, () => {
            reject()
          })
      });
      return oPromise
    };
    ISAPIProtocol.prototype.reversePlayback = function (oDeviceInfo, options) {
      let oPromise = new Promise(function (resolve, reject) {
        var iWndIndex = options.iWndIndex,
          szStartTime = options.szStartTime,
          szEndTime = options.szEndTime;
        var szRtspIP = m_utilsInc.delPort(oDeviceInfo.szIP);
        var iRtspPort = oDeviceInfo.iRtspPort;
        if (options.iPort) {
          iRtspPort = options.iPort
        }
        var szUrl = m_utilsInc.formatString(options.cgi, szRtspIP, iRtspPort, options.iChannelID);
        m_pluginOBJECT.JS_ReversePlay(szUrl, {
          auth: oDeviceInfo.szAuth,
          userInfo: oDeviceInfo.szAuth
        }, iWndIndex, szStartTime, szEndTime)
          .then(() => {
            var wndInfo = new wndInfoClass;
            wndInfo.iIndex = iWndIndex;
            wndInfo.szIP = oDeviceInfo.szIP;
            wndInfo.iCGIPort = oDeviceInfo.iCGIPort;
            wndInfo.szDeviceIdentify = oDeviceInfo.szDeviceIdentify;
            wndInfo.iChannelID = options.iChannelID;
            wndInfo.iPlayStatus = PLAY_STATUS_REVERSE_PLAYBACK;
            m_wndSet.push(wndInfo);
            resolve()
          }, () => {
            reject()
          })
      });
      return oPromise
    };
    ISAPIProtocol.prototype.startDownloadRecord = function (oDeviceInfo, options) {
      var szUrl = m_utilsInc.formatString(this.CGI.startDownloadRecord, oDeviceInfo.szHttpProtocol, oDeviceInfo.szIP, oDeviceInfo.iCGIPort);
      var szDownXml = "<?xml version='1.0' encoding='UTF-8'?>" + "<downloadRequest>" + "<playbackURI>" + m_utilsInc.escape(options.szPlaybackURI) + "</playbackURI>" + "</downloadRequest>";
      return m_pluginOBJECT.JS_StartAsyncDownload(szUrl, oDeviceInfo.szAuth, options.szFileName, szDownXml, options.bDateDir)
    };
    ISAPIProtocol.prototype.exportDeviceConfig = function (oDeviceInfo) {
      var szUrl = m_utilsInc.formatString(this.CGI.downloaddeviceConfig, oDeviceInfo.szHttpProtocol, oDeviceInfo.szIP, oDeviceInfo.iCGIPort);
      return m_pluginOBJECT.JS_DownloadFile(szUrl, oDeviceInfo.szAuth, "", 0)
    };
    ISAPIProtocol.prototype.importDeviceConfig = function (oDeviceInfo, options) {
      var szUrl = m_utilsInc.formatString(this.CGI.uploaddeviceConfig, oDeviceInfo.szHttpProtocol, oDeviceInfo.szIP, oDeviceInfo.iCGIPort);
      return m_pluginOBJECT.JS_StartAsynUpload(szUrl, "", oDeviceInfo.szAuth, options.szFileName, 0)
    };
    ISAPIProtocol.prototype.restart = function (oDeviceInfo, options) {
      var newOptions = {
        type: "PUT",
        success: null,
        error: null
      };
      return m_webVideoCtrl.I_SendHTTPRequest(oDeviceInfo.szDeviceIdentify, this.CGI.restart, newOptions)
    };
    ISAPIProtocol.prototype.restore = function (oDeviceInfo, szMode, options) {
      var szUrl = m_utilsInc.formatString(this.CGI.restore, oDeviceInfo.szHttpProtocol, oDeviceInfo.szIP, oDeviceInfo.iCGIPort, szMode);
      var newOptions = {
        type: "PUT",
        url: szUrl,
        success: null,
        error: null
      };
      return m_webVideoCtrl.I_SendHTTPRequest(oDeviceInfo.szDeviceIdentify, "", newOptions)
    };
    ISAPIProtocol.prototype.startUpgrade = function (oDeviceInfo, szFileName) {
      var szUpgradeURL = m_utilsInc.formatString(this.CGI.startUpgrade.upgrade, oDeviceInfo.szHttpProtocol, oDeviceInfo.szIP, oDeviceInfo.iCGIPort),
        szStatusURL = m_utilsInc.formatString(this.CGI.startUpgrade.status, oDeviceInfo.szHttpProtocol, oDeviceInfo.szIP, oDeviceInfo.iCGIPort);
      return m_pluginOBJECT.JS_StartUpgrade(szUpgradeURL, "", oDeviceInfo.szAuth, szFileName)
    };
    ISAPIProtocol.prototype.set3DZoom = function (oDeviceInfo, oWndInfo, oPoints, options) {
      var iChannelID = oWndInfo.iChannelID,
        szUrl = "";
      if (iChannelID <= oDeviceInfo.iAnalogChannelNum) {
        szUrl = m_utilsInc.formatString(this.CGI.set3DZoom.analog, oDeviceInfo.szHttpProtocol, oDeviceInfo.szIP, oDeviceInfo.iCGIPort, oWndInfo.iChannelID)
      } else {
        szUrl = m_utilsInc.formatString(this.CGI.set3DZoom.digital, oDeviceInfo.szHttpProtocol, oDeviceInfo.szIP, oDeviceInfo.iCGIPort, oWndInfo.iChannelID)
      }
      if (oPoints[0][0] === 0 && oPoints[0][1] === 0 && !(oPoints[2][0] === 0 && oPoints[2][1] === 0)) {
        oPoints[0][0] = oPoints[2][0];
        oPoints[0][1] = oPoints[2][1]
      }
      var szXml = "<?xml version='1.0' encoding='UTF-8'?><Position3D><StartPoint>" + "<positionX>" + parseInt(oPoints[0][0] * 255, 10) + "</positionX>" + "<positionY>" + (255 - parseInt(oPoints[0][1] * 255, 10)) + "</positionY>" + "</StartPoint><EndPoint><positionX>" + parseInt(oPoints[2][0] * 255, 10) + "</positionX>" + "<positionY>" + (255 - parseInt(oPoints[2][1] * 255, 10)) + "</positionY></EndPoint></Position3D>";
      var httpClient = new HttpPluginClient;
      var newOptions = {
        type: "PUT",
        url: szUrl,
        data: szXml,
        success: null,
        error: null
      };
      m_utilsInc.extend(newOptions, options);
      return m_webVideoCtrl.I_SendHTTPRequest(oDeviceInfo.szDeviceIdentify, "", newOptions)
    };
    ISAPIProtocol.prototype.getSDKCapa = function (oDeviceInfo, options) {
      return m_webVideoCtrl.I_SendHTTPRequest(oDeviceInfo.szDeviceIdentify, this.CGI.SDKCapabilities, options)
    };
    ISAPIProtocol.prototype.deviceCapturePic = function (oDeviceInfo, iChannelID, szPicName, options) {
      var iChannelID = iChannelID * 100 + 1;
      var iRet = -1;
      var szUrl = m_utilsInc.formatString(this.CGI.deviceCapture.channels, oDeviceInfo.szHttpProtocol, oDeviceInfo.szIP, oDeviceInfo.iCGIPort, iChannelID);
      var aQuery = [];
      if (m_utilsInc.isInt(options.iResolutionWidth)) {
        aQuery.push("videoResolutionWidth=" + options.iResolutionWidth)
      }
      if (m_utilsInc.isInt(options.iResolutionHeight)) {
        aQuery.push("videoResolutionHeight=" + options.iResolutionHeight)
      }
      if (aQuery.length > 0) {
        szUrl += "?" + aQuery.join("&")
      }
      var JDeviceCapturePic = function (szUrl, szFileName) {
        var szFileFormat = ".jpg";
        $("body")
          .append('<a id="jsplugin_download_a" href="' + szUrl + '" download=' + szFileName + szFileFormat + '><li id="jsplugin_download_li"></li></a>');
        $("#jsplugin_download_li")
          .trigger("click");
        $("#jsplugin_download_a")
          .remove();
        return 0
      };
      iRet = JDeviceCapturePic(szUrl, szPicName);
      return iRet
    };
    ISAPIProtocol.prototype.digestLogin = function (szIP, iProtocol, iPort, szUserName, szPassword, options) {
      var szHttpProtocol = "";
      if (iProtocol == 2) {
        szHttpProtocol = "https://"
      } else {
        szHttpProtocol = "http://"
      }
      var szUrl = m_utilsInc.formatString(this.CGI.login, szHttpProtocol, szIP, iPort);
      var newOptions = {
        type: "GET",
        url: szUrl,
        auth: m_utilsInc.Base64.encode(":" + szUserName + ":" + szPassword),
        success: null,
        error: null
      };
      var szDeviceIdentify = szIP + "_" + iPort;
      m_utilsInc.extend(newOptions, options);
      return m_webVideoCtrl.I_SendHTTPRequest(szDeviceIdentify, "", newOptions)
    };
    ISAPIProtocol.prototype.getSystemCapa = function (oDeviceInfo, options) {
      return m_webVideoCtrl.I_SendHTTPRequest(oDeviceInfo.szDeviceIdentify, this.CGI.systemCapabilities, options)
    };
    (function (wvc) {
      var XML = function (xd) {
        this.elems = [];
        this.length = 0;
        this.length = this.elems.push(xd)
      };
      XML.prototype.find = function (szNodeName, bRet) {
        var oXmlNode = this.elems[this.length - 1] ? this.elems[this.length - 1].getElementsByTagName(szNodeName) : [];
        this.length = this.elems.push(oXmlNode);
        if (bRet) {
          return oXmlNode
        } else {
          return this
        }
      };
      XML.prototype.eq = function (i, bRet) {
        var iLen = this.elems[this.length - 1].length,
          oXmlNode = null;
        if (iLen > 0 && i < iLen) {
          oXmlNode = this.elems[this.length - 1][i]
        }
        this.length = this.elems.push(oXmlNode);
        if (bRet) {
          return oXmlNode
        } else {
          return this
        }
      };
      XML.prototype.text = function (szText) {
        if (this.elems[this.length - 1]) {
          if (szText) {
            if (window.DOMParser) {
              this.elems[this.length - 1].textContent = szText
            } else {
              this.elems[this.length - 1].text = szText
            }
          } else {
            if (window.DOMParser) {
              return this.elems[this.length - 1].textContent
            } else {
              return this.elems[this.length - 1].text
            }
          }
        } else {
          return ""
        }
      };
      XML.prototype.attr = function (szAttrName) {
        if (this.elems[this.length - 1]) {
          var oAttr = this.elems[this.length - 1].attributes.getNamedItem(szAttrName);
          if (oAttr) {
            return oAttr.value
          } else {
            return ""
          }
        }
      };
      wvc.$XML = function (xd) {
        return new XML(xd)
      }
    })(this);
    var Utils = function () { };
    Utils.prototype.extend = function () {
      var target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        options;
      for (; i < length; i++) {
        if ((options = arguments[i]) != null) {
          for (var name in options) {
            var src = target[name],
              copy = options[name];
            if (target === copy) {
              continue
            }
            if ("object" == typeof copy) {
              target[name] = this.extend({}, copy)
            } else if (copy !== undefined) {
              target[name] = copy
            }
          }
        }
      }
      return target
    };
    Utils.prototype.browser = function () {
      var rchrome = /(chrome)[ \/]([\w.]+)/;
      var rsafari = /(safari)[ \/]([\w.]+)/;
      var ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/;
      var rmsie = /(msie) ([\w.]+)/;
      var rmsie2 = /(trident.*rv:)([\w.]+)/;
      var rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/;
      var ua = navigator.userAgent.toLowerCase();
      var match = rchrome.exec(ua) || rsafari.exec(ua) || ropera.exec(ua) || rmsie.exec(ua) || rmsie2.exec(ua) || ua.indexOf("compatible") < 0 && rmozilla.exec(ua) || ["unknow", "0"];
      if (match.length > 0 && match[1].indexOf("trident") > -1) {
        match[1] = "msie"
      }
      var oBrowser = {};
      oBrowser[match[1]] = true;
      oBrowser.version = match[2];
      return oBrowser
    };
    Utils.prototype.loadXML = function (szXml) {
      if (null == szXml || "" == szXml) {
        return null
      }
      var oXmlDoc = null;
      if (window.DOMParser) {
        var oParser = new DOMParser;
        oXmlDoc = oParser.parseFromString(szXml, "text/xml")
      } else {
        oXmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        oXmlDoc.async = false;
        oXmlDoc.loadXML(szXml)
      }
      return oXmlDoc
    };
    Utils.prototype.toXMLStr = function (oXmlDoc) {
      var szXmlDoc = "";
      try {
        var oSerializer = new XMLSerializer;
        szXmlDoc = oSerializer.serializeToString(oXmlDoc)
      } catch (e) {
        try {
          szXmlDoc = oXmlDoc.xml
        } catch (e) {
          return ""
        }
      }
      if (szXmlDoc.indexOf("<?xml") == -1) {
        szXmlDoc = "<?xml version='1.0' encoding='utf-8'?>" + szXmlDoc
      }
      return szXmlDoc
    };
    Utils.prototype.escape = function (szStr) {
      if (szStr) {
        return szStr.replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
      }
      return szStr
    };
    Utils.prototype.dateFormat = function (oDate, fmt) {
      var o = {
        "M+": oDate.getMonth() + 1,
        "d+": oDate.getDate(),
        "h+": oDate.getHours(),
        "m+": oDate.getMinutes(),
        "s+": oDate.getSeconds(),
        "q+": Math.floor((oDate.getMonth() + 3) / 3),
        S: oDate.getMilliseconds()
      };
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (oDate.getFullYear() + "")
          .substr(4 - RegExp.$1.length))
      }
      for (var k in o) {
        if (new RegExp("(" + k + ")")
          .test(fmt)) {
          fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k])
            .substr(("" + o[k])
              .length))
        }
      }
      return fmt
    };
    Utils.prototype.Base64 = {
      _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
      encode: function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = Utils.prototype.Base64._utf8_encode(input);
        while (i < input.length) {
          chr1 = input.charCodeAt(i++);
          chr2 = input.charCodeAt(i++);
          chr3 = input.charCodeAt(i++);
          enc1 = chr1 >> 2;
          enc2 = (chr1 & 3) << 4 | chr2 >> 4;
          enc3 = (chr2 & 15) << 2 | chr3 >> 6;
          enc4 = chr3 & 63;
          if (isNaN(chr2)) {
            enc3 = enc4 = 64
          } else if (isNaN(chr3)) {
            enc4 = 64
          }
          output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4)
        }
        return output
      },
      decode: function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
          enc1 = this._keyStr.indexOf(input.charAt(i++));
          enc2 = this._keyStr.indexOf(input.charAt(i++));
          enc3 = this._keyStr.indexOf(input.charAt(i++));
          enc4 = this._keyStr.indexOf(input.charAt(i++));
          chr1 = enc1 << 2 | enc2 >> 4;
          chr2 = (enc2 & 15) << 4 | enc3 >> 2;
          chr3 = (enc3 & 3) << 6 | enc4;
          output = output + String.fromCharCode(chr1);
          if (enc3 != 64) {
            output = output + String.fromCharCode(chr2)
          }
          if (enc4 != 64) {
            output = output + String.fromCharCode(chr3)
          }
        }
        output = Utils.prototype.Base64._utf8_decode(output);
        return output
      },
      _utf8_encode: function (string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
          var c = string.charCodeAt(n);
          if (c < 128) {
            utftext += String.fromCharCode(c)
          } else if (c > 127 && c < 2048) {
            utftext += String.fromCharCode(c >> 6 | 192);
            utftext += String.fromCharCode(c & 63 | 128)
          } else {
            utftext += String.fromCharCode(c >> 12 | 224);
            utftext += String.fromCharCode(c >> 6 & 63 | 128);
            utftext += String.fromCharCode(c & 63 | 128)
          }
        }
        return utftext
      },
      _utf8_decode: function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;
        while (i < utftext.length) {
          c = utftext.charCodeAt(i);
          if (c < 128) {
            string += String.fromCharCode(c);
            i++
          } else if (c > 191 && c < 224) {
            c2 = utftext.charCodeAt(i + 1);
            string += String.fromCharCode((c & 31) << 6 | c2 & 63);
            i += 2
          } else {
            c2 = utftext.charCodeAt(i + 1);
            c3 = utftext.charCodeAt(i + 2);
            string += String.fromCharCode((c & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
            i += 3
          }
        }
        return string
      }
    };
    Utils.prototype.createEventScript = function (szFor, szEvent, szHtml) {
      var oScript = document.createElement("script");
      oScript.htmlFor = szFor;
      oScript.event = szEvent;
      oScript.innerHTML = szHtml;
      document.body.parentNode.appendChild(oScript)
    };
    Utils.prototype.isInt = function (str) {
      return /^\d+$/.test(str)
    };
    Utils.prototype.getDirName = function () {
      var szDirName = "";
      if (m_options.szBasePath !== "") {
        szDirName = m_options.szBasePath
      } else {
        var szDirNameRegex = /[^?#]*\//;
        var oScript = document.getElementById("videonode");
        if (oScript) {
          szDirName = oScript.src.match(szDirNameRegex)[0]
        } else {
          var aScript = document.scripts;
          for (var i = 0, iLen = aScript.length; i < iLen; i++) {
            if (aScript[i].src.indexOf("webVideoCtrl.js") > -1) {
              oScript = aScript[i];
              break
            }
          }
          if (oScript) {
            szDirName = oScript.src.match(szDirNameRegex)[0]
          }
        }
      }
      return szDirName
    };
    Utils.prototype.loadScript = function (url, callback) {
      var oScript = document.createElement("script");
      oScript.type = "text/javascript";
      oScript.onload = function () {
        callback()
      };
      oScript.src = url;
      document.getElementsByTagName("head")[0].appendChild(oScript)
    };
    Utils.prototype.cookie = function (key, value, options) {
      if (arguments.length > 1 && (value === null || typeof value !== "object")) {
        options = this.extend({}, options);
        if (value === null) {
          options.expires = -1
        }
        if (typeof options.expires === "number") {
          var days = options.expires,
            t = options.expires = new Date;
          t.setDate(t.getDate() + days)
        }
        return document.cookie = [encodeURIComponent(key), "=", options.raw ? String(value) : encodeURIComponent(String(value)), options.expires ? "; expires=" + options.expires.toUTCString() : "", options.path ? "; path=" + options.path : "; path=/", options.domain ? "; domain=" + options.domain : "", options.secure ? "; secure" : ""].join("")
      }
      options = value || {};
      var result, decode = options.raw ? function (s) {
        return s
      } : decodeURIComponent;
      return (result = new RegExp("(?:^|; )" + encodeURIComponent(key) + "=([^;]*)")
        .exec(document.cookie)) ? decode(result[1]) : null
    };
    Utils.prototype.isUndefined = function (o) {
      return typeof o === "undefined"
    };
    Utils.prototype.isObject = function (o) {
      return Object.prototype.toString.call(o) === "[object Object]"
    };
    Utils.prototype.delPort = function (szIP) {
      var iPos = szIP.indexOf(":");
      if (iPos > -1) {
        return szIP.substring(0, iPos)
      } else {
        return szIP
      }
    };
    Utils.prototype.formatString = function () {
      var string = arguments[0];
      for (var i = 1; i < arguments.length; i++) {
        string = string.replace("%s", arguments[i])
      }
      return string
    };
    Utils.prototype.encodeString = function (str) {
      if (str) {
        return str.replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
      } else {
        return ""
      }
    };
    Utils.prototype.formatPolygonXmlToJson = function (szXml) {
      var oXml = this.loadXML(szXml);
      var aPolygonList = [];
      var aPoints = [];
      var aRect = [];
      var aAddPolygon = [];
      var aAddRect = [];
      var oData;

      function colorTransfer(szColor) {
        var iValue = parseInt(szColor, 10);
        var szValue = iValue.toString(16);
        szValue = "0" + szValue;
        return szValue.substring(szValue.length - 2)
      }
      $(oXml)
        .find("SnapPolygon")
        .each(function () {
          var iEditType = parseInt($(this)
            .find("EditType, editType")
            .text(), 10) || 0;
          var isClose = $(this)
            .find("isClosed")
            .text() === "true";
          var iPolygonType = parseInt($(this)
            .find("polygonType")
            .text(), 10);
          var fShowSquare = parseFloat($(this)
            .find("showSquare")
            .text()) || 0;
          var szTips = $(this)
            .find("tips")
            .text() || $(this)
              .find("Tips")
              .text();
          var iTipsPos = parseInt($(this)
            .find("tipsPos")
            .text(), 10) || 0;
          var bShowWH = $(this)
            .find("showWH")
            .text() === "true";
          var szColor = "#" + colorTransfer($(this)
            .find("r")
            .text()) + colorTransfer($(this)
              .find("g")
              .text()) + colorTransfer($(this)
                .find("b")
                .text());
          var iMaxPoint = parseInt($(this)
            .find("PointNumMax")
            .text(), 10) - 1;
          var iMinPoint = parseInt($(this)
            .find("MinClosed")
            .text(), 10) - 1;
          var iId = parseInt($(this)
            .find("id")
            .text(), 10);
          var iRedrawMode = parseInt($(this)
            .find("RedrawMode")
            .text(), 10) || 0;
          if ($(this)
            .find("pointList")
            .find("point")
            .length === 0) {
            if (iPolygonType === 1) {
              aAddPolygon.push({
                id: iId,
                tips: szTips,
                drawColor: szColor,
                translucent: .1,
                maxShapeSupport: 1,
                maxPointSupport: iMaxPoint,
                minPointSupport: iMinPoint,
                showWH: bShowWH,
                redrawMode: iRedrawMode
              })
            } else if (iPolygonType === 0) {
              aAddRect.push({
                id: iId,
                tips: szTips,
                drawColor: szColor,
                translucent: .1,
                widthHeightRate: fShowSquare,
                maxShapeSupport: 1,
                type: 1,
                redrawMode: iRedrawMode,
                tipsPos: iTipsPos
              })
            }
          } else {
            aPoints = [];
            $(this)
              .find("pointList")
              .find("point")
              .each(function () {
                aPoints.push([parseFloat($(this)
                  .find("x")
                  .text()), parseFloat($(this)
                    .find("y")
                    .text())])
              });
            oData = {
              id: iId,
              editType: iEditType,
              points: aPoints,
              closed: isClose,
              tips: szTips,
              drawColor: szColor,
              maxPointSupport: iMaxPoint,
              minPointSupport: iMinPoint,
              translucent: .1,
              redrawMode: iRedrawMode
            };
            if (iPolygonType === 1) {
              oData["showWH"] = bShowWH;
              aPolygonList.push(oData)
            } else if (iPolygonType === 0) {
              oData["widthHeightRate"] = fShowSquare;
              oData["type"] = 1;
              oData.tipsPos = iTipsPos;
              aRect.push(oData)
            }
          }
        });
      return {
        aRect: aRect,
        aPolygon: aPolygonList,
        aAddRect: aAddRect,
        aAddPolygon: aAddPolygon
      }
    };
    Utils.prototype.formatPolygonJsonToXml = function (aData) {
      function colorRgb(szHex) {
        var sColor = szHex.toLowerCase();
        var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
        if (sColor && reg.test(sColor)) {
          var i;
          if (sColor.length === 4) {
            var sColorNew = "#";
            for (i = 1; i < 4; i += 1) {
              sColorNew += sColor.slice(i, i + 1)
                .concat(sColor.slice(i, i + 1))
            }
            sColor = sColorNew
          }
          var aColorChange = [];
          for (i = 1; i < 7; i += 2) {
            aColorChange.push(parseInt("0x" + sColor.slice(i, i + 2), 16))
          }
          return aColorChange
        }
        return [0, 0, 0]
      }
      var aPolygon = aData[0];
      var aRect = aData[1];
      var szXml = "<?xml version='1.0' encoding='utf-8'?><SnapPolygonList>";
      var that = this;
      $.each(aPolygon, function (index, oVal) {
        var aColor = [0, 0, 0];
        if (oVal.drawColor) {
          aColor = colorRgb(oVal.drawColor)
        } else {
          aColor = colorRgb("#FF0000")
        }
        szXml += "<SnapPolygon>";
        szXml += "<id>" + oVal.id + "</id>";
        oVal.tips = that.encodeString(oVal.tips);
        if (!oVal.tips) {
          szXml += "<tips></tips>"
        } else {
          szXml += "<tips>" + oVal.tips + "</tips>"
        }
        szXml += "<isClosed>" + oVal.closed.toString() + "</isClosed>";
        szXml += "<color><r>" + aColor[0] + "</r><g>" + aColor[1] + "</g><b>" + aColor[2] + "</b></color>";
        szXml += "<polygonType>1</polygonType>";
        szXml += "<PointNumMax>" + (oVal.pointNumMax ? oVal.pointNumMax : 10) + "</PointNumMax>";
        szXml += "<MinClosed>" + (oVal.minClosed ? oVal.minClosed : 4) + "</MinClosed>";
        szXml += "<pointList>";
        $.each(oVal.points, function (i, aVal) {
          szXml += "<point><x>" + aVal[0] + "</x><y>" + aVal[1] + "</y></point>"
        });
        szXml += "</pointList>";
        szXml += "</SnapPolygon>"
      });
      $.each(aRect, function (index, oVal) {
        var aColor = [0, 0, 0];
        if (oVal.drawColor) {
          aColor = colorRgb(oVal.drawColor)
        } else {
          aColor = colorRgb("#FF0000")
        }
        szXml += "<SnapPolygon>";
        szXml += "<id>" + oVal.id + "</id>";
        szXml += "<color><r>" + aColor[0] + "</r><g>" + aColor[1] + "</g><b>" + aColor[2] + "</b></color>";
        szXml += "<polygonType>0</polygonType>";
        oVal.tips = that.encodeString(oVal.tips);
        if (!oVal.tips) {
          szXml += "<tips></tips>"
        } else {
          szXml += "<tips>" + oVal.tips + "</tips>"
        }
        if (typeof oVal.closed !== "undefined" && oVal.closed !== null) {
          szXml += "<isClosed>" + oVal.closed.toString() + "</isClosed>"
        } else {
          szXml += "<isClosed>true</isClosed>"
        }
        szXml += "<pointList>";
        var aRectTmp = [];
        if (oVal.points.length) {
          var iMinX = 2;
          var iMaxX = -1;
          var iMinY = 2;
          var iMaxY = -1;
          $.each(oVal.points, function () {
            if (iMinX > this[0]) {
              iMinX = this[0]
            }
            if (iMinY > this[1]) {
              iMinY = this[1]
            }
            if (iMaxX < this[0]) {
              iMaxX = this[0]
            }
            if (iMaxY < this[1]) {
              iMaxY = this[1]
            }
          });
          aRectTmp.push([iMinX, iMinY]);
          aRectTmp.push([iMaxX, iMinY]);
          aRectTmp.push([iMaxX, iMaxY]);
          aRectTmp.push([iMinX, iMaxY])
        }
        $.each(aRectTmp, function (i, aVal) {
          szXml += "<point><x>" + aVal[0] + "</x><y>" + aVal[1] + "</y></point>"
        });
        szXml += "</pointList>";
        szXml += "</SnapPolygon>"
      });
      szXml += "</SnapPolygonList>";
      return szXml
    };
    Utils.prototype.convertToUTCTime = function (szLocalTime, szFormat) {
      if (typeof szFormat == "undefined") {
        szFormat = "yyyy-MM-dd hh:mm:ss"
      }
      szLocalTime = szLocalTime.replace("T", " ")
        .replace("Z", "");
      var _dLocalDate = new Date(Date.parse(szLocalTime.replace(/-/g, "/")));
      _dLocalDate = this.utcDateFormat(_dLocalDate, szFormat);
      _dLocalDate = _dLocalDate.replace(" ", "T");
      return _dLocalDate
    };
    Utils.prototype.utcDateFormat = function (oDate, fmt) {
      var o = {
        "M+": oDate.getUTCMonth() + 1,
        "d+": oDate.getUTCDate(),
        "h+": oDate.getUTCHours(),
        "m+": oDate.getUTCMinutes(),
        "s+": oDate.getUTCSeconds(),
        "q+": Math.floor((oDate.getUTCMonth() + 3) / 3),
        S: oDate.getUTCMilliseconds()
      };
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (oDate.getUTCFullYear() + "")
          .substr(4 - RegExp.$1.length))
      }
      for (var k in o) {
        if (new RegExp("(" + k + ")")
          .test(fmt)) {
          fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k])
            .substr(("" + o[k])
              .length))
        }
      }
      return fmt
    };
    Utils.prototype.convertToLocalTime = function (szUTCTime, iDiffTime) {
      szUTCTime = szUTCTime.replace("T", " ")
        .replace("Z", "");
      if (typeof iDiffTime == "undefined") {
        iDiffTime = 0
      }
      var szFormat = "yyyy-MM-dd hh:mm:ss";
      var _aDate = szUTCTime.split(" ")[0].split("-");
      var _iFullYear = parseInt(_aDate[0], 10);
      var _iMonth = parseInt(_aDate[1], 10) - 1;
      var _iDay = parseInt(_aDate[2], 10);
      var _aTimes = szUTCTime.split(" ")[1].split(":");
      var _iHour = parseInt(_aTimes[0], 10);
      var _iMinute = parseInt(_aTimes[1], 10);
      var _iSecond = parseInt(_aTimes[2], 10);
      var _dLocalDate = new Date(Date.UTC(_iFullYear, _iMonth, _iDay, _iHour, _iMinute, _iSecond));
      _dLocalDate.setTime(_dLocalDate.getTime() + iDiffTime);
      return this.dateFormat(_dLocalDate, szFormat)
        .replace(" ", "T") + "Z"
    };

    function UUID() {
      this.id = this.createUUID()
    }
    UUID.prototype.valueOf = function () {
      return this.id
    };
    UUID.prototype.toString = function () {
      return this.id
    };
    UUID.prototype.createUUID = function () {
      var dg = new Date(1582, 10, 15, 0, 0, 0, 0);
      var dc = new Date;
      var t = dc.getTime() - dg.getTime();
      var h = "-";
      var tl = UUID.getIntegerBits(t, 0, 31);
      var tm = UUID.getIntegerBits(t, 32, 47);
      var thv = UUID.getIntegerBits(t, 48, 59) + "1";
      var csar = UUID.getIntegerBits(UUID.rand(4095), 0, 7);
      var csl = UUID.getIntegerBits(UUID.rand(4095), 0, 7);
      var n = UUID.getIntegerBits(UUID.rand(8191), 0, 7) + UUID.getIntegerBits(UUID.rand(8191), 8, 15) + UUID.getIntegerBits(UUID.rand(8191), 0, 7) + UUID.getIntegerBits(UUID.rand(8191), 8, 15) + UUID.getIntegerBits(UUID.rand(8191), 0, 15);
      return tl + h + tm + h + thv + h + csar + csl + h + n
    };
    UUID.getIntegerBits = function (val, start, end) {
      var base16 = UUID.returnBase(val, 16);
      var quadArray = new Array;
      var quadString = "";
      var i = 0;
      for (i = 0; i < base16.length; i++) {
        quadArray.push(base16.substring(i, i + 1))
      }
      for (i = Math.floor(start / 4); i <= Math.floor(end / 4); i++) {
        if (!quadArray[i] || quadArray[i] == "") quadString += "0";
        else quadString += quadArray[i]
      }
      return quadString
    };
    UUID.returnBase = function (number, base) {
      var convert = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
      if (number < base) var output = convert[number];
      else {
        var MSD = "" + Math.floor(number / base);
        var LSD = number - MSD * base;
        if (MSD >= base) var output = this.returnBase(MSD, base) + convert[LSD];
        else var output = convert[MSD] + convert[LSD]
      }
      return output
    };
    UUID.rand = function (max) {
      return Math.floor(Math.random() * max)
    };
    m_ISAPIProtocol = new ISAPIProtocol;
    m_utilsInc = new Utils;
    return this
  }();
  var NS = window.WebVideoCtrl3 = WebVideoCtrl3;
  NS.version = "3.3.1"
})(this);
if ("object" === typeof exports && typeof module !== "undefined") { } else if ("function" === typeof define && define.amd) {
  define(function () {
    return WebVideoCtrl3
  })
} else if ("function" === typeof define && define.cmd) {
  define(function (require, exports, module) {
    module.exports = WebVideoCtrl3
  })
} else { }
