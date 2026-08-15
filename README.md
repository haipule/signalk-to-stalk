# signalk-to-stalk

Signal K server plugin for converting Signal K navigation data to `$STALK`
(SeaTalk1 datagrams transported as NMEA 0183 text).

> [!WARNING]
> This fork is under active development. Keep the existing Node-RED GPS/wind
> bridge in production until the output has passed the staged tests described
> in [docs/TESTING.md](docs/TESTING.md). Do not connect experimental output to
> a live SeaTalk1 bus without monitoring it independently.

## Fork status

The upstream implementation currently supports GPS position, speed over ground,
course, UTC time, and date. Apparent-wind output, source selection, stale-data
handling, and bus-aware transmission protection are planned but not yet
implemented. See [docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md) for scope,
decisions, known issues, and progress.

## Upstream usage

To use the plugin you need to activate the plugin and the relevant datagrams in server's Admin interface. This will make the conversion results (STALK) available on Signalk's built-in TCP NMEA 0183 server (Port 10110).

As the plugin automatically sends STALK data to Signalk's built-in TCP NMEA 0183 server, it is possible to have access to the NMEA 0183 strings without configuring anything (Aka a serial output device) by connecting to port 10110 with a TCP client.

If you want to output the conversion result into a serial connection (i.e. Digital Yacht's ST2USB or ST2NMEA0183 interfaces) you need to configure the serial connection in the server's Admin interface and add an extra line to the `settings.json`, specifying that the serial connection should output the plugin's output:


```
{
  "pipedProviders": [
    {
      "pipeElements": [
        {
          "type": "providers/simple",
          "options": {
            "logging": false,
            "type": "NMEA0183",
            "subOptions": {
              "validateChecksum": true,
              "type": "serial",
              "suppress0183event": true,
              "sentenceEvent": "stalkdata",
              "providerId": "a",
              "device": "/dev/ttyExample",
              "baudrate": 4800,
              "toStdout": "stalkout"          <------------ ADD THIS LINE
            },
            "providerId": "a"
          }
        }
      ],
      "id": "st2usb",
      "enabled": true
    }
  ],
  "interfaces": {}
}
```

Internally the plugin emits converted messages under the canonical `stalkout`
event identifier. For compatibility with the upstream implementation it also
emits `seatalkOut`; new serial-output configurations should use `stalkout`.

This Signal K server plugin was developed from
[`signalk-to-nmea0183`](https://github.com/SignalK/signalk-to-nmea0183) and
[`signalk-autopilot`](https://github.com/SignalK/signalk-autopilot).

## Development documentation

- [Project plan and engineering decisions](docs/PROJECT_PLAN.md)
- [Staged test and rollout procedure](docs/TESTING.md)
- [Change log](CHANGELOG.md)
