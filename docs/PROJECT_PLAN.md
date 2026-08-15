# GPS and wind hardening plan

## Objective

Extend `signalk-to-stalk` into a well-tested Signal K to SeaTalk1 output plugin
that can eventually replace the existing Node-RED GPS and apparent-wind bridge.
Replacement is not part of the initial rollout: the production flow remains the
fallback until the complete test procedure has passed on the target vessel.

## Baseline

The upstream revision used as the baseline is `845c3c6` from 2022-08-08. It
contains these encoders:

| Datagram | Signal K input | Purpose |
| --- | --- | --- |
| `0x50` | `navigation.position` | Latitude |
| `0x51` | `navigation.position` | Longitude |
| `0x52` | `navigation.speedOverGround` | Speed over ground |
| `0x53` | `navigation.courseOverGroundTrue`, `navigation.magneticVariation` | Magnetic course |
| `0x54` | `navigation.datetime` | UTC time |
| `0x56` | `navigation.datetime` | Date |

Output is emitted as checksummed `$STALK` text. Each enabled datagram has a
configurable throttle interval.

## Existing production behavior to preserve

The current Node-RED bridge accepts only a valid classic `$GPRMC` and a valid
relative `$IIMWV` sentence, verifies checksums, limits both types to about 1 Hz,
checks that the serial port is open, and requires recently observed SeaTalk1
traffic from an independent GPIO receiver.

The fork must not be considered a replacement until equivalent safeguards have
either been implemented in the plugin or deliberately assigned to a documented
external component.

## Known baseline issues

1. No apparent-wind angle or speed datagrams are implemented.
2. The course encoder references an undefined variable (`ncd`) in one negative
   angle branch.
3. Several encoder variables are assigned without declarations and therefore
   leak into global scope in non-strict JavaScript.
4. The README documents `stalkout`, while the implementation emits
   `seatalkOut`; the serial-output contract is therefore ambiguous.
5. Encoders do not explicitly reject `null`, non-finite, malformed, or stale
   values.
6. Streams use the selected `self` value but provide no plugin-level source
   allowlist. A change in Signal K source priority may therefore change the
   transmitted source.
7. Throttling limits frequency but is not a stale-data watchdog or bus-capacity
   scheduler.
8. There are no automated encoder or integration tests in the baseline.

## Planned milestones

### M1 — Safety baseline

- Add unit tests for checksum generation and all existing encoders.
- Fix the course encoder and global-variable leaks.
- Define and document one canonical output event.
- Validate input types, ranges, and missing values.
- Add CI-compatible lint and test commands.

### M2 — Apparent wind

- Confirm the exact SeaTalk1 wind-angle and wind-speed datagram encodings
  against at least two independent technical references or captured known-good
  traffic.
- Encode Signal K apparent wind angle and speed with explicit SI conversions.
- Cover boundary values and rounding behavior with fixture-based tests.

### M3 — Source and freshness controls

- Add configurable source/provider selection where supported by the Signal K
  server API.
- Add maximum-age handling and fail-closed behavior.
- Expose useful status and rejection diagnostics without flooding the log.

### M4 — Output and loop protection

- Verify serial-event integration against the target Signal K version.
- Define conservative per-datagram defaults for a 4800-baud path.
- Document loop prevention for SeaTalk1 input returning to Signal K.
- Determine whether external GPIO bus activity can be consumed reliably; keep
  this gate external if coupling it into the plugin would be fragile.

### M5 — Vessel validation

- Run TCP/log-only tests.
- Replay fixtures without hardware.
- Test one harmless datagram through the converter.
- Monitor the live bus independently.
- Enable GPS datagrams gradually, followed by wind.
- Run both solutions only when duplicate transmission is explicitly prevented.

## Engineering rules

- Every behavior change requires tests and a changelog entry.
- Datagram references and unit conversions are recorded next to their tests.
- Safety defaults fail closed when input validity or freshness is unknown.
- Generated output is inspected off-bus before hardware transmission.
- The production Node-RED flow is not modified as part of this repository.

## Decision log

| Date | Decision | Reason |
| --- | --- | --- |
| 2026-08-15 | Develop in a dedicated GitHub fork. | Keeps upstream history and plugin changes isolated from the local `Flows` archive. |
| 2026-08-15 | Leave the Node-RED flow in production. | The baseline plugin has no wind support or equivalent safety gates. |
| 2026-08-15 | Document and test before live-bus changes. | SeaTalk1 is a shared low-bandwidth bus; malformed or duplicate traffic can affect other instruments. |

## Open questions

- Which Signal K provider identifiers represent the external GPS and wind
  sources on the target system?
- Which Signal K server version and Node.js version run on the target device?
- Which event name and serial-provider configuration are supported there?
- Does converter firmware 1.60 accept all required `$STALK` datagrams for
  transmission, including the wind datagrams?
- Which GPIO-derived path or event, if any, can provide a reliable bus-alive
  signal to the plugin?
