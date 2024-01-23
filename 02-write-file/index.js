const fs = require('fs');
const path = require('path');
const process = require('process');
const { stdin: consoleIn, stdout: consoleOut, exit } = process;

const writeStream = fs.createWriteStream(path.join(__dirname, 'logFile.txt'));
consoleOut.write('Please type the text in the console...\n');
process.on('exit', () =>
  consoleOut.write('\nThe process is complete, for now!\n'),
);
consoleIn.on('data', (chank) => {
  if (chank.toString().trim() === 'exit') {
    exit();
  }
});
process.on('SIGINT', exit);

consoleIn.pipe(writeStream);
