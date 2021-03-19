const clip = require('clipboardy');
jest.mock('clipboardy');

const uuid = require('uuid');

const cli = require('../src/cli');

describe('uuid-cli', () => {
    describe('given no arguments', () => {
        it('should generate UUID v4', () => {
            const output = cli({ quiet: true });

            expect(uuid.validate(output.id)).toBe(true);
            expect(uuid.version(output.id)).toBe(4);
        });
    });

    describe('given name but no namespace', () => {
        it('should generate UUID v5 from random namespace', () => {
            const output = cli({ quiet: true, name: 'test' });

            expect(uuid.validate(output.id)).toBe(true);
            expect(uuid.version(output.id)).toBe(5);
        });

        it('should generate different UUIDs each time', () => {
            const first = cli({ quiet: true, name: 'test' });
            const second = cli({ quiet: true, name: 'test' });

            expect(first.id).not.toBe(second.id);
        });
    });

    describe('given name and namespace', () => {
        it('should generate UUID v5', () => {
            const namespace = uuid.v4();
            const output = cli({ quiet: true, ns: namespace, name: 'test' });

            expect(uuid.validate(output.id)).toBe(true);
            expect(uuid.version(output.id)).toBe(5);
        });

        it('should generate same UUID each time', () => {
            const namespace = uuid.v4();
            const first = cli({ quiet: true, ns: namespace, name: 'test'});
            const second = cli({ quiet: true, ns: namespace, name: 'test'});

            expect(first.id).toBe(second.id);
        });
    });

    describe('given multiple names', () => {
        it('should generate UUID v5 using names recursively', () => {
            const namespace = uuid.v4();
            const expectedId = uuid.v5('second', uuid.v5('first', namespace));

            const actual = cli({ quiet: true, ns: namespace, name: ['first', 'second']});

            expect(actual.id).toBe(expectedId);
        });
    });

    describe('given invalid namespace', () => {
        it('should not throw', () => {
            expect(() => cli({ quiet: true, ns: 'not a UUID', name: 'test' })).not.toThrow();
        });

        it('should return an error', () => {
            const output = cli({ quiet: true, ns: 'not a UUID', name: 'test' });

            expect(output.error).toBe("'not a UUID' is not a valid namespace value. A UUID was expected.");
        });
    });

    describe('given clipboard not available', () => {
        beforeEach(() => {
            clip.writeSync.mockImplementation(() => {
                throw new Error("Couldn't find the `xsel` binary and fallback didn't work. On Debian/Ubuntu you can install xsel with: sudo apt install xsel")
            });
        });

        it('should not throw', () => {
            expect(() => cli({ quiet: true })).not.toThrow();
        });

        it('should not report error', () => {
            const output = cli({ quiet: true });

            expect(output.error).toBe(undefined);
        });

        it('should output the UUID', () => {
            const output = cli({ quiet: true });

            expect(output.id).not.toBe(undefined);
            expect(uuid.validate(output.id)).toBe(true);
        });
    });
});
