/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          types: ['jest'],
          strict: true,
          esModuleInterop: true,
          resolveJsonModule: true,
          isolatedModules: true,
          module: 'commonjs',
          moduleResolution: 'bundler',
          target: 'ES2020',
          rootDir: '.',
          ignoreDeprecations: '6.0',
          paths: { '@/*': ['./src/*'] },
        },
      },
    ],
  },
};
