module.exports = function handleUpload(uploadMiddleware) {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (!err) return next();
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ success: false, message: 'File is too large. Maximum allowed size is 10 MB.' });
      }
      return res.status(400).json({ success: false, message: err.message || 'Upload failed.' });
    });
  };
};