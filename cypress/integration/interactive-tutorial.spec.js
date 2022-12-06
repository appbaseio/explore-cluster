import generateName from '../utils/generateName';
import { base_url, username, password, app_url, cluster } from '../utils/index';
import { PAGE_LOAD_TIME, REQUEST_RESOLVE_TIME } from '../utils/constants.js';
let appName = '';

describe('Interactive Tutorial', () => {
	before(() => {
		cy.window().then((win) => {
			win.localStorage.clear();
			win.sessionStorage.clear();
		});
	});
	beforeEach(() => {
		cy.restoreLocalStorage();
	});
	afterEach(() => {
		cy.saveLocalStorage();
	});
	it('Should open arc dashboard locally', () => {
		cy.visit(`${base_url}`).wait(2000);
	});

	it('Should login from cluster URL', () => {
		cy.loginUser(username, password, cluster);
		cy.wait(3000);
	});
	it('Should skip tutorial section and route to dashboard', () => {
		appName = generateName();
		cy.visit(`${base_url}/tutorial`).wait(PAGE_LOAD_TIME).url().should('include', '/tutorial');
		cy.get('[data-cy=skip-tutorial]')
			.click()
			.get('[data-cy=welcome-message]')
			.contains('Howdy, welcome to your dashboard');
	});
	it('Visits Arc Dashboard Tutorial Page', () => {
		cy.visit(`${base_url}/tutorial`).wait(PAGE_LOAD_TIME).url().should('include', '/tutorial');
	});
	it('Should create an index', () => {
		cy.get('[data-cy=index-name]')
			.type(`${appName}`)
			.get('[data-cy=submit-index-name]')
			.click()
			.wait(10000);
		cy.get('[data-cy=goto-next-step]').click().wait(1000);
		cy.get('[data-cy=products').click();
		cy.get('[data-cy=submit-data-import]').click().wait(1000);
	});
	it('Should import data', () => {
		cy.get('[data-cy=submit-data]')
			.click()
			.get('[data-cy=loader]')
			.should('be.visible')
			.get('[data-cy=loader]')
			.contains('Applying relevant settings...');
		cy.wait(35000);
		cy.get('[data-cy=goto-next-step]').click();
	});
	it('Should add fields', () => {
		cy.get('[data-cy=searchable-field-option]').type('product_name{enter}').wait(1000);
		cy.get('[data-cy=goto-next-step]').click().wait(1000);
		cy.get('[data-cy=aggregation-fields]').type('categories{enter}').wait(1000);
		cy.get('[data-cy=finish-tutorial]').click();
	});

	it('Should delete index', () => {
		cy.visit(`${base_url}/`)
			.wait(PAGE_LOAD_TIME)
			.get(`[data-cy=delete-app-${appName}]`)
			.click({ multiple: true, force: true })
			.wait(1000)
			.get(`[data-cy=delete-index-name]`)
			.click()
			.type(`${appName}`)
			.wait(1000)
			.get(`[data-cy=delete-index-${appName}]`)
			.click()
			.wait(REQUEST_RESOLVE_TIME);
	});

	it('Should logout user', () => {
		cy.clearLocalStorage();
		cy.logoutUser();
	});

	after(() => {
		localStorage.clear();
		appName = undefined;
	});
});
