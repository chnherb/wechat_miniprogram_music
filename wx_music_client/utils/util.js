function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function playAudio(musicurl, name, imgurl) {
  wx.playBackgroundAudio({
    dataUrl: musicurl,
    title: name,
    coverImgUrl: imgurl,
    success: function (res) {
      // success
      console.log("ok")
    },
    fail: function (res) {
      // fail
      console.log("fail")
    },
    complete: function (res) {
      // complete
      console.log("ok")
    }
  })
}

module.exports = {
  formatTime: formatTime,
  playAudio: playAudio
}


