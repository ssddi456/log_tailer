import * as fs from 'fs-extra';
import * as path from 'path';

const root = path.join(__dirname, '..');
const outputDir = path.join(root, 'output');

fs.ensureDirSync(outputDir);

[
    'package.json',
    'views',
    'public',
    'lib',
    'data',
    'bin',
].forEach(file => {
    fs.copySync(path.join(root, file), path.join(outputDir, file))
});