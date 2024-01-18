const fs = require('node:fs/promises');
const path = require('node:path');

(async function () {
  try {
    const dir = path.join(__dirname, 'secret-folder');
    const files = (await fs.readdir(dir, { withFileTypes: true })).filter(
      (el) => el.isFile(),
    );

    files.forEach(async (file) => {
      const currentFilePath = path.join(dir, file.name);

      const size = ((await fs.stat(currentFilePath)).size / 1024).toFixed(3);
      const ext = path.extname(currentFilePath);
      const name = path.basename(currentFilePath, ext);

      console.log(`${name} - ${ext.slice(1)} - ${size}kB`);
    });
  } catch ({ message }) {
    console.log(message);
  }
})();
