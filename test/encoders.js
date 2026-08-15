const assert = require('assert')
const { describe, it } = require('node:test')

const latitude = require('../datagrams/0x50')({}).f
const longitude = require('../datagrams/0x51')({}).f
const speedOverGround = require('../datagrams/0x52')({}).f
const magneticCourse = require('../datagrams/0x53')({}).f

describe('existing SeaTalk1 encoders', function () {
  it('encodes latitude without leaking globals', function () {
    delete global.XX
    delete global.YYYY

    assert.strictEqual(latitude({ latitude: 12.5 }), '$STALK,50,A2,0C,B8,0B*60')
    assert.strictEqual(global.XX, undefined)
    assert.strictEqual(global.YYYY, undefined)
  })

  it('encodes longitude without leaking globals', function () {
    delete global.XX
    delete global.YYYY

    assert.strictEqual(longitude({ longitude: -61.75 }), '$STALK,51,A2,3D,94,11*60')
    assert.strictEqual(global.XX, undefined)
    assert.strictEqual(global.YYYY, undefined)
  })

  it('encodes speed without leaking globals', function () {
    delete global.XXXX

    assert.strictEqual(speedOverGround(5), '$STALK,52,01,61,00*40')
    assert.strictEqual(global.XXXX, undefined)
  })

  it('normalizes negative magnetic courses', function () {
    const oneDegree = Math.PI / 180
    assert.doesNotThrow(() => magneticCourse(0, oneDegree))
    assert.strictEqual(
      magneticCourse(0, oneDegree),
      magneticCourse(359 * oneDegree, 0)
    )
  })

  it('normalizes courses beyond one revolution', function () {
    const oneDegree = Math.PI / 180
    assert.strictEqual(
      magneticCourse(721 * oneDegree, 0),
      magneticCourse(oneDegree, 0)
    )
  })
})
