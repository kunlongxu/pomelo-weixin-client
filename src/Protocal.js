const { copyArray } = require('./util')

module.exports = class Protocol {
  /**
   * pomele client encode
   * id message id;
   * route message route
   * msg message body
   * socketio current support string
   */
  static strencode(str) {
    var buffer = new Uint8Array(str.length * 3)
    var offset = 0
    for (var i = 0; i < str.length; i++) {
      var charCode = str.charCodeAt(i)
      var codes = null
      if (charCode <= 0x7f) {
        codes = [charCode]
      } else if (charCode <= 0x7ff) {
        codes = [0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f)]
      } else {
        codes = [
          0xe0 | (charCode >> 12),
          0x80 | ((charCode & 0xfc0) >> 6),
          0x80 | (charCode & 0x3f)
        ]
      }
      for (var j = 0; j < codes.length; j++) {
        buffer[offset] = codes[j]
        ++offset
      }
    }
    var _buffer = new Uint8Array(offset)
    copyArray(_buffer, 0, buffer, 0, offset)
    return _buffer
  }

  /**
   * client decode
   * msg String data
   * return Message Object
   */
  static strdecode(buffer) {
    var bytes = new Uint8Array(buffer)
    var output = ''
    var offset = 0
    var charCode = 0
    var end = bytes.length
    while (offset < end) {
      if (bytes[offset] < 128) {
        // 0x80
        charCode = bytes[offset]
        offset += 1
      } else if (bytes[offset] < 224) {
        // 0xe0
        if (bytes[offset + 1] < 0) {
          throw new Error('非法数据')
        }
        charCode = ((bytes[offset] & 0x1f) << 6) + (bytes[offset + 1] & 0x3f)
        offset += 2
      } else {
        if (bytes[offset + 2] < 0) {
          throw new Error('非法数据')
        }
        if (bytes[offset] < 240) {
          // 0xf0
          charCode =
            ((bytes[offset] & 0x0f) << 12) +
            ((bytes[offset + 1] & 0x3f) << 6) +
            (bytes[offset + 2] & 0x3f)
          offset += 3
        } else {
          charCode =
            ((bytes[offset] & 0x07) << 18) +
            ((bytes[offset + 1] & 0x3f) << 12) +
            ((bytes[offset + 2] & 0x3f) << 6) +
            (bytes[offset + 3] & 0x3f)
          offset += 4
        }
      }
      if (charCode > 0xffff) {
        charCode -= 0x10000
        output += String.fromCharCode(0xd800 + (charCode >> 10)) // 高位

        charCode = 0xdc00 + (charCode & 0x3ff) // 低位
      }
      output += String.fromCharCode(charCode)
    }
    return output
  }
}
