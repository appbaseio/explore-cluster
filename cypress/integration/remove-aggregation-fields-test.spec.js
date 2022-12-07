import generateName from '../utils/generateName';
import { base_url, username, password, app_url, cluster } from '../utils/index';
import { PAGE_LOAD_TIME } from '../utils/constants.js';

let indexName = '';

describe('Aggregation fields remove test flow', () => {
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

	it('Should open aggregation settings URL', () => {
		cy.server();
		cy.route('**/_searchrelevancy/**').as('relevancy');
		cy.visit(`${base_url}/app/${indexName}/aggs`);
		cy.wait('@relevancy', { timeout: 25000 }).wait(5000);
	});

	it('Should add aggregation fields', () => {
		cy.get('[data-cy=aggregation-fields-dropdown]')
			.click()
			.wait(1000)
			.type('{enter}')
			.wait(1000);
		cy.get('[data-cy=aggregation-fields-dropdown]')
			.click()
			.wait(1000)
			.type('{enter}')
			.wait(1000);
	});

	it('Should review, save & deploy aggregation settings', () => {
		cy.get('[data-cy=review-deploy-button]').click({ force: true }).wait(5000);
		cy.server();
		cy.route('PUT', '**/_searchrelevancy/**').as('relevancy');
		cy.get('[data-cy=review-save-button]').click();
		cy.wait(['@relevancy'], { timeout: 25000 });
	});

	it('Should open aggregation settings URL', () => {
		cy.server();
		cy.route('**/_searchrelevancy/**').as('relevancy');
		cy.visit(`${base_url}/app/${indexName}/aggs`);
		cy.wait('@relevancy', { timeout: 25000 }).wait(5000);
	});

	it('Should delete fields from aggregation settings', () => {
		cy.get('[data-cy=remove-field-email]').click({ force: true }).wait(1000);
		cy.get('[data-cy=remove-field-name]').click({ force: true }).wait(1000);
	});

	it('Should review, save & deploy the new aggregation settings', () => {
		cy.get('[data-cy=review-deploy-button]').click({ force: true }).wait(5000);
		cy.get('[data-cy=aggregation-field-email]')
			.should('contain', 'email')
			.get('[data-cy=aggregation-field-email-status]')
			.should('contain', 'removed')
			.get('[data-cy=aggregation-field-name]')
			.should('contain', 'name')
			.get('[data-cy=aggregation-field-name-status]')
			.should('contain', 'removed');
		cy.server();
		cy.route('PUT', '**/_searchrelevancy/**').as('relevancy');
		cy.get('[data-cy=review-save-button]').click();
		cy.wait(['@relevancy'], { timeout: 25000 });
	});

	it('Should check for no fields in aggregation settings', () => {
		cy.server();
		cy.route('**/_searchrelevancy/**').as('relevancy');
		cy.visit(`${base_url}/app/${indexName}/aggs`);
		cy.wait('@relevancy', { timeout: 25000 }).wait(5000);

		cy.get('[data-cy=aggs-empty-field]')
			.should('contain', 'Please add aggregation fields from the dropdown below')
			.get('[data-cy=review-deploy-button]')
			.should('be.disabled');
	});

	it('Should assign index name prior to deletion', () => {
		let credentials = btoa(`${username}:${password}`);

		fetch(`${app_url}_alias/${indexName}`, {
			headers: {
				Authorization: `Basic ${credentials}`,
			},
		})
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				indexName = Object.keys(data)[0];
			})
			.catch((err) => {
				console.log(err);
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
