const fs = require('mz/fs');
const path = require('path');
const http = require('http');
const url = require('url');
const { Readable } = require('stream');
const colors = require('colors/safe');
const etag = require('etag');

const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// Setup frames in memory
let original;
let flipped;
let fileIndex = 0;

// (async () => {
//   const framesPath = 'frames';
//   const files = await fs.readdir(framesPath);

//   original = await Promise.all(
//     files.map(async (file) => {
//       const frame = await fs.readFile(path.join(framesPath, file));
//       return frame.toString();
//     })
//   );
//   flipped = original.map((f) => {
//     return f.toString().split('').reverse().join('');
//   });
// })().catch((err) => {
//   console.log('Error loading frames');
//   console.log(err);
// });

const colorsOptions = ['red', 'yellow', 'green', 'blue', 'magenta', 'cyan', 'white'];
const numColors = colorsOptions.length;
const selectColor = (previousColor) => {
  let color;

  do {
    color = Math.floor(Math.random() * numColors);
  } while (color === previousColor);

  return color;
};

const streamer = (stream, opts) => {
  let index = 0;
  let lastColor;
  let frame = null;
  const frames = opts.flip ? flipped : original;

  return setInterval(() => {
    // clear the screen
    // stream.push('\033[2J\033[3J\033[H');
    stream.push('hi');

    // const newColor = (lastColor = selectColor(lastColor));

    // stream.push(colors[colorsOptions[newColor]](frames[index]));

    // index = (index + 1) % frames.length;
  }, 70);
};

const validateQuery = ({ flip }) => ({
  flip: String(flip).toLowerCase() === 'true',
});

const server = http.createServer((req, res) => {
  // const fileName = 'test.mp4';

  // test.png/eTag(123)
  // const fileName = 'test|3-QL0AFWMIX8NRZTKeof9cXsvbvu8';

  // test.png/eTag(456)
  // const fileName2 = 'test|3-UerGtHGihNM0HYwMY9DxooYmKhg';

  // const fileName = ['test|3-QL0AFWMIX8NRZTKeof9cXsvbvu8', 'test|3-UerGtHGihNM0HYwMY9DxooYmKhg'];

  const fileName = 'test.mp4';

  // if (req.url === '/healthcheck') {
  //   res.writeHead(200, { 'Content-Type': 'application/json' });
  //   return res.end(JSON.stringify({ status: 'ok' }));
  // }

  // if (req.headers && req.headers['user-agent'] && !req.headers['user-agent'].includes('curl')) {
  //   res.writeHead(302, { Location: 'https://github.com/hugomd/parrot.live' });
  //   return res.end();
  // }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');

  // res.end('hi');

  // const stream = new Readable();
  // stream._read = function noop() {};

  // res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

  // const prevETag = req.headers['if-none-match'];

  // if (prevETag) {
  //   console.log('prevETag', prevETag);
  //   const currentETag = '3-UerGtHGihNM0HYwMY9DxooYmKhg';
  //   if (prevETag === currentETag) {
  //     res.writeHead(304, { 'Content-Type': 'image/png' });
  //     res.end();
  //     return;
  //   }
  // }

  // res.setHeader('Content-Type', 'audio/ogg');
  res.setHeader('Content-Type', 'video/mp4');

  // res.setHeader('Cache-Control', 'must-revalidate,max-age=10');
  // res.setHeader('Cache-Control', 'max-age=10');
  // res.setHeader('Cache-Control', 'max-age=3600');
  // res.setHeader('Cache-Control', 'max-age=10,must-revalidate');
  // res.setHeader('Cache-Control', 'max-age=10,stale-while-revalidate=60');

  // res.setHeader('ETag', etag('123'));
  // res.setHeader('Last-modified', new Date().toUTCString());

  // console.log(prevETag);

  // console.log('fileIndex', fileIndex);

  const stream = fs.createReadStream(path.join(__dirname, `/frames/${fileName}`), {
    highWaterMark: 128 * 512,
    // highWaterMark: 128,
  });

  stream.on('data', (chunk) => {
    // console.log(chunk);
    // console.log(chunk.length);
    // console.log(chunk);
    // stream.unpipe();
    // console.log('chunk');
  });

  stream.on('close', (chunk) => {
    // ++fileIndex;
    console.log('close');
  });

  stream.on('finish', (chunk) => {
    console.log('finish');

    // console.log('finish');
  });

  stream.on('error', (error) => {
    console.log('error', error);
  });

  stream.pipe(res);

  // setTimeout(() => {
  //   stream.pause();
  // }, 300);

  // setTimeout(() => {
  //   stream.resume();
  // }, 5000);
  // const interval = streamer(stream, validateQuery(url.parse(req.url, true).query));

  setTimeout(() => {
    // stream.destroy();
    // interval && clearInterval(interval);
    // res.end();
  }, 5000);

  req.on('close', () => {
    stream.destroy();
    // interval && clearInterval(interval);
  });
});

const port = process.env.PARROT_PORT || 5000;
server.listen(port, (err) => {
  if (err) throw err;
  console.log(`Listening on localhost:${port}`);
});
