const fs = require('fs');
const fss = fs.promises;
const path = require('path');
const { Transform, pipeline } = require('stream');

const htmlSrc = path.join(__dirname, 'components');
const htmlTemplate = path.join(__dirname, 'template.html');
const htmlDest = path.join(__dirname, 'project-dist', 'index.html');

(async function htmlBuilder(ext) {
  let templateStr = '';
  let specSymbol = '';

  await fss.mkdir(path.join(__dirname, 'project-dist'), { recursive: true });
  const htmlReadStream = fs.createReadStream(htmlTemplate, {
    highWaterMark: 1,
    encoding: 'utf-8',
  });
  const htmlWriteStream = fs.createWriteStream(htmlDest);

  const htmlFiles = (await fss.readdir(htmlSrc, { withFileTypes: true }))
    .filter(
      (file) =>
        path.extname(path.join(htmlSrc, file.name)) === ext && file.isFile(),
    )
    .map((file) => file.name);

  const ts = new Transform({
    async transform(char, encoding, cb) {
      if (specSymbol === '' && char.toString() === '{') {
        specSymbol = '{';
        this.push('');
      } else if (specSymbol === '{' && char.toString() !== '{') {
        this.push(`{${char.toString()}`);
      } else if (specSymbol === '{' && char.toString() === '{') {
        specSymbol = '{{';
        this.push('');
      } else if (specSymbol === '{{' && char.toString() !== '}') {
        templateStr += char.toString();
        this.push('');
      } else if (specSymbol === '{{' && char.toString() === '}') {
        specSymbol = '}';
        this.push('');
      } else if (specSymbol === '}' && char.toString() === '}') {
        const chunk = await insertHtmlComponent(templateStr, htmlFiles, ext);
        this.push(chunk);
        specSymbol = '';
        templateStr = '';
      } else if (specSymbol === '}' && char.toString() !== '}') {
        await fss.unlink(htmlDest);
        throw new Error('Syntax error! Missed symbol "}" for template');
      } else {
        this.push(char);
      }

      cb();
    },
  });

  pipeline(htmlReadStream, ts, htmlWriteStream, (err) => {
    err && console.error(err);
  });
})('.html');

(async function bundlerCss(ext, src) {
  const ws = fs.createWriteStream(
    path.join(__dirname, 'project-dist', 'style.css'),
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

async function copyDir(src, dest) {
  const newFolderPath = path.join(__dirname, 'project-dist', dest);
  const dir = path.join(__dirname, src);

  await fss.mkdir(newFolderPath, { recursive: true });

  const filesAndFolders = await fss.readdir(dir, { withFileTypes: true });
  filesAndFolders.forEach(async (el) => {
    if (el.isFile())
      await fss.copyFile(
        path.join(dir, el.name),
        path.join(newFolderPath, el.name),
      );
    else await copyDir(path.join(src, el.name), path.join(dest, el.name));
  });
}

(async function copy(source, destination) {
  await fss.rm(path.join(__dirname, 'project-dist', destination), {
    recursive: true,
    force: true,
  });

  await copyDir(source, destination);
})('assets', 'assets');

async function insertHtmlComponent(str, htmlFiles, ext) {
  const htmlFile = htmlFiles.find((file) => file.replace(ext, '') === str);
  return await fss.readFile(path.join(htmlSrc, htmlFile), 'utf-8');
}
