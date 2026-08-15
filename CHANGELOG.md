# Change log

## Unreleased

### Fixed

- Prevented latitude, longitude, and speed encoders from leaking temporary
  values into global scope.
- Standardized hexadecimal datagram bytes on uppercase output.
- Fixed negative and multi-revolution magnetic course normalization in datagram
  `0x53` and corrected its display title.
- Aligned the implementation with the documented `stalkout` event while
  retaining the former `seatalkOut` event for compatibility.
- Added dependency-free regression tests using Node.js' built-in test runner.

### Documentation

- Documented the fork objective, upstream baseline, known safety and correctness
  issues, planned milestones, and engineering decisions.
- Added a staged test, vessel rollout, and rollback procedure.
- Clarified that the existing Node-RED GPS/wind bridge remains the production
  path until the fork passes validation.
