// filepath: jest.setup.js
import '@testing-library/jest-dom'

// Polyfill setImmediate for postgres/drizzle
if (!global.setImmediate) {
  global.setImmediate = setTimeout;
  global.clearImmediate = clearTimeout;
}