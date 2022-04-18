const crypto = require('crypto');
const express = require('express');
const http = require('http');
const morgan = require('morgan');
const path = require('path');
const { URL } = require('url');

const app = express();
const logger = morgan('combined');

const BASE_URL = 'http://localhost:3000';
const SIGNATURE_SECRET = 'super-secret-password';

const FAKE_VIDEO_MODELS = [
  //   { id: 1, filename: 'tt.mp4' },
  { id: 1, filename: 'tt.webm' },
];

const apiRouter = express.Router();
apiRouter.post('/videos/:id', (req, res) => {
  const id = Number(req.params.id);
  const model = FAKE_VIDEO_MODELS.find((model) => model.id === id);

  if (!model) {
    return res.status(404).send({
      error: {
        code: 'NOT_FOUND',
        message: 'The requested video does not exist',
      },
    });
  }

  const ONE_HOUR = 3600 * 1000;

  const expiresAt = Date.now() + ONE_HOUR;

  const url = createSignedUrl(`/videos/${model.filename}`, expiresAt);
  res.status(200).send({
    data: { url },
  });
});

const videoRouter = express.Router();
const videoStaticRouter = express.static(path.join(__dirname, 'videos'));
videoRouter.use(authenticate, videoStaticRouter);

app.use(logger);
app.use('/api', apiRouter);
app.use('/videos', videoRouter);

const server = http.createServer(app);
server.listen(3000, () => {
  const { address, port } = server.address();
  console.log('server listening in %s:%s', address, port);
});

function authenticate(req, res, next) {
  const { token } = req.query;
  if (!token) {
    return res.sendStatus(401);
  }

  const pathname = req.baseUrl + req.path;
  if (!verify(pathname, token)) {
    return res.sendStatus(401);
  }

  next();
}

function createSignedUrl(pathname, expiresAt) {
  const pathHash = hashPath(pathname);
  const token = [pathHash, expiresAt, sign(pathHash, expiresAt)].join('.');

  // token에 pathHash, 만료기간, pathHash와 만료기간을 서명한값을 .으로 합침
  // 그래서 token 요청했을때   pathHash와 만료기간으로 똑같이 hmac을 만들어 맨마지막값과 동일한지 체크

  const signedUrl = new URL(BASE_URL);
  signedUrl.pathname = pathname;
  signedUrl.searchParams.set('token', token);
  return signedUrl.toString();
}

function hashPath(pathname) {
  return crypto.createHash('sha256').update(pathname).digest('hex');
}

function sign(pathHash, expiresAt) {
  return crypto
    .createHmac('sha256', SIGNATURE_SECRET)
    .update([pathHash, expiresAt].join(':'))
    .digest('hex');
}

function verify(pathname, token) {
  const components = token.split('.');

  if (components.length !== 3) {
    return false;
  }

  const [pathHash, expiresAt, actualSignature] = components;
  const expectedSignature = sign(hashPath(pathname), expiresAt);

  if (
    !crypto.timingSafeEqual(
      Buffer.from(actualSignature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
  ) {
    return false;
  }

  if (Number(expiresAt) < Date.now()) {
    return false;
  }

  return true;
}
