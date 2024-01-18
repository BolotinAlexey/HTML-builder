const fs = require('node:fs');
const path = require('node:path');
const process = require('node:process');
const { stdin: consoleIn, stdout: consoleOut, exit } = process;

const writeStream = fs.createWriteStream(path.join(__dirname, 'logFile.txt'));
consoleOut.write('Please type the text in the console...\n');
process.on('exit', () =>
  consoleOut.write('\nThe process is complete, for now!\n'),
);
consoleIn.on('data', (chank) => {
  if (chank.toString() === 'exit\n') {
    exit();
  }
});
process.on('SIGINT', exit);

consoleIn.pipe(writeStream);
