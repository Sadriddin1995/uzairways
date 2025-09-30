/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  verbose: true,
  collectCoverage: false,
  transform: {
    '^.+\\.ts$': ['babel-jest', {
      presets: [
        [require.resolve('@babel/preset-env'), { targets: { node: 'current' } }],
        require.resolve('@babel/preset-typescript'),
      ],
    }],
  },
};
