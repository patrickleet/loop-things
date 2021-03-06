const copyFile = require('./lib/copyFile');
const debug = require('debug')('loop');
const expandCommand = require('./lib/expandCommand');
const fs = require('fs');
const listDirectories = require('./lib/listDirectories');
const path = require('path');
const run = require('./lib/run');
const util = require('util');

const LOOPRC = '.looprc';

var argv = require('yargs')
    .default('cwd', process.cwd())
    .argv;

const cwd = argv.cwd;
const command = argv._;

if (argv.init) {
  copyFile(path.resolve(__dirname, 'support', LOOPRC), path.resolve(cwd, LOOPRC));
  console.log(`created ${LOOPRC} at ${cwd}`)
  return;
}

var looprc = null; 
var buffer = null;

const looprcLocation = path.join(cwd, '.looprc');

try {
  buffer = fs.readFileSync(looprcLocation);
  debug(`.looprc file found at ${looprcLocation}`);
} catch (e) {
  debug(`no .looprc file found at ${looprcLocation}`);
}

if (buffer) {
  try {
    looprc = JSON.parse(buffer.toString());
    debug(`.looprc file contents parsed: ${util.inspect(looprc, null, Infinity)}`);
  } catch (e) {
    debug(`error parsing .looprc JSON: ${e}`);
  }
}

const dirs = listDirectories(looprc, cwd);
const commands = expandCommand(dirs, command);

run(commands, (err, results) => {
  console.log(results.reduce((prev, cur) => {
    return `${prev}\n${cur}`; 
  }));
});