import { PAGE_LOAD_TIME } from '../utils/constants';
import generateName from '../utils/generateName';
import { base_url, username, password, app_url, cluster } from '../utils/index';

let storedQueryId = '';

let queryValue =
	'{ctrl+a}{cmd+a}{backspace}{{}"index":"test","query":{{}"query":{{}"term":{{}"brand.keyword":"{{}{{}brand{}}{}}"{}}{}}{}},"params":{{}"brand":"First Choice"{}},"description":"Brand Facet"{}}';

let editQueryValue =
	'{ctrl+a}{cmd+a}{backspace}{{}"index":"test","query":{{}"query":{{}"term":{{}"brand.keyword":"{{}{{}brand{}}{}}"{}}{}}{}},"params":{{}"brand":"First Choice edited"{}},"description":"Brand Facet edited"{}}';

describe('Stored query create test flow', () => {
	before(() => {
		cy.window().then((win) => {
			win.localStorage.clear();
			win.sessionStorage.clear();
		});
		storedQueryId = generateName();
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
	});
	it('Should create a stored query', () => {
		cy.server();
		cy.route('**/_analytics/storedqueries/**').as('analytics');
		cy.route('**/_storedqueries').as('storedqueries');
		cy.visit(`${base_url}/cluster/stored-queries`).wait(2500);
		cy.wait(['@storedqueries', '@analytics'], { timeout: 30000 });

		cy.contains('Create Stored Query').click();
		cy.wait(1000);
		cy.get('[data-cy=stored-query-id]').type(storedQueryId);

		cy.wait(1000);
		cy.get('[data-cy=stored-query-description]').type('test description');

		cy.typeInMonacoEditorSQ(queryValue);
		cy.scrollTo('top');

		cy.get(`[data-cy=sq-execute]`).click({ force: true });
		cy.wait(2000);
		cy.scrollTo('top');
		cy.get('[data-cy=sq-review-and-save]').click();
		cy.get(`[data-cy=new-value-StoredQueryId-status]`).should('contain', storedQueryId);
		cy.get(`[data-cy=new-value-QueryDescription-status]`).should('contain', 'test description');

		cy.route('PUT', '**/_storedquery/**').as('put-storedquery');
		cy.contains('Review and Save').click();
		cy.wait('@put-storedquery', { timeout: 30000 });
	});

	it('Should validate stored-query', () => {
		cy.openEditWindowSQ(storedQueryId);
		cy.get(`[data-cy=sq-validate]`).click({ force: true });
		cy.wait(1000);
		cy.scrollTo('bottom');
		cy.wait(1000);
		cy.contains('Go back to Stored Queries').scrollIntoView().click();
	});

	it('Should execute stored-query', () => {
		cy.openEditWindowSQ(storedQueryId);
		cy.get(`[data-cy=sq-execute]`).click({ force: true });
		cy.wait(1000);
		cy.scrollTo('bottom');
		cy.wait(1000);
		cy.contains('Go back to Stored Queries').scrollIntoView().click();
	});

	it('Should edit stored-query', () => {
		cy.openEditWindowSQ(storedQueryId);
		cy.wait(1000);
		cy.get('[data-cy=stored-query-description]').type(
			'{selectall}{backspace}test description edited',
		);
		cy.typeInMonacoEditorSQ(editQueryValue);
		cy.get(`[data-cy=sq-execute]`).click({ force: true });
		cy.wait(2000);
		cy.scrollTo('top');
		cy.get('[data-cy=sq-review-and-save]').click();
		cy.saveSQ(storedQueryId);
		cy.wait(2000);
	});

	it('Should delete created stored-query ', () => {
		cy.wait(3000);
		cy.deleteSQ(storedQueryId);
		cy.wait(2000);
	});
	it('Should logout user', () => {
		cy.clearLocalStorage();
		cy.logoutUser();
	});

	after(() => {
		localStorage.clear();
		storedQueryId = '';
	});
});
