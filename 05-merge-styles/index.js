const fs = require('node:fs');
const path = require('node:path');

(async function bundler(ext, src) {
  const ws = fs.createWriteStream(
    path.join(__dirname, 'project-dist', 'bundle.css'),
  );

  const srcPath = path.join(__dirname, src);

  const files = (
    await fs.promises.readdir(srcPath, { withFileTypes: true })
  ).filter((file) => path.extname(path.join(srcPath, file.name)) === `.${ext}`);
  files.forEach((file) => {
    const rs = fs.createReadStream(path.join(srcPath, file.name), 'utf-8');
    rs.pipe(ws);
  });
})('css', 'styles');
