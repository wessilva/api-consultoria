const { clear } = require("console");

module.exports = {
    preset : 'ts-jest',
    testEnvironment : 'node',
    roots: ['<rootDir>/src/'],
    testMatch: ['**/__tests__/**/*.ts'],
    moduleFileExtensions: ['ts', 'js', 'json'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/server.ts'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    clearMocks: true,
}