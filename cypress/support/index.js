// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')
const options = {
	defaultTrimLength: 1000,
	printLogs: 'always',
	collectTypes: [
		'cons:log',
		'cons:error',
		'cy:log',
		'cy:xhr',
		'cy:request',
		'cy:route',
		'cy:command',
	],
};
require('cypress-terminal-report/src/installLogsCollector')(options);
