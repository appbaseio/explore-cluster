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
			win.sessionStorage.clear();
		});
		storedQueryId = generateName();
	});

	it('Should open arc dashboard locally', () => {
		cy.visit(`${base_url}`).wait(2000);
	});

	it('Should login from cluster URL', () => {
		cy.loginUser(username, password, cluster);
	});
	it('Should open stored-query URL', () => {
		cy.openPageSQ(base_url);
	});

	it('Should fill stored-query id', () => {
		cy.wait(1000);
		cy.get('[data-cy=stored-query-id]').type(storedQueryId);
	});

	it('Should fill stored-query description', () => {
		cy.wait(1000);
		cy.get('[data-cy=stored-query-description]').type('test description');
	});

	it('Should fill stored-query query ', () => {
		cy.typeInMonacoEditorSQ(queryValue);
	});

	it('Should review the stored-query entered values', () => {
		cy.get('[data-cy=sq-review-and-save]').click();
		cy.get(`[data-cy=new-value-StoredQueryId-status]`).should('contain', storedQueryId);
		cy.get(`[data-cy=new-value-QueryDescription-status]`).should('contain', 'test description');
	});

	it('Should save new stored-query ', () => {
		cy.saveSQ(storedQueryId);
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
		cy.logoutUser();
	});

	after(() => {
		storedQueryId = '';
	});
});
