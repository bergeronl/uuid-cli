import * as uuid from 'uuid';
import * as clip from 'clipboardy';
import * as chalk from 'chalk';
import commandLineArgs from '../node_modules/command-line-args/dist/index.mjs';
import * as cmdUsage from 'command-line-usage';

const cmdOptionDefinitions = [
    { name: 'ns', type: String },
    { name: 'name', alias: 'n', type: String, multiple: true, defaultOption: true },
    { name: 'verbose', alias: 'v', type: Boolean },
    { name: 'quiet', alias: 'q', type: Boolean },
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
                description: 'The name used to generate the UUID. Specifying the name argument many times generates the ID recursively.'
            },
            {
                name: 'verbose',
                description: 'Prints detailed traces.'
            },
            {
                name: 'quiet',
                description: 'Does not output result to the console.'
            },
            {
                name: 'help',
                description: 'Prints this usage guide.'
            }
        ]
    }
];

let options;

const log = (message) => {
    if (!options.quiet) {
        console.log(message);
    }
};

const logv = (message) => {
    if (!options.quiet && options.verbose) {
        console.log(chalk.gray(message));
    }
};

const logw = (message) => {
    if (!options.quiet && options.verbose) {
        console.warn(chalk.yellow(message));
    }
}

const loge = (message) => {
    if (!options.quiet) {
        console.error(chalk.red(message));
    }
}

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
        throw `'${options.ns}' is not a valid namespace value. A UUID was expected.`;
    }

    const name = options.name;
    logv(`Namespace: ${namespace}`);
    logv(`Name:      ${name}`);

    return generateRecursiveId([...name], namespace);
};

const generateRecursiveId = (names, namespace) => {
    if (names.length === 0) {
        return namespace;
    }

    const [currentName, ...otherNames] = names;
    const nextNamespace = uuid.v5(currentName, namespace);

    return generateRecursiveId(otherNames, nextNamespace);
}

const copyAndPrintId = (id) => {
    try {
        clip.writeSync(id);
    } catch (error) {
        logw('Clipboard is not available');
    }
    
    log(id);
    logv('id copied to clipboard');
}

export const run = (opts = commandLineArgs(cmdOptionDefinitions)) => {
    options = opts;

    const output = {};

    if (options.help) {
        showHelp();
    } else {
        try {
            output.id = generateId();
            copyAndPrintId(output.id);
        } catch (error) {
            output.error = error;
            loge(output.error);
        }
    }

    return output;
};
