// 二进制成功响应保持文件流；发送前的异常交给统一 errorHandler。
module.exports = (stream, res) => new Promise((resolve, reject) => {
  const cleanup = () => {
    stream.off('error', fail);
    res.off('finish', finish);
    res.off('close', close);
  };
  const fail = error => { cleanup(); stream.unpipe(res); stream.destroy(); reject(error); };
  const finish = () => { cleanup(); resolve(); };
  const close = () => { cleanup(); stream.destroy(); resolve(); };
  stream.once('error', fail);
  res.once('finish', finish);
  res.once('close', close);
  stream.pipe(res);
});
