const https = require('https');
const childProcess = require('child_process');

function spawnSync () {
    const spawn = childProcess.spawnSync(...arguments);

    if (spawn.status !== 0) {
        return false;
    }

    return spawn.stdout.toString().trim();
}

function parseGitRemote () {
    let repositoryUrl = null;
    let origin = spawnSync('git', ['config', '--get', 'remote.origin.url']);

    if (!origin) {
        return {
            provider: null,
            repo: null,
            url: null,
            user: null,
        };
    }

    ([ origin ] = origin.split('.git'));
    repositoryUrl = origin;

    if (origin.indexOf('git@') > -1) {
        repositoryUrl = origin.replace(':', '/').replace('git@', 'https://');
    }

    const splitOnColon = origin.split(/\.\w+[\/|:]/gi);
    const checkProvider = (/(https?:\/\/|git@)(\w+)/gi).exec(origin);

    const provider = checkProvider[2];
    const user = splitOnColon[1].split('/')[0];
    const repo = splitOnColon[1].split('/')[1];
    const [ gitUrl ] = repositoryUrl.split(`/${user}`);

    return { gitUrl, repositoryUrl, provider, user, repo };
}

function request (url, options, body) {
    return new Promise((resolve, reject) => {
        let data = '';

        const req = https.request(url, options, (response) => {
            response
                .on('data', (chunk) => data += chunk)
                .on('end', () => {
                    const contentType = response.headers['content-type'];

                    if (!~contentType.indexOf('json')) {
                        return reject('Invalid content type.');
                    }

                    if (data.length === 0) {
                        return reject('No data.');
                    }

                    try {
                        const parsedData = JSON.parse(data);

                        return resolve(parsedData);
                    } catch (exception) {
                        return reject('Error while parsing JSON data.');
                    }
                });
        });

        req.on('error', reject);

        if (body) {
            req.write(JSON.stringify(body));
        }

        req.end();
    });
}

function encodeParameters ({ title = '', labels = [] }) {
    const encodedTitle = encodeURIComponent(title);
    const encodedLabels = labels.map((label) => encodeURIComponent(label));

    return {
        title: encodedTitle,
        labels: encodedLabels,
    };
}

const highlight = {
    bold: (str) => '\033[1m' + str + '\033[0m',

    red: (str) => `\x1b[0;31m${str}\x1b[0m`,
    link: (str) => `\x1b[1;35m${str}\x1b[0m`,
    title: (str) => `\x1b[1;36m${str}\x1b[0m`,
    error: (str) => `\x1b[1;31m${str}\x1b[0m`,
    success: (str) => `\x1b[1;32m${str}\x1b[0m`,
    warning: (str) => `\x1b[1;33m${str}\x1b[0m`,
};

module.exports = {
    request,
    spawnSync,
    highlight,
    parseGitRemote,
    encodeParameters,
};
