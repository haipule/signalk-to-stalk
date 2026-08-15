/*
51  Z2  XX  YY  YY  LON position: XX degrees, (YYYY & 0x7FFF)/100 minutes
                                  MSB of Y = YYYY & 0x8000 = East if set, West if cleared
                                  Z= 0xA or 0x0 (reported for Raystar 120 GPS), meaning unknown
                                  Stable filtered position, for raw data use command 58
                                  Corresponding NMEA sentences: RMC, GAA, GLL
*/
// SeaTalk1 Encoder 0x51

const stalk = require('../stalk.js')
module.exports = function (app) {
  return {
    datagram: '0x51',
    title: '0x51 - LON position',
    keys: ['navigation.position'],
    f: function g0x51 (position) {
      const longitude = Math.abs(position.longitude)
      const degrees = Math.floor(longitude)
      const minutes100 = Math.round(100 * (longitude - degrees) * 60)
      const xx = stalk.toHexString(degrees)
      let yyyy = minutes100 & 0x7FFF
      if (position.longitude > 0) yyyy |= 0x8000
      const encodedMinutes = stalk.padd(yyyy.toString(16).toUpperCase(), 4)
      return stalk.toDatagram([
        '51',
        'A2',
        xx,
        encodedMinutes.substring(2, 4),
        encodedMinutes.substring(0, 2)
      ])
    }
  }
}
