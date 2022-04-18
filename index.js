const fs = require('fs');
const { pipeline } = require('stream');
const path = require('path');
const split = require('./split');
const toArray = require('./stream-to-array');
const pump = require('./pump');

const readFilePath = path.join(__dirname, 'file.txt');
const writeFilePath = path.join(__dirname, 'write.txt');
const readStream = fs.createReadStream(readFilePath);
const writeStream = fs.createWriteStream(writeFilePath);

// readStream.pipe(writeStream).on('error', (err) => {
//   console.log(err);
//   console.log('hi');
// });
/* pipe로 연결시 error을 못잡는다.
 그래서 pump는 각각 stream에 on('error')을 통해 에러를 잡는다. */

// pump(readStream, writeStream, function (err) {
//   console.log('callback', err);
//   // console.log('hi');
// });

// pipeline(readStream, writeStream, (err) => {
//   console.log(err);  // 내부적으로 pump 쓰고있음.. eos랑..
// });

// const EventEmitter = require('events');

// const emitter = new EventEmitter();

// emitter.on('greet', function () {
//   console.log('Node와의 첫 만남, 반갑습니다!');
// });

// console.log(emitter);
// console.log(emitter.emit('greet'));
// console.log('hi');
// console.log('bbb');

// Readable stream에 Writable stream pipe 시 writeable stream은 자동으로 닫지 않아 닫아줘야 메모리 누수가 발생하지 않음

// 메모리누수 테스트 디버깅

// function LeakingClass() {}

// var a = [{ a: Math.random() }];

// let leaks1 = [];
// let leaks2 = [];
// setInterval(function () {
//   for (var i = 0; i < 10000; i++) {
//     leaks1.push(new LeakingClass());
//     leaks2.push(...a);
//   }

//   console.log(process.memoryUsage().rss / 1024 / 1024 + 'MB');

//   //   console.error('Leaks: %d', leaks.length);
// }, 500);

// var leaks = [];
setInterval(function () {
  for (var i = 0; i < 10000; i++) {
    // leaks.push(new LeakingClass());
    readStream.pipe(writeStream);
  }

  console.log(process.memoryUsage().rss / 1024 / 1024 + 'MB');

  //   console.error('Leaks: %d', leaks.length);
}, 500);
