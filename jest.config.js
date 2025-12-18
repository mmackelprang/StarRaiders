module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/ts_src'],
  testMatch: ['**/__tests__/**/*.ts', '**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/ts_src/$1',
    '^@assets/(.*)$': '<rootDir>/ts_src/assets/$1',
    '^@scenes/(.*)$': '<rootDir>/ts_src/scenes/$1',
    '^@entities/(.*)$': '<rootDir>/ts_src/entities/$1',
    '^@systems/(.*)$': '<rootDir>/ts_src/systems/$1',
    '^@ui/(.*)$': '<rootDir>/ts_src/ui/$1',
    '^@utils/(.*)$': '<rootDir>/ts_src/utils/$1',
  },
};
