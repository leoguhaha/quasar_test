const Stream = require('node-rtsp-stream');

stream1 = new Stream({
  name: 'rtsp_stream_1',
  streamUrl: 'rtsp://admin:Asb11023@10.20.0.122:554/Streaming/Channels/10',
  wsPort: 9999,
  ffmpegOptions: {
    '-stats': '',
    '-r': 30
  }
});

// stream2 = new Stream({
//   name: 'rtsp_stream_2',
//   streamUrl: 'rtsp://admin:Asb11023@10.20.0.122:554/Streaming/Channels/102',
//   wsPort: 9998,
//   ffmpegOptions: {
//     '-stats': '',
//     '-r': 30
//   }
// });
