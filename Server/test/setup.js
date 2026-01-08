/**
 * Test Setup and Configuration
 * This file runs before all tests to set up the testing environment
 */

const { expect } = require('chai');
const sinon = require('sinon');

// Make chai and sinon available globally in tests
global.expect = expect;
global.sinon = sinon;

// Suppress console output during tests
process.env.NODE_ENV = 'test';
