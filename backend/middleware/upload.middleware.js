const multer = require('multer');

// Lưu file upload trên RAM để xử lý rồi ghi trực tiếp vào MongoDB.
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = { upload };
