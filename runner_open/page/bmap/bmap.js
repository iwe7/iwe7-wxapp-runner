let app = getApp();
let http = require("../../util/http.js");
import Tips from "../../util/tip";

class Point {
  constructor(latitude, longitude, iconPath) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.iconPath = iconPath;
  }

  getMarker() {
    return {
      latitude: this.latitude,
      longitude: this.longitude,
      iconPath: this.iconPath,
      width: 50,
      height: 50
    };
  }
}

class Control {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }

  getCenterControl(icon, size, offset) {
    return {
      id: 1,
      position: {
        left: (this.width - size) / 2 + offset,
        top: 5,
        width: size,
        height: size
      },
      iconPath: icon,
      clickable: true
    };
  }
}

let pageData = {
  data: {
    taskTypes: ['合伙拼单,省钱必备', '专人专单，速度优先', '尊贵优享，质量保障', '顺路捎带，兼职人员'],
    taskTypeSelect: '合伙拼单',
    showLocation: true,
    controls: [],
    latitude: 0,
    longitude: 0,
    markers: [],
    polyline: {},
    // 什么时间
    whatTime: "",
    whatDate: "今天",
    startDate: `${new Date().getFullYear()}-${new Date().getMonth() +
      1}-${new Date().getDate()}`,
    // 什么地点
    whatPosition: {},
    // 做什么事
    whatThing: "",
    steps: [],
    showTime: true,
    height: 450,
    op: 0,
    runners: [],
    startTime: `${new Date().getHours()}:${new Date().getMinutes()}`,
    order: {},
    task_id: 0,
    detail: {},
    timer: 180,
    timerCtrl: null,
    runnerTimer: false
  },
  onReady() {
    this.mapCtx = wx.createMapContext("myMap");
    this.setData({
      height: app.globalData.systemInfo.screenHeight - 250 - 75
    });
    let that = this;
    http.post(
      "hasNoFinishOrder",
      {
        uid: app.globalData.memberInfo.uid
      },
      res => {
        if (res.return_code) {
          Tips.toast(res.return_msg);
          if (res.id) {
            this.setData({
              op: 3,
              task_id: res.id
            });
            this.refreshDetail();
          }
        }
      }
    );
  },
  startTimer(){
    let that = this;
    this.runnerTimer = true;
    this.timerCtrl = setTimeout(()=>{
      that.data.timer = that.data.timer -1;
      that.setData({
        timer: that.data.timer
      });
      if(that.data.timer>0){
        that.startTimer();
      }else{
        this.runnerTimer = false;
      }
    },1000)
  },
  refreshDetail(){
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
      http.get(
        "getorderdetail",
        {
          id: this.data.task_id
        },
        res => {
          let points = [];
          res.data.steps.map((step, index) => {
            markers.push({
              id: "step" + (index + 1),
              latitude: step.lat,
              longitude: step.lng,
              title: step.note,
              iconPath: "/runner_open/image/bmap/map" + (index + 1) + ".png",
              width: 50,
              height: 50,
              label: {
                content: step.note,
                bgColor: '#000',
                color: '#fff',
                padding: 5,
                borderRadius: 5
              }
            });
            points.push({
              latitude: step.lat,
              longitude: step.lng
            })
          });
          if(res.data.driver_lastloc){
            markers.push({
              id: "driver",
              latitude: res.data.driver_lastloc.lat,
              longitude: res.data.driver_lastloc.lng,
              title: res.data.driver_jobnum,
              iconPath: "/runner_open/image/bmap/bike2.png",
              width: 50,
              height: 50,
              label: {
                content: res.data.driver_name,
                bgColor: '#000',
                color: '#fff',
                padding: 5,
                borderRadius: 5
              }
            })
          }
          this.setData({
            detail: res.data,
            polyline: res.data.polyline,
            steps: res.data.steps,
            markers: markers
          });
          this.mapCtx.includePoints({
            padding:  [-10],
            points: points
          })
          this.data.timer = 1;
          setTimeout(()=>{
            this.data.timer = 180;
            this.startTimer();
          },1000)
        }
      );
    });
  },
  listenerTimePickerSelected: function(e) {
    //调用setData()重新绘制
    this.data.whatTime = e.detail.value;
    this.setData({
      whatTime: this.data.whatTime
    });
  },
  bindTaskTypePickerChange: function(e){
    this.setData({
      taskTypeSelect: this.data.taskTypes[e.detail.value]
    });
  },
  TaskDelete: function(){
    http.post('tasks/del',{
      id: this.data.task_id
    },()=>{
      wx.navigateTo({
        url: '/runner_open/page/bmap/bmap'
      })
    })
  },
  taskFinishAndPay: function(){

  },
  cuicuiTask: function(){

  },
  listenerDatePickerSelected: function(e) {
    this.data.whatDate = e.detail.value;
    let str = this.data.whatDate + " 00:00";
    let selectDate = new Date(str).getTime();
    let now = new Date().getTime();
    if (selectDate < now) {
      this.setData({
        whatDate: this.data.whatDate,
        startTime: `${new Date().getHours()}:${
          new Date().getMinutes() > 10
            ? new Date().getMinutes()
            : "0" + new Date().getMinutes()
        }`,
        whatTime: ""
      });
    } else {
      this.setData({
        whatDate: this.data.whatDate,
        startTime: `00:00`
      });
    }
  },
  next() {
    let that = this;
    let count = this.data.steps.length + 1;
    let location = that.data.whatPosition;
    this.data.markers.push({
      id: "step" + count,
      latitude: location.latitude,
      longitude: location.longitude,
      title: that.data.whatThing,
      iconPath: "/runner_open/image/bmap/map" + count + ".png",
      width: 50,
      height: 50,
      label: {
        content: (that.data.steps.length > 0 ? "" : that.data.whatDate + " ")  + (that.data.whatTime ? that.data.whatTime : '越快越好') + " " + that.data.whatThing,
        bgColor: '#000',
        color: '#fff',
        padding: 5,
        borderRadius: 5
      }
    });
    this.data.steps.push({
      time: that.data.whatDate + " " + (that.data.whatTime ? that.data.whatTime : '越快越好'),
      position: location.address,
      lat: location.latitude,
      lng: location.longitude,
      note: (that.data.steps.length > 1 ? "" : that.data.whatDate + " ") + (that.data.whatTime ? that.data.whatTime : '越快越好') + " " + that.data.whatThing
    });
    this.setData({
      steps: this.data.steps,
      markers: this.data.markers,
      whatTime: "然后",
      whatPosition: {},
      whatThing: ""
    });
  },
  handelSteps(steps){
    
  },
  delete(e) {
    let index = e.target.dataset.index;
    this.data.steps.splice(index, 1);
    this.setData({
      steps: this.data.steps
    });
  },
  // 确认下单
  finish() {
    http.post(
      "getTaskPrice",
      {
        origin_id: this.getOrderTid(),
        steps: this.data.steps,
        addfee: this.data.addfee
      },
      res => {
        if (res.return_code) {
          Tips.toast(res.return_msg);
          return;
        } else {
          this.data.order = res;
          this.drawLine(res.polyline);
          this.setData({
            op: 1,
            order: this.data.order,
            price_token: res.price_token
          });
        }
      }
    );
  },
  // 生成订单
  addOrder() {
    let memberInfo = app.globalData.memberInfo;
    let post = {
      price_token: this.data.price_token,
      from_avatar: memberInfo.avatarUrl,
      uid: memberInfo.uid,
      steps: this.data.steps,
      polyline: this.data.polyline,
      addfee: this.data.addfee,
      pubusermobile: memberInfo.mobile
    };
    http.post("addorder", post, res => {
      if (res.return_code) {
        Tips.toast(res.return_msg);
      }
      if (res.id) {
        this.setData({
          op: 3,
          task_id: res.id,
          detail: res.data
        });
        this.refreshDetail();
      }
    });
  },
  drawLine(routes) {
    let lines = [];
    if (!routes) {
      return;
    }
    routes.map(route => {
      route = this.format(route);
      for (let i = 0; i < route.length; i += 2) {
        lines.push({
          latitude: route[i],
          longitude: route[i + 1]
        });
      }
    });
    this.setData({
      polyline: [
        {
          points: lines,
          width: 5,
          color: "#000000AA",
          arrowLine: true
        }
      ]
    });
  },
  format(coors) {
    for (var i = 2; i < coors.length; i++) {
      coors[i] = coors[i - 2] + coors[i] / 1000000;
    }
    return coors;
  },
  cancelOrder() {
    this.setData({
      op: 0
    });
  },
  // 订单编号
  getOrderTid() {
    return "PTxxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(
      c
    ) {
      var r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  },
  // 时间选择
  confirmTime(e) {
    this.data.whatTime = e.detail.value;
  },
  // 小费
  confirmAddfee(e) {
    this.data.addfee = e.detail.value;
  },
  // 备注
  confirmThing(e) {
    this.data.whatThing = e.detail.value;
  },
  // 获取当前位置
  getLocation() {
    let that = this;
    wx.getLocation({
      success: function(res) {
        that.setLocation(res);
        that.ansycLocation(res);
      }
    });
  },
  // 设置当前位置
  setLocation(res) {
    // 解析当前位置
    this.setData({
      latitude: res.latitude,
      longitude: res.longitude
    });
  },
  // 解析当前位置
  ansycLocation(res){
    let loc = {
      lat: res.latitude,
      lng: res.longitude
    };
    http.post('qqmap/gcoder',loc,(result)=>{
      if (result.code == 0){
        let data = result.data;
        this.setData({
          whatPosition: {
            address: data.address,
            latitude: loc.lat,
            longitude: loc.lng
          }
        });
      }
    });
  },
  // 点击control
  controltap(e) {
    console.log(e);
  },
  // 点击marker
  markertap(e) {
    console.log(e);
  },
  regionchange(e) {
    this.mapCtx.getCenterLocation({
      success: function(res) {}
    });
  },
  // 选择地址
  chooseStartLocation() {
    let that = this;
    wx.chooseLocation({
      success: function(res) {
        that.setData({
          whatPosition: {
            address: res.address,
            latitude: res.latitude,
            longitude: res.longitude
          }
        });
      }
    });
  },
  // 加载初始化
  onLoad: function() {
    this.getLocation();
    let control = new Control(
      app.globalData.systemInfo.screenWidth,
      app.globalData.systemInfo.screenHeight
    );
    app.runnerNearBy(res => {
      let runners = res.contents;
      let markers = this.data.markers;
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
  }
};

Page(pageData);
