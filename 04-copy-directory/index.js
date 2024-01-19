const fs = require('node:fs/promises');
const path = require('node:path');

async function copyDir(src, dest) {
  const newFolderPath = path.join(__dirname, dest);
  const dir = path.join(__dirname, src);

  await fs.mkdir(newFolderPath, { recursive: true });

  const filesAndFolders = await fs.readdir(dir, { withFileTypes: true });
  filesAndFolders.forEach(async (el) => {
    if (el.isFile())
      await fs.copyFile(
        path.join(dir, el.name),
        path.join(newFolderPath, el.name),
      );
    else await copyDir(path.join(src, el.name), path.join(dest, el.name));
  });
}

(async function copy(source, destination) {
  await fs.rm(path.join(__dirname, destination), {
    recursive: true,
    force: true,
  });

  await copyDir(source, destination);
})('files', 'files-copy');
