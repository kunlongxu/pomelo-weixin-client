const Pomelo = require('./lib/Pomelo');

module.exports = new Pomelo({
  wsCreator({
    url,
    onError,
    onOpen,
    onMessage,
    onClose
  }) {
    const ws = wx.connectSocket({
      url: url
    });
    ws.onError(onError);
    ws.onOpen(onOpen);
    ws.onMessage(onMessage);
    ws.onClose(onClose);
    return ws;
  },
  urlGenerator(host, port) {
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'ws://' + host + ':' + port
    } else {
      let url = 'wss://' + host;
      if (port) {
        url += '/ws/' + port + '/';
      }
      return url;
    }
  }
});