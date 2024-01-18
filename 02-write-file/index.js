const fs = require('node:fs');
const path = require('node:path');
const { stdin: consoleIn, stdout: consoleOut } = require('node:process');

const writeStream = fs.createWriteStream(path.join(__dirname, 'logFile.txt'));
consoleOut.write('Please type the text in the console...\n');

consoleIn.on('data', (chank) => {
  if (chank.toString() === 'exit\n') {
    exitFun();
  }
});
process.on('SIGINT', exitFun);

function exitFun() {
  consoleOut.write('\nThe process is complete, for now!\n');
  process.exit();
}

consoleIn.pipe(writeStream);
