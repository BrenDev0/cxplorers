/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  projects: [
    {
      displayName: "integration",
      preset: "ts-jest",
      testEnvironment: "node",
      testMatch: ["**/__tests__/integration/**/*.test.ts"],
      clearMocks: true,
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1"
      }
    },
    {
      displayName: "e2e",
      preset: "ts-jest",
      testEnvironment: "node",
      testMatch: ["**/__tests__/e2e/**/*.test.ts"],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1"
      }
    },
    {
      displayName: "unit",
      preset: "ts-jest",
      testEnvironment: "node",
      testMatch: ["**/__tests__/unit/**/*.test.ts"],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1"
      }
    }
  ]
};