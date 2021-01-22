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

    describe('given invalid namespace', () => {
        it('should not throw', () => {
            expect(() => cli({ quiet: true, ns: 'not a UUID', name: 'test' })).not.toThrow();
        });

        it('should return an error', () => {
            const output = cli({ quiet: true, ns: 'not a UUID', name: 'test' });

            expect(output.error).toBe("'not a UUID' is not a valid namespace value. A UUID was expected.");
        });
    });
});
