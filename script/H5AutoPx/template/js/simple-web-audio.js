try {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  window.audioContext = new window.AudioContext();
} catch (e) {
  console.log("No Web Audio API support");
}

var SimpleWebAudioManager = function (context) {
  this.context = context;
  this.bufferList = {};
};

SimpleWebAudioManager.prototype = {
  addSound: function (url) {
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";
    var self = this;
    request.onload = function () {
      self.context.decodeAudioData(
        request.response,
        function (buffer) {
          if (!buffer) {
            alert('error decoding file data: ' + url);
            return;
          }
          self.bufferList[url] = buffer;
        });
    };
    request.onerror = function () {
      alert('BufferLoader: XHR error');
    };
    request.send();
  }
};

var SimpleWebAudio = function (url, options) {
  this.settings = {
    loop: false
  };
  for (var i in options) {
    if (options.hasOwnProperty(i))
      this.settings[i] = options[i];
  }
  this.url = url;
  window.simpleWebAudioManager = window.simpleWebAudioManager || new SimpleWebAudioManager(window.audioContext);
  this.manager = window.simpleWebAudioManager;
  this.manager.addSound(this.url);
  //change state with user interaction
  var self = this;
  document.addEventListener("touchstart", function () {
    self.manager.context.resume();
  }, true);
};

SimpleWebAudio.prototype = {
  source: false,
  play: function () {
    var self = this;
    var buffer = self.manager.bufferList[self.url];
    if (typeof buffer !== "undefined") {
      self.source = self.makeSource(buffer);
      self.source.loop = self.settings.loop;
      if (self.source.noteOn) {
        self.source.noteOn(0);
      } else {
        self.source.start(0);
      }
    } else {
      var loadPlay = setTimeout(function () {
        self.play();
      }, 50);
    }
  },
  stop: function () {
    if (this.source) {
      if (this.source.noteOff) {
        this.source.noteOff(0);
      } else {
        this.source.stop(0);
      }
    }
  },
  makeSource: function (buffer) {
    var source = this.manager.context.createBufferSource();
    var des = this.manager.context.destination;
    source.buffer = buffer;
    source.connect(des);
    return source;
  }
};