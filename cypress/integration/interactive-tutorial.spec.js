import generateName from '../utils/generateName';
import { base_url, username, password, app_url, cluster } from '../utils/index';
let TEST_URL = `${base_url}?url=${app_url}&username=${username}&password=${password}&cluster=appbase-demo-ansible&showHelpChat=false&showProfile=false`;
let appName = '';

describe('Interactive Tutorial', () => {
	before(() => {
		cy.window().then((win) => {
			win.localStorage.clear();
			win.sessionStorage.clear();
		});
		appName = generateName();
	});
	beforeEach(() => {
		cy.restoreLocalStorage();
	});
	afterEach(() => {
		cy.saveLocalStorage();
	});
	it('Should skip tutorial section and route to dashboard', () => {
		cy.visit(TEST_URL, { timeout: 100000 })
			.wait(5000)
			.contains('Interactive Tutorial')
			.click()
			.url()
			.should('include', '/tutorial')
			.get('[data-cy=skip-tutorial]')
			.click()
			.get('[data-cy=welcome-message]')
			.contains('Howdy, welcome to your dashboard');
	});
	it('Visits Arc Dashboard Tutorial Page', () => {
		cy.visit(TEST_URL, { timeout: 100000 })
			.wait(5000)
			.contains('Interactive Tutorial')
			.click()
			.url()
			.should('include', '/tutorial')
			.get('[data-cy=index-name]')
			.type(`${appName}`)
			.get('[data-cy=submit-index-name]')
			.click()
			.wait(1000)
			.get('[data-cy=goto-next-step]')
			.click()
			.wait(1000)
			.get('[data-cy=submit-data-import]')
			.click()
			.wait(1000)
			.get('[data-cy=submit-data]')
			.click()
			.get('[data-cy=loader]')
			.should('be.visible')
			.get('[data-cy=loader]')
			.contains('Applying relevant settings...')
			.get('[data-cy=loader]')
			.contains('Preparing the database configuration...')
			.get('[data-cy=loader]')
			.contains('Indexing Movies Dataset of 10,000 records... Almost done!')
			.wait(30000)
			.get('[data-cy=goto-next-step]')
			.click()
			.get('[data-cy=searchable-field-option]')
			.click()
			.get('[id="searchable-fields"]')
			.type('original_title')
			.type('{enter}')
			.get('[data-cy=goto-next-step]')
			.click()
			.get('[data-cy=aggregation-fields]')
			.click()
			.get('[id="searchable-aggergation-field"]')
			.type('release')
			.type('{enter}')
			.get('[data-cy=finish-tutorial]')
			.click();
	});

	it('Should delete index', () => {
		cy.visit(`${base_url}/`)
			.wait(1000)
			.get(`[data-cy=delete-app-${appName}]`)
			.click({ multiple: true, force: true })
			.wait(1000)
			.get(`[data-cy=delete-index-name]`)
			.click()
			.type(`${appName}`)
			.wait(1000)
			.get(`[data-cy=delete-index-${appName}]`)
			.click();
	});

	it('Should logout user', () => {
		cy.clearLocalStorage();
		cy.logoutUser();
	});

	after(() => {
		localStorage.clear();
		TEST_URL = undefined;
		appName = undefined;
	});
});
