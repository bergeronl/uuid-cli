#!/usr/bin/env node

const uuid = require('uuid');
const clip = require('clipboardy');
const chalk = require('chalk');
const cmdParser = require('command-line-args');
const cmdUsage = require('command-line-usage');

const cmdOptionDefinitions = [
    { name: 'ns', type: String },
    { name: 'name', alias: 'n', type: String, defaultOption: true },
    { name: 'verbose', alias: 'v', type: Boolean },
    { name: 'help', alias: 'h', type: Boolean }
];
const cmdOptionSections = [
    {
        header: 'uuid-cli',
        content: 'Command-line utility that generates UUIDs. When no options are passed, generates a random UUID v4 and copies it to the clipboard.'
    },
    {
        header: 'Options',
        optionList: [
            {
                name: 'ns',
                typeLabel: '{underline namespace}',
                description: 'The namespace for generating a UUID v5. This value must be a UUID.'
            },
            {
                name: 'name',
                typeLabel: '{underline name}',
                description: 'The name used to generate the UUID.'
            },
            {
                name: 'verbose',
                description: 'Prints detailed traces.'
            },
            {
                name: 'help',
                description: 'Prints this usage guide.'
            }
        ]
    }
];

const log = (message) => {
    console.log(message);
};

const logv = (message) => {
    if (options.verbose) {
        console.log(chalk.gray(message));
    }
};

const showHelp = () => {
    log(cmdUsage(cmdOptionSections));
};

const generateId = () => {
    const generateRandom = !options.name;

    return generateRandom
        ? generateRandomId()
        : generateScopedId();
};

const generateRandomId = () => {
    logv('Generating random id');
    return uuid.v4();
};

const generateScopedId = () => {
    if (!options.ns) {
        logv('Namespace not defined. Will be generated.');
    }

    const namespace = options.ns || generateRandomId();
    if (!uuid.validate(namespace)) {
        throw new Error(`'${options.ns}' is not a valid namespace value. A UUID was expected.`);
    }

    const name = options.name;
    logv(`Namespace: ${namespace}`);
    logv(`Name:      ${name}`);

    return uuid.v5(name, namespace);
};

const copyAndPrintId = (id) => {
    clip.writeSync(id);
    log(id);
    logv('id copied to clipboard');
}

const main = () => {
    if (options.help) {
        showHelp();
    } else {
        try {
            const id = generateId();
            copyAndPrintId(id);
        } catch (error) {
            console.error(chalk.red(error));
        }
    }
};

const options = cmdParser(cmdOptionDefinitions);
main();
