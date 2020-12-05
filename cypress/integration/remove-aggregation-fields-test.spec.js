import generateName from '../utils/generateName';
import { base_url, username, password, app_url, cluster } from '../utils/index';

let indexName = '';

describe('Aggregation fields remove test flow', () => {
	before(() => {
		indexName = generateName();
	});

	it('Should open arc dashboard locally', () => {
		cy.visit(`${base_url}`).wait(2000);
	});

	it('Should login from cluster URL', () => {
		cy.get('[data-cy=cluster-url]')
			.clear()
			.type(`https://${username}:${password}@${cluster}`)
			.wait(1000)
			.blur()
			.wait(1000);
		cy.get('[data-cy=signin-button]').click();
	});

	it('Should create new index', () => {
		cy.wait(5000).get('[data-cy=initialize-new-index-creation]').click().wait(2000);
		generateName();
		cy.get('[data-cy=new-index-name]')
			.type(`${indexName}`)
			.get('[data-cy=new-index-language]')
			.click()
			.type('English{enter}')
			.wait(1000)

			.get('[data-cy=create-new-index]')
			.click();
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
		cy.visit(`${base_url}/app/${indexName}/aggs`).wait(5000);
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
		cy.get('[data-cy=review-save-button]').click().wait(5000);
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
		cy.get('[data-cy=review-save-button]').click().wait(5000);
	});

	it('Should check for no fields in aggregation settings', () => {
		cy.get('[data-cy=aggs-empty-field]')
			.should('contain', 'Please add aggregation fields from the dropdown below')
			.get('[data-cy=review-deploy-button]')
			.should('be.disabled');
	});

	it('Should delete index', () => {
		cy.visit(`${base_url}/`)
			.wait(1000)
			.get(`[data-cy=delete-app-${indexName}]`)
			.click({ multiple: true, force: true })
			.wait(1000)
			.get(`[data-cy=delete-index-name]`)
			.click()
			.type(`${indexName}`)
			.wait(1000)
			.get(`[data-cy=delete-index-${indexName}]`)
			.click();
	});

	it('Should logout user', () => {
		cy.get('[data-cy=logout-menu]').click().wait(1000).get('[data-cy=logout-button]').click();
	});

	after(() => {
		indexName = undefined;
	});
});
