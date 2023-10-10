module.exports = function (req, res, next) {
  if (req.url.endsWith(".pbf")) {
    res.setHeader("Content-Type", "application/x-protobuf");
    res.setHeader("Content-Encoding", "gzip");
  }
  next();
};
