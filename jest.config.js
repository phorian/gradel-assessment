module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src', '<rootDir>/tests'],
    testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
    transform: {
      '^.+\\.ts$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
    },
    collectCoverageFrom: [
      'src/**/*.{ts,js}',
      '!src/**/*.d.ts',
      '!src/index.ts',
      '!src/config/**/*',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    globals: {
      'ts-jest': {
        tsconfig: 'tsconfig.json',
      },
    },
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  };