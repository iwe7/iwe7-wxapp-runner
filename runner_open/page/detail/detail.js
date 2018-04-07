let app = getApp();
let http = require("../../util/http.js");
import Tips from "../../util/tip";

let pageData = {
  data: {
    detail: {},
    howLocation: true,
    controls: [],
    latitude: 0,
    longitude: 0,
    markers: [],
    circles: {},
    polyline: {},
    height: 0,
    runners: []
  },
  onLoad: function(option) {
    let id = option.id;
    http.get(
      "getorderdetail",
      {
        id: id
      },
      res => {
        this.data.detail = res.data;
        this.setData({
          detail: this.data.detail
        });
        console.log(this.data.detail);
      }
    );
    this.getLocation();
    this.setData({
      height: app.globalData.systemInfo.screenHeight - 200 - 75
    });
    app.runnerNearBy(res => {
      let runners = res.contents;
      let markers = [];
      runners.map(runner => {
        markers.push({
          id: runner.mobile,
          latitude: runner.location[1],
          longitude: runner.location[0],
          title: runner.title,
          iconPath: "/runner_open/image/bmap/runner.png",
          width: 50,
          height: 50
        });
      });
      this.setData({
        markers: markers,
        runners: runners
      });
    });
  },
  getLocation() {
    let that = this;
    wx.getLocation({
      success: function(res) {
        that.setLocation(res);
      }
    });
  },
  setLocation(res) {
    this.setData({
      latitude: res.latitude,
      longitude: res.longitude
    });
  }
};

Page(pageData);
