import util from "we7/resource/js/util.js";
let http = require("runner_open/util/http.js");

App({
  onLaunch: function() {
    var that = this;
    wx.getSystemInfo({
      success: function(res) {
        that.globalData.systemInfo = res;
      }
    });
    wx.getUserInfo({
      success: function(res) {
        that.globalData.userInfo = res.userInfo;
      }
    });
    util.getUserInfo((res)=>{
      that.globalData.memberInfo = res.memberInfo;
    });
    this.runnerNearBy();
  },
  onShow: function() {
  },
  onHide: function() {
  },
  globalData: {
    hasLogin: false,
    userInfo: {},
    systemInfo: {},
    mobile: "",
    memberInfo: {}
  },
  siteInfo: require("siteinfo.js"),
  util: util,
  runnerNearBy: function(success) {
    let that = this;
    wx.getLocation({
      success: function(res) {
        that.globalData.location = res;
        let location = res;
        http.post(
          "runner/nearby",
          {
            position: { lat: location.latitude, lng: location.longitude },
            radius: 10000,
            sortby: "",
            filter: ""
          },
          nearby => {
            success && success(nearby);
          }
        );
      }
    });
  }
});
