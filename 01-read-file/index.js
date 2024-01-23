const fs = require('fs');
const path = require('path');

const txtFilePath = path.join(__dirname, 'text.txt');
const stream = fs.createReadStream(txtFilePath, 'utf-8');

stream.on('data', console.log);

stream.on('error', function (err) {
  console.log(err.stack);
});
