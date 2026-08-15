/*
52  01  XX  XX  Speed over Ground: XXXX/10 Knots
*/
// SeaTalk1 Encoder 0x52

const stalk = require('../stalk.js')
module.exports = function (app) {
  return {
    datagram: '0x52',
    title: '0x52 - Speed over Ground',
    keys: ['navigation.speedOverGround'],
    f: function g0x52 (sog) {
      const sogKn = sog * 1.944
      const sog10 = Math.round(sogKn * 10)
      const xxxx = stalk.padd(sog10.toString(16).toUpperCase(), 4)
      return stalk.toDatagram([
        '52',
        '01',
        xxxx.substring(2, 4),
        xxxx.substring(0, 2)
      ])
    }
  }
}
