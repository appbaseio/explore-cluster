import generateName from '../utils/generateName';
import { base_url, username, password, app_url, cluster } from '../utils/index';
import { PAGE_LOAD_TIME } from '../utils/constants.js';

let indexName = '';

describe('Save field schema settings test flow', () => {
	before(() => {
		cy.window().then((win) => {
			win.localStorage.clear();
			win.sessionStorage.clear();
		});
		indexName = generateName();
	});
	beforeEach(() => {
		cy.restoreLocalStorage();
	});
	afterEach(() => {
		cy.saveLocalStorage();
	});

	it('Should open arc dashboard locally', () => {
		cy.visit(`${base_url}`).wait(3000);
	});

	it('Should login from cluster URL', () => {
		cy.loginUser(username, password, cluster);
	});

	it('Should navigate to cluster overview', () => {
		cy.visit(`${base_url}`);
		cy.wait(5000);
	});

	it('Should create new index', () => {
		cy.wait(1000).get('[data-cy=initialize-new-index-creation]').click().wait(2000);
		cy.server();
		cy.route('PUT', `**/${indexName}`).as('indexing');
		cy.get('[data-cy=new-index-name]')
			.type(`${indexName}`)
			.get('[data-cy=new-index-language]')
			.click()
			.type('English{enter}')
			.wait(1000)

			.get('[data-cy=create-new-index]')
			.click();

		cy.wait('@indexing').wait(5000);
	});

	it('Should index data', () => {
		let credentials = btoa(`${username}:${password}`);
		cy.request({
			method: 'PUT',
			url: `${app_url}${indexName}/_doc/1`,
			headers: {
				Authorization: `Basic ${credentials}`,
				'Content-Type': 'application/json',
			},
			body: {
				name: 'Anik',
				email: 'anik@gmail.com',
			},
		});
		cy.request({
			method: 'PUT',
			url: `${app_url}${indexName}/_doc/2`,
			headers: {
				Authorization: `Basic ${credentials}`,
				'Content-Type': 'application/json',
			},
			body: {
				name: 'Ghosh',
				email: 'ghosh@gmail.com',
			},
		});
	});

	it('Should add new data fields in schema', () => {
		// Visit Schema page
		cy.server();
		cy.route('**/_mapping').as('mapping');
		cy.route('**/_searchrelevancy/**').as('relevancy');
		cy.visit(`${base_url}/app/${indexName}/schema`);
		cy.wait(['@mapping', '@relevancy'], { timeout: 25000 }).wait(5000);

		cy.get('[data-cy=new-field-button]').click().wait(1000);
		cy.get('input[placeholder="Enter field name"]')
			.type('rating')
			.root()
			.contains('Add Field')
			.click()
			.wait(2000);

		// Should check for all the sub fields in the newly added data feild
		cy.get('[data-cy=rating-popover-icon]').trigger('mouseover');
		cy.get('[data-cy=rating-popover-content]')
			.should('contain', 'keyword')
			.and('contain', 'search')
			.and('contain', 'autosuggest')
			.and('contain', 'delimiter')
			.and('contain', 'synonyms')
			.and('contain', 'lang');

		cy.server();
		cy.route('**/_mapping').as('mapping');
		cy.route('POST', '**/_reindex/**').as('reindex');
		cy.get('[data-cy=confirm-mapping-button]').click();
		cy.wait(['@mapping', '@reindex'], { timeout: 25000 }).wait(5000);

		// Should check & confirm the mappings from the redux store
		cy.window()
			.its('store')
			.invoke('getState')
			.its('$getAppMappings')
			.its(`rawMappings.${indexName}.properties.rating.fields`)
			.then((obj) => {
				expect(obj).to.have.nested.property('keyword');
				expect(obj).to.have.nested.property('search');
				expect(obj).to.have.nested.property('autosuggest');
				expect(obj).to.have.nested.property('delimiter');
				expect(obj).to.have.nested.property('synonyms');
				expect(obj).to.have.nested.property('lang');
			});
	});

	it('Should delete index', () => {
		let credentials = btoa(`${username}:${password}`);

		cy.request({
			method: 'DELETE',
			url: `${app_url}${indexName}`,
			headers: {
				Authorization: `Basic ${credentials}`,
			},
		});
	});

	it('Should logout user', () => {
		cy.clearLocalStorage();
		cy.logoutUser();
	});

	after(() => {
		localStorage.clear();
		indexName = undefined;
	});
});
