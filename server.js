
const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();

const storage = multer.diskStorage({
  destination: './upload/',
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.use(express.static(__dirname));

app.post('/upload', upload.single('myFile'), (req, res) => {
  if (!req.file) {
    return res.send('No file selected');
  }

  res.send('File uploaded successfully');
});

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});

