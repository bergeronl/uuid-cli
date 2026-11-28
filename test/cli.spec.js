import {jest} from '@jest/globals';
import * as uuid from 'uuid';

jest.unstable_mockModule('clipboardy', () => ({
    default: { writeSync: jest.fn() },
}));

const { default: clip } = await import('clipboardy');
const cli = await import('../src/cli.js');

describe('uuid-cli', () => {

    beforeEach(() => {
        clip.writeSync.mockReset();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    })

    describe('given no arguments', () => {
        it('should generate UUID v4', () => {
            const output = cli.run({ quiet: true });

            expect(uuid.validate(output.id)).toBe(true);
            expect(uuid.version(output.id)).toBe(4);
        });

        it('should copy the generated UUID to the clipboard', () => {
            const output = cli.run({ quiet: true });

            expect(clip.writeSync).toHaveBeenCalledWith(output.id);
        });
    });

    describe('given name but no namespace', () => {
        it('should generate UUID v5 from random namespace', () => {
            const output = cli.run({ quiet: true, name: 'test' });

            expect(uuid.validate(output.id)).toBe(true);
            expect(uuid.version(output.id)).toBe(5);
        });

        it('should generate different UUIDs each time', () => {
            const first = cli.run({ quiet: true, name: 'test' });
            const second = cli.run({ quiet: true, name: 'test' });

            expect(first.id).not.toBe(second.id);
        });
    });

    describe('given name and namespace', () => {
        it('should generate UUID v5', () => {
            const namespace = uuid.v4();
            const output = cli.run({ quiet: true, ns: namespace, name: 'test' });

            expect(uuid.validate(output.id)).toBe(true);
            expect(uuid.version(output.id)).toBe(5);
        });

        it('should generate same UUID each time', () => {
            const namespace = uuid.v4();
            const first = cli.run({ quiet: true, ns: namespace, name: 'test'});
            const second = cli.run({ quiet: true, ns: namespace, name: 'test'});

            expect(first.id).toBe(second.id);
        });
    });

    describe('given multiple names', () => {
        it('should generate UUID v5 using names recursively', () => {
            const namespace = uuid.v4();
            const expectedId = uuid.v5('second', uuid.v5('first', namespace));

            const actual = cli.run({ quiet: true, ns: namespace, name: ['first', 'second']});

            expect(actual.id).toBe(expectedId);
        });
    });

    describe('given invalid namespace', () => {
        it('should not throw', () => {
            expect(() => cli.run({ quiet: true, ns: 'not a UUID', name: 'test' })).not.toThrow();
        });

        it('should return an error', () => {
            const output = cli.run({ quiet: true, ns: 'not a UUID', name: 'test' });

            expect(output.error).toBe("'not a UUID' is not a valid namespace value. A UUID was expected.");
        });
    });

    describe('given clipboard not available', () => {
        beforeEach(() => {
            clip.writeSync.mockImplementation(() => {
                throw new Error('Clipboard unavailable');
            });
        });

        it('should not throw', () => {
            expect(() => cli.run({ quiet: true })).not.toThrow();
        });

        it('should not report error', () => {
            const output = cli.run({ quiet: true });

            expect(output.error).toBe(undefined);
        });

        it('should output the UUID', () => {
            const output = cli.run({ quiet: true });

            expect(output.id).not.toBe(undefined);
            expect(uuid.validate(output.id)).toBe(true);
        });
    });
});
