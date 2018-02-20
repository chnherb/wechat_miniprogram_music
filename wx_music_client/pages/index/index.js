var app = getApp();
let rotate = 0;
Page({
  onReady: function() {
    // 使用 wx.createAudioContext 获取 audio 上下文 context
    // this.audioCtx = wx.createAudioContext('myAudio');
    // this.setData({
    //   findList:JSON.parse(this.data.jsondata)
    // })
    try {
      var aulist = wx.getStorageSync("audioList")
      // console.log("aulist")
      // console.log(aulist)
      if (!(aulist == undefined || aulist == "" || aulist == null)) {
        this.setData({
          audioList: aulist,
        });
        var index = wx.getStorageSync("audioIndex")
        // console.log("index")
        // console.log(index)
        if (!(index == undefined || index == "" || index == null)) {
          this.setData({
            audioIndex: index,
          });
        }
      }
    } catch (e) {
    }
  },
  onShareAppMessage: function () {
    return {
      title: '别忆澜',
      desc: '听最想听的!',
      path: '/pages/index/index'
    }
  },
  data: {
    // name: '',
    // musicUrl: '', // 链接地址
    // picUrl: '', // 图片地址
    // page: '', // 链接
    // singer: '', 
    input: '', // 输入框的内容
    transform: '', // 旋转动画属性
    rotateFlag: false, // 控制图片旋转
    showContainer: true, // 展示播放器或播放列表
    findList: [], // 搜索播放列表
    audioList:[],//播放列表
    audioIndex: -1,
    pauseStatus: true,
    hideStatus: false,
    searchStatus: true,//搜索状态，false为可搜索
    timer: '',
    starttime: '0:00',
    endtime: '0:00',
    mode: 'loop',//播放模式
    duration:0,
    lyric:[],
    lyricflag: false,
    dotsClass: [
      'on', ''
    ],
    currentTab: 1, // 导航栏切换索引
    navbar: [
      '搜索列表', '当前列表'
    ],
    // jsondata: '[{"name":"Mike","picUrl":"http://p1.music.126.net/x0S1Wi9chptqU4wGv7WNRw==/3427177747355011.jpg","musicUrl":"http://link.hhtjim.com/xiami/1770409076.mp3","page":"http://music.163.com/m/song/426739088","singer":"zhou","albumName":"lala"},{"name":"Mike","picUrl":"http://p1.music.126.net/x0S1Wi9chptqU4wGv7WNRw==/3427177747355011.jpg","musicUrl":"http://link.hhtjim.com/xiami/1770409076.mp3","page":"http://music.163.com/m/song/426739088","singer":"zhou","albumName":"lala"}]',
  },

  // 图片旋转函数
  myRotate: function() {
    rotate++;
    if (rotate == 360){
      rotate = 0;
    }
    let transform = `transform:rotate(${rotate}deg);`;
    this.setData({
      transform,
    });
    const animation = setTimeout(() => {
      this.myRotate();
    }, 30);
    if (this.data.pauseStatus || this.data.hideStatus || !this.data.showContainer || this.data.lyricflag) {
      clearTimeout(animation);
    };
  },
  bindShowPic: function(){
    if (this.data.lyricflag === true){
      this.setData({
        lyricflag: false,
      })
      this.myRotate()
    }
  },
  bindShowlyric: function(){
   
    if (this.data.audioIndex === -1){
      return
    }
    if (this.data.lyricflag === true) {
      this.setData({
        lyricflag: false,
      })
      this.myRotate()
    } else {
      this.setData({
        lyricflag: true,
      })
    }
    if (this.data.lyricflag === false){
      return
    }
    var lyricUrl = this.data.audioList[this.data.audioIndex].lyric
    var lyflag = false
    try {
      var lyricdic  = wx.getStorageSync("lyricdic")
      // console.log("lyricdic")
      // console.log(lyricdic)
      if (lyricdic == undefined || lyricdic == "" || lyricdic == null){
        // console.log("nulllll")
        lyflag = true
        lyricdic = {}
      }else{
        var lyr = lyricdic[sid]
        if (lyr == undefined || lyr == "" || lyr == null) {
          lyflag = true
          // console.log("lyr is nulllll")
        }else{
          this.setData({
            lyric: lyr,
          });
        }
      }
    } catch (e) {
      lyflag = true
    }
    if (lyflag){
      wx.request({
        method: 'GET',
        url: 'https://www.chnhuangbo.cn/xmlyric', //访问node端后台接口
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          lyric: lyricUrl,
        },
        success: (res) => {
          var lyric1 = this.parseLyric(res.data)
          // console.log("requestttttt")
          // console.log(lyric1)
          this.setData({
            lyric: lyric1,
          });
          try {
            if (Object.keys(lyricdic).length >= 30){
              lyricdic = {}
            }
            lyricdic[sid] = lyric1
            wx.setStorageSync("lyricdic", lyricdic)
          } catch (e) {
          }

        },
        error: () => {
          console.log('err');
        }
      });
    }
  },
  // 解析方法
  parseLyric: function (lrc) {
    var lyrics = lrc.split("\n");
    var lrcObj = {};
    for (var i = 0; i < lyrics.length; i++) {
      var lyric = decodeURIComponent(lyrics[i]);
      var timeReg = /\[\d*:\d*((\.|\:)\d*)*\]/g;
      var timeRegExpArr = lyric.match(timeReg);
      if (!timeRegExpArr)
        continue;
      var clause = lyric.replace(timeReg, '');
      if (clause.length > 0) {
        for (var k = 0, h = timeRegExpArr.length; k < h; k++) {
          var t = timeRegExpArr[k];
          var min = Number(String(t.match(/\[\d*/i)).slice(1)),
            sec = Number(String(t.match(/\:\d*/i)).slice(1));
          var time = min * 60 + sec;
          lrcObj[time] = clause;
        }
      }
    }
    return lrcObj;
  },

  bindTapPlay: function () {
    // console.log('bindTapPlay')
    // console.log(this.data.pauseStatus)
    if (this.data.pauseStatus === true) {
      this.setData({ pauseStatus: false })
      this.play() 
    } else {
      this.setData({ pauseStatus: true })
      wx.pauseBackgroundAudio()
    }
  },
  play: function() {
    if (this.data.audioIndex == -1){
      this.setData({ pauseStatus: true})
      return;
    }
    if (this.data.showContainer === true) {
      if (this.data.lyricflag === true){
        this.setData({
          lyricflag: false,
        });
      this.bindShowlyric()
      } else {
        this.myRotate()
      } 
    }
    wx.playBackgroundAudio({
      dataUrl: this.data.audioList[this.data.audioIndex].musicUrl,
      title: this.data.audioList[this.data.audioIndex].name,
      coverImgUrl: this.data.audioList[this.data.audioIndex].picUrl
    })
    try{
      wx.setStorageSync("audioIndex", this.data.audioIndex)
    } catch (e) {
    }
  },
  bindTapPrev: function () {
    // console.log("bindprev")
    if (this.data.audioIndex == -1) {
      this.setData({ pauseStatus: true })
      return;
    }
    var mode = this.data.mode
    if (mode === 'single') {
      return
    }else if(mode === 'loop'){
      let length = this.data.audioList.length
      let audioIndexPrev = this.data.audioIndex
      let audioIndexNow = audioIndexPrev
      if (audioIndexPrev === 0) {
        audioIndexNow = length - 1
      } else {
        audioIndexNow = audioIndexPrev - 1
      }
      this.setData({
        audioIndex: audioIndexNow,
      })
    }else{
      var curaudioindex = Math.floor(Math.random() * this.data.audioList.length)
      this.setData({
        audioIndex: curaudioindex,
      })
    }
    let that = this
    setTimeout(() => {
      if (that.data.pauseStatus === false) {
        that.play()
      }else{
        try {
          wx.setStorageSync("audioIndex", this.data.audioIndex)
        } catch (e) {
        }
      }
    }, 1000)
  },
  bindTapNext: function () {
    if (this.data.audioIndex == -1) {
      this.setData({ pauseStatus: true })
      return;
    }
    var mode = this.data.mode
    if (mode === 'single'){
      return
    }else if (mode === 'loop'){
      let length = this.data.audioList.length
      let audioIndexPrev = this.data.audioIndex
      let audioIndexNow = audioIndexPrev
      if (audioIndexPrev === length - 1) {
        audioIndexNow = 0
      } else {
        audioIndexNow = audioIndexPrev + 1
      }
      this.setData({
        audioIndex: audioIndexNow,
      })
    }else{
      var curaudioindex = Math.floor(Math.random() * this.data.audioList.length)
      this.setData({
        audioIndex: curaudioindex,
      })
    }
    let that = this
    setTimeout(() => {
      if (that.data.pauseStatus === false) {
        that.play()
      }else{
        try {
          wx.setStorageSync("audioIndex", this.data.audioIndex)
        } catch (e) {
        }
      }
    }, 1000)
    // wx.setStorageSync('audioIndex', audioIndexNow)
  },
  //监听用户输入
  bindMusicNameInput: function (e) {
    this.setData({
      input: e.detail.value,
    });
    if (this.data.searchStatus){
    this.setData({
      searchStatus: false,
    })}
  },
  // 按钮触发
  bindSearch: function(e) {
    this.setData({
      searchStatus: true,
    })
    var kword = this.data.input.replace(/^\s+|\s+$/g, "")
    if (kword != "")
    {
      this.getMusicInfos(kword);
    }
  },
  // getMusicInfos发送http请求
  getMusicInfos: function(musicname) {
    wx.request({
      method: 'GET',
      url: 'https://www.chnhuangbo.cn', //访问node端后台接口
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        keywords: musicname,
        userNickName: app.globalData.userInfo.nickName,
        
      },
      success: (res) => {
        // var json1 = JSON.parse(this.data.jsondata)
        // var jsonlist = []
        // jsonlist.push(json1)
        this.setData({
          findList: res.data,
          // list: json1,
          showContainer: false,
          currentTab:0,
          input:'',
        });
        
      },
      error: () => {
        console.log('err');
      }
    });
  },
  showList: function (e){
    if (this.data.showContainer === true){
      // if (this.data.audioIndex == -1){
      //   return
      // }
      this.setData({
        showContainer: false,
      });
      if (this.data.currentTab === 1){
        this.showCurList()
      }
    }else{
      this.setData({
        showContainer: true,
      });
      if (this.data.lyricflag === true) {
        this.setData({
          lyricflag: false,
        });
        this.bindShowlyric()
      } else {
        this.myRotate()
      }
    }
  },
  addMusic: function (e) {
    var item = this.data.findList[e.target.dataset.musicindex] 
    // console.log("item")
    // console.log(item)
    var flag = true
    var index = -1
    for (var j = 0, len = this.data.audioList.length; j < len; j++) {
      if (this.data.audioList[j].id == item.id){
        flag = false
        index = j
        break
      }
    }
    if(flag){
      var list = this.data.audioList
      list.push(item)
      // console.log("list")
      // console.log(list)
      this.setData({
        audioList:list,
        audioIndex: this.data.audioList.length - 1,
      })
      try {
        wx.setStorageSync("audioList", this.data.audioList)
      } catch (e) {
      }
    }else{
      this.setData({
        audioIndex: index,
      })
      if ( this.data.pauseStatus === true){
        this.setData({ pauseStatus: false })
      }
    }
    this.play()
  },
  changeMusic: function (e) {
    this.setData({
      // rotateFlag: true,
      audioIndex: e.target.dataset.musicindex,
    });
    // console.log("change")
    // console.log(this.data.audioList[this.data.audioIndex])
    if (this.data.pauseStatus === true) {
      this.setData({ pauseStatus: false })
    }
    this.play()
  },
  deletesong: function(e){
    console.log("clickimage")
    console.log(e.target.dataset.musicindex)
    var index = e.target.dataset.musicindex
    var list = this.data.audioList
    list.splice(index, 1)//1为删除长度
   
    if (this.data.audioList.length === 1){
      
      this.setData({
        pauseStatus: true,
        starttime: '0:00',
        endtime: '0:00',
      })
      wx.stopBackgroundAudio()
    } else if (index < this.data.audioIndex){
      this.setData({
        audioIndex: this.data.audioIndex - 1
      })
    } else if (index === this.data.audioIndex){
      this.setData({
        audioIndex: -1,
        pauseStatus: true,
        starttime: '0:00',
        endtime: '0:00',
      })
      wx.stopBackgroundAudio()
    }
    this.setData({
      audioList: list
    })
    try {
      wx.setStorageSync("audioList", this.data.audioList)
    } catch (e) {
    }
    if (list.length === 0){
      this.setData({
        audioIndex: -1
      })
    }
  },
  addsong: function(e){
    var item = this.data.findList[e.target.dataset.musicindex]
    var flag = true
    for (var j = 0, len = this.data.audioList.length; j < len; j++) {
      if (this.data.audioList[j].id == item.id) {
        flag = false
        break
      }
    }
    if (flag) {
      var list = this.data.audioList
      list.push(item)
      this.setData({
        audioList: list,
      })
      try {
        wx.setStorageSync("audioList", this.data.audioList)
      } catch (e) {
      }
    }
    wx.showToast({
      title: '已添加至列表',
      duration: 300,
    })
  },
  // onLoad为生命周期函数
  onLoad: function() {
    
    app.getUserInfo(function(userInfo){
    })

    let that = this
    wx.onBackgroundAudioStop(function () {
      if (that.data.audioIndex === -1){
        return
      }
      var mode = that.data.mode
      if (mode === 'loop'){
        let length = that.data.audioList.length
        let audioIndexNow = 0
        if (that.data.audioIndex != length - 1){
          audioIndexNow = that.data.audioIndex + 1
        }
        that.setData({
          audioIndex: audioIndexNow,
          pauseStatus: that.data.pauseStatus
        })
      }else if (mode === 'random'){
        var curaudioindex = Math.floor(Math.random() * that.data.audioList.length)
        that.setData({
          audioIndex: curaudioindex,
          pauseStatus: that.data.pauseStatus
        })
      }
      that.play()
    }
    )
    //监听暂停状态
    wx.onBackgroundAudioPause(function(){
      if (that.data.pauseStatus === true){
        return
      }
      //如果不是在小程序界面点击暂停
      that.setData({
        pauseStatus: true
      })
    })
    //监听开始状态
    wx.onBackgroundAudioPlay(function(){
      if (that.data.pauseStatus === false) {
        return
      }
      //如果不是在小程序界面点击开始
      that.setData({
        pauseStatus: false
      })
      // that.play() 
      that.myRotate()
    })
    //监听播放状态
    setInterval(function () {
      //循环执行代码  
      if (that.data.pauseStatus || that.data.hideStatus) {
        return
      }
      wx.getBackgroundAudioPlayerState({
        success: function (res) {
          // var status = res.status
          // var dataUrl = res.dataUrl
          var currentPosition = res.currentPosition
          var duration = res.duration
          // var downloadPercent = res.downloadPercent
          if (!currentPosition){
            currentPosition = 0
            duration = 0
          }
          that.setData({
            starttime: that.formatTime(currentPosition),
            endtime: that.formatTime(duration - currentPosition),
            percent: currentPosition / duration * 100,
            duration: duration,
          })
        },
        fail: function(res) {
          that.setData({
            starttime: '0:00',
            endtime: '0:00',
            percent: 0,
            duration: 0,
          })
        }
      })
    }, 1000) //循环时间 这里是1秒  
  },
  onHide: function(){
    this.setData({
      hideStatus: true
    })
  },
  onShow: function(){
    this.setData({
      hideStatus: false
    })
    this.myRotate()
    // console.log("show")
  },
  formatTime: function(seconds){
    var min = ~~(seconds / 60)
    var sec = parseInt(seconds - min * 60)
    return min + ':' + ('00' + sec).substr(-2)
  },
  switchMode: function () {
    var mode = this.data.mode
    var newmode = ''
    if (mode === 'loop'){
      newmode = 'single'
    }else if(mode === 'single'){
      newmode = 'random'
    }else{
      newmode = 'loop'
    }
    this.setData({
      mode: newmode
    })
  },
  // 导航栏操作
  onNavbarTap: function (ev) {
    this.setData({ currentTab: ev.currentTarget.dataset.index });
    if (ev.currentTarget.dataset.index === 1){
      this.showCurList()
    }
  },
  showCurList: function(){
    try {
      var list = wx.getStorageSync("audioList")
      if (!(list == undefined || list == "" || list == null)) {
        this.setData({
          audioList: list,
        });
      }
    } catch (e) {
    }
  },
  slider1change: function(e){
    // console.log(e.detail.value)
    wx.seekBackgroundAudio({
      position: parseInt(e.detail.value / 100 * this.data.duration)//单位秒
    })
    this.setData({
      percent: e.detail.value
    })
  },
})

