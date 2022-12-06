import generateName from '../utils/generateName';
import { base_url, username, password, app_url, cluster } from '../utils/index';
import { PAGE_LOAD_TIME } from '../utils/constants.js';

let indexName = '';

describe('Aggregation fields add test flow', () => {
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
		cy.wait(PAGE_LOAD_TIME);
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
		cy.visit(`${base_url}/app/${indexName}/aggs`).wait(PAGE_LOAD_TIME);
	});

	it('Should add aggregation feilds', () => {
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

	it('Should test search relevancy & results', () => {
		cy.get('[data-cy=test-search-relevancy-button]').click().wait(5000);
		cy.get('[data-cy=aggs-values-email]')
			.should('contain', 'Email')
			.get('[data-cy=aggs-values-name]')
			.should('contain', 'Name');
		cy.get('.ant-modal-close-icon').click().wait(2000);
	});

	it('Should review, save & deploy aggregation settings', () => {
		cy.get('[data-cy=review-deploy-button]').click({ force: true }).wait(5000);
		cy.get('[data-cy=review-save-button]').click().wait(5000);
	});

	it('Should check aggregation settings persistence', () => {
		cy.visit(`${base_url}/app/${indexName}/aggs`).wait(PAGE_LOAD_TIME);
		cy.get('[data-cy=field-name-email]')
			.should('contain', 'email')
			.get('[data-cy=field-name-name]')
			.should('contain', 'name');
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
