# Test and rollout procedure

## Safety principle

Testing proceeds from isolated and observable stages toward the live SeaTalk1
bus. A later stage starts only after the previous stage has produced the
expected output. The production Node-RED flow remains available for rollback.

## Stage 1 — Automated tests

Run the repository test and lint commands after they are introduced in M1.
Tests must cover normal values, boundary values, invalid values, unit
conversions, checksums, and throttling behavior.

Acceptance criteria:

- All tests pass on the same Node.js major version used by Signal K.
- No encoder produces output for invalid or incomplete input.
- Expected datagram bytes and checksums match fixed fixtures.

## Stage 2 — TCP/log-only observation

Enable only one datagram and do not configure serial output. Observe the plugin
debug log and Signal K's NMEA 0183 TCP output on port 10110.

Acceptance criteria:

- Only explicitly enabled datagrams appear.
- Checksums validate independently.
- Update frequency does not exceed the configured throttle.
- Values decode back to the original Signal K values within documented
  rounding tolerances.
- Stale or rejected values produce no `$STALK` output.

## Stage 3 — Recorded-data replay

Replay representative GPS and wind fixtures, including missing sources,
source changes, zero speed, north crossing, east/west and north/south
hemispheres, angle wraparound, and stale updates.

Acceptance criteria:

- No exceptions or global state leaks occur.
- Output remains deterministic.
- Source and age gates fail closed.

## Stage 4 — Converter bench test

Stop or disconnect the normal serial transmitter. Send one low-rate,
non-control datagram through the GadgetPool converter while independently
monitoring SeaTalk1 through the GPIO receiver.

Acceptance criteria:

- Exactly one expected SeaTalk1 datagram is observed per transmitted update.
- No echo loop, burst, or unrelated traffic is generated.
- Removing plugin input or stopping the plugin stops output promptly.

## Stage 5 — GPS rollout

Enable GPS datagrams one at a time with conservative throttles. Do not transmit
the equivalent Node-RED RMC output simultaneously.

Check position, SOG, course, UTC time, and date on every receiving instrument.
Record raw `$STALK` output and GPIO-observed bus traffic for comparison.

## Stage 6 — Wind rollout

Proceed only after wind encoders have reference-backed fixtures and bench-test
results. Disable the equivalent Node-RED MWV output before enabling plugin wind
transmission.

Check apparent angle direction, port/starboard convention, units, rounding,
update rate, calm conditions, and angle wraparound.

## Rollback

1. Disable plugin datagrams or stop the plugin.
2. Verify that `$STALK` transmission has stopped.
3. Restore the established Node-RED serial output.
4. Confirm GPS and wind reception and inspect the bus for residual duplicates.
5. Preserve logs and the exact plugin commit for diagnosis.

## Test record template

For every hardware test record:

- date and operator;
- plugin commit;
- Signal K and Node.js versions;
- converter hardware and firmware versions;
- enabled datagrams and throttle settings;
- input provider identifiers;
- expected and observed output;
- GPIO capture or relevant log excerpt;
- pass/fail result and anomalies;
- rollback result.
