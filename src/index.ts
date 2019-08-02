import * as express from 'express';
import { Scheduler } from './scheduler';
import validProxyCache from './cache/valid-proxy';
import extractProxyCache from './cache/extract-proxy';

const app = express();
const s = new Scheduler();

app.get('/start', function(_, res) {
  s.start();
  res.send('ok!');
});

app.get('/stop', function(_, res) {
  s.stop();
  res.send('ok!');
});

app.get('/proxys', function(_, res) {
  const keys: string[] = validProxyCache.keys();
  if (keys && keys.length) {
    res.send(keys.join(','));
  } else {
    res.send('nothing!');
  }
});

app.get('/extract', function(_, res) {
  const keys: string[] = extractProxyCache.keys();
  if (keys && keys.length) {
    res.send(keys.join(','));
  } else {
    res.send('nothing!');
  }
});

app.listen(3009, '0.0.0.0');
