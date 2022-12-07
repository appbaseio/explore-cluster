import generateName from '../utils/generateName';
import { base_url, username, password, app_url, cluster } from '../utils/index';
import { LONG_REQUEST_RESOLVE_TIME, PAGE_LOAD_TIME } from '../utils/constants.js';

let indexName = '';

describe('Searchable fields remove test flow', () => {
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
		cy.visit(`${base_url}`).wait(2000);
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

	it('Should open schema URL', () => {
		cy.server();
		cy.route('**/_mapping').as('mapping');
		cy.visit(`${base_url}/app/${indexName}/schema`);
		cy.wait('@mapping', { timeout: 25000 }).wait(5000);
	});

	it('Should add new data fields in schema', () => {
		cy.get('[data-cy=new-field-button]').click().wait(1000);
		cy.get('input[placeholder="Enter field name"]')
			.type('address')
			.root()
			.contains('Add Field')
			.click()
			.wait(2000);
		cy.get('[data-cy=new-field-button]').click().wait(1000);
		cy.get('input[placeholder="Enter field name"]')
			.type('phone')
			.tab()
			.type('{enter}{downarrow}{downarrow}{enter}', { force: true })
			.root()
			.contains('Add Field')
			.click()
			.wait(2000);
		cy.server();
		cy.route('**/_mapping').as('mapping');
		cy.route('POST', '**/_reindex/**').as('reindex');
		cy.get('[data-cy=confirm-mapping-button]').click();
		cy.wait(['@mapping', '@reindex'], { timeout: 25000 }).wait(5000);
	});

	it('Should verify search fields and add new field from schema', () => {
		cy.server();
		cy.route('**/_searchrelevancy/**').as('relevancy');
		cy.visit(`${base_url}/app/${indexName}/search`);
		cy.wait('@relevancy', { timeout: 25000 }).wait(5000);

		cy.get('[data-cy=field-name-address]')
			.should('contain', 'address')
			.get('[data-cy=field-name-email]')
			.should('contain', 'email')
			.get('[data-cy=field-name-name]')
			.should('contain', 'name')
			.get('[data-cy=searchable-fields-dropdown]')
			.click()
			.type('{downarrow}{enter}')
			.wait(1000);
	});

	it('Should save & deploy search settings', () => {
		cy.get('[data-cy=review-deploy-button]').click({ force: true }).wait(2000);
		cy.server();
		cy.route('**/_mapping').as('mapping');
		cy.route('POST', '**/_reindex/**').as('reindex');
		cy.get('[data-cy=review-save-button]').click();
		cy.wait(['@mapping', '@reindex'], { timeout: 25000 });
	});

	it('Should remove fields from search settings', () => {
		cy.server();
		cy.route('**/_searchrelevancy/**').as('relevancy');
		cy.visit(`${base_url}/app/${indexName}/search`);
		cy.wait('@relevancy', { timeout: 25000 }).wait(5000);

		cy.get('[data-cy=remove-field-address]').click({ force: true }).wait(500);
		cy.get('[data-cy=remove-field-email]').click({ force: true }).wait(500);
		cy.get('[data-cy=remove-field-name]').click({ force: true }).wait(500);
		cy.get('[data-cy=remove-field-phone]').click({ force: true }).wait(1000);
	});

	it('Should reive and deploy the new settings after deleting all the fields', () => {
		cy.get('[data-cy=review-deploy-button]').click();
	});

	it('Should review and save the new search settings', () => {
		cy.get('[data-cy=search-field-address]')
			.should('contain', 'address')
			.get('[data-cy=search-field-address-status]')
			.should('contain', 'removed')
			.get('[data-cy=search-field-email]')
			.should('contain', 'email')
			.get('[data-cy=search-field-email-status]')
			.should('contain', 'removed')
			.get('[data-cy=search-field-phone]')
			.should('contain', 'phone')
			.get('[data-cy=search-field-phone-status]')
			.should('contain', 'removed')
			.get('[data-cy=search-field-name]')
			.should('contain', 'name')
			.get('[data-cy=search-field-name-status]')
			.should('contain', 'removed');
		cy.server();
		cy.route('PUT', '**/_searchrelevancy/**').as('relevancy');
		cy.get('[data-cy=review-save-button]').click();
		cy.wait(['@relevancy'], { timeout: 25000 });
	});

	it('Should check the new search settings after deployment', () => {
		cy.server();
		cy.route('**/_searchrelevancy/**').as('relevancy');
		cy.visit(`${base_url}/app/${indexName}/search`);
		cy.wait('@relevancy', { timeout: 25000 }).wait(5000);

		cy.get('[data-cy=review-deploy-button]').click({ force: true }).wait(2000);
		cy.get('[data-cy=search-field-address]')
			.should('contain', 'address')
			.get('[data-cy=old-weight]')
			.eq(0)
			.should('contain', 'N/A')

			.get('[data-cy=search-field-email]')
			.should('contain', 'email')
			.get('[data-cy=old-weight]')
			.eq(7)
			.should('contain', 'N/A')

			.get('[data-cy=search-field-name]')
			.should('contain', 'name')
			.get('[data-cy=old-weight]')
			.eq(14)
			.should('contain', 'N/A')

			.get('[data-cy=search-field-phone]')
			.should('contain', 'phone')
			.get('[data-cy=old-weight]')
			.eq(21)
			.should('contain', 'N/A');

		cy.get('[data-cy=cancel-modal-button]').click();
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
