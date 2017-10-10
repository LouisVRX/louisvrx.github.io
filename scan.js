


//function recordNearbyBeacon(major, minor, pathLossVs1m) { ... }
navigator.bluetooth.requestLEScan({
  filters: [
//  {manufacturerData: {0x004C: {dataPrefix: new Uint8Array([
//    0x02, 0x15, // iBeacon identifier.
//    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15  // My beacon UUID.
//  ])}}}],
  options: {
    keepRepeatedDevices: true,
    acceptAlladvertisements: true
  }
}).then(() => {
  navigator.bluetooth.addEventListener('advertisementreceived', event => {
    console.log(event);
  });
})