#!/usr/bin/env node

const fs = require('fs');
const util = require('util');
const $path = require('path');
const readline = require('readline');

const Issuer = require('./lib/Issuer');
const { CWD } = require('./lib/constants');
const { highlight } = require('./lib/utils');
const { loadConfig } = require('./lib/config');

// utils
const readdir = util.promisify(fs.readdir);

function searchForTodo (path) {
    return new Promise((resolve, reject) => {
        const todos = [];

        const stream = fs.createReadStream(path, { encoding: 'utf8' });
        const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

        // listen for errors
        stream.on('error', reject);

        // read line by line
        rl.on('line', (line) => {
            const regex = /(TODO):?\s(.*)$/g;
            const match = regex.exec(line);

            if (match) {
                todos.push({
                    path,
                    labels: [],
                    type: match[1],
                    title: match[2],
                    existingIssues: [],
                });
            }
        });

        // pass todos
        rl.on('close', () => resolve(todos));
    });
}

async function filterFiles (path = '.', config = {}) {
    const files = [];
    const subdirs = await readdir($path.resolve(CWD, path));
    const { allowedExtensions, ignoreFiles, ignoreFolders } = config;

    for (const subdir of subdirs) {
        const filePath = $path.resolve(path, subdir);
        const extName = $path.extname(filePath);

        if (ignoreFolders.indexOf(subdir) > -1) {
            continue;
        }

        if (allowedExtensions.indexOf(extName) > -1) {
            files.push(filePath);
        }

        if (fs.lstatSync(filePath).isDirectory()) {
            const filesInInnerFolder = await filterFiles(filePath, config);

            files.push(...filesInInnerFolder);
        }
    }

    return files;
}

async function init (config) {
    const startTime = new Date();

    const todos = [];
    const files = await filterFiles(undefined, config);

    for (const file of files) {
        const fileTodos = await searchForTodo(file);

        todos.push(...fileTodos);
    }

    const issuer = new Issuer({ config, todos });

    await issuer.createIssues();

    return {
        totalFiles: files.length,
        totalTodos: todos.length,
        elpasedTime: new Date() - startTime,
    };
}

(async function () {
    try {
        const config = loadConfig();

        console.log(highlight.title('\nSearching for TODOs...\n'));

        const {
            totalFiles,
            totalTodos,
            elpasedTime,
        } = await init(config);

        console.log(highlight.success(`Found ${totalTodos} todos.`));
        console.log(highlight.success(`Scanned ${totalFiles} files within ${elpasedTime / 1000}s.\n`));
    } catch (exception) {
        console.log(exception);
        console.log(highlight.title(exception));
    }
}());
