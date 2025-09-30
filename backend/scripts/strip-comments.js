const fs = require('fs');
const path = require('path');
const strip = require('strip-comments');

function* walk(dir) {
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of list) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) yield* walk(p);
    else yield p;
  }
}

const roots = [path.join(__dirname, '..', 'src'), path.join(__dirname, '..', 'test')];
let count = 0;
for (const root of roots) {
  if (!fs.existsSync(root)) continue;
  for (const file of walk(root)) {
    if (!file.endsWith('.ts')) continue;
    const src = fs.readFileSync(file, 'utf8');
    const stripped = strip(src);
    if (src !== stripped) {
      fs.writeFileSync(file, stripped, 'utf8');
      count++;
    }
  }
}
console.log(`Stripped comments from ${count} files`);

