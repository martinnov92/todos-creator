const fs = require('fs');
const $path = require('path');

const { highlight } = require('./utils');
const { CWD, CONFIG_FILE_NAME } = require('./constants');

const configSchema = {
    // TODO: finish schema for api
    api: { type: 'object' },
    token: { type: 'string' },
    provider: { type: 'string' },
    projectId: { type: 'string' },
    createIssue: { type: 'boolean' },
    ignoreFiles: { type: 'array' },
    ignoreFolders: { type: 'array' },
    allowedExtensions: { type: 'array' },
};

const defaultConfig = {
    api: {},
    createIssue: false,
    ignoreFiles: [],
    allowedExtensions: [ '.js' ],
    ignoreFolders: [ 'node_modules', '.git' ],
};

function loadConfig () {
    const configFilePath = $path.resolve(CWD, CONFIG_FILE_NAME);

    if (!fs.existsSync(configFilePath)) {
        console.log(highlight.warning(`No "${CONFIG_FILE_NAME}" found, using default.`));

        return defaultConfig;
    }

    let isValid = true;
    let errorMessage = null;

    const data = require(configFilePath);

    for (const [ key, value ] of Object.entries(data)) {
        const typeInSchema = configSchema[key].type;
        const isValidType =
            typeInSchema === 'array' ?
                Array.isArray(value) :
                typeof value === typeInSchema;

        if (!configSchema.hasOwnProperty(key)) {
            isValid = false;
            errorMessage = `"${key}" is not correct config option.`;

            break;
        }

        if (!isValidType) {
            isValid = false;
            errorMessage = `"${key}" is not set to the correct type of "${typeInSchema}".`;

            break;
        }
    }

    if (!isValid) {
        throw new Error(`Invalid config - ${errorMessage}`);
    }

    // return merged config
    return { ...defaultConfig, ...data };
}

module.exports = { loadConfig };
