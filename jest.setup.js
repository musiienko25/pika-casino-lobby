/**
 * Jest setup file
 * Import testing library matchers
 */

import '@testing-library/jest-dom';

// Fix for React 19 compatibility with @testing-library/react
// @testing-library/react tries to use React.act from react-dom/test-utils
// but React 19 requires it from 'react' package
// eslint-disable-next-line @typescript-eslint/no-require-imports
const React = require('react');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { act } = require('react');

// Make React.act available for @testing-library/react
// The library checks for React.act in act-compat.js
if (!React.act) {
  React.act = act;
}

// Make React available globally so @testing-library/react can access React.act
global.React = React;
