/**
 * Jest setup file
 * Import testing library matchers
 */

import '@testing-library/jest-dom';

// Set NODE_ENV to test to avoid React production build issues
process.env.NODE_ENV = 'test';
