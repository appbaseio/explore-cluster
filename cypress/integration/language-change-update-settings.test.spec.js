import generateName from '../utils/generateName';
import { base_url, username, password, app_url, cluster } from '../utils/index';

let indexName = '';

describe('Disable ngram remove search fields and reindex data test flow', () => {
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

	it('Should open language settings URL', () => {
		cy.visit(`${base_url}/app/${indexName}/languages`).wait(5000);
	});

	it('Should change language analyzer from english to universal', () => {
		cy.get('[data-cy=language-value]').click().type('Universal{enter}');
	});

	it('Should review, save and deploy the new language settings', () => {
		cy.get('[data-cy=review-deploy-button]').click({ force: true }).wait(5000);
		cy.get('[data-cy=old-value-language-status]')
			.should('contain', 'english')
			.get('[data-cy=new-value-language-status]')
			.should('contain', 'universal');
		cy.get('[data-cy=review-save-button]').click().wait(5000);
	});

	it('Should check the new language analyzer in search settings', () => {
		cy.visit(`${base_url}/app/${indexName}/search`).wait(5000);
		cy.get('[data-cy=email-popover-icon]').trigger('mouseover');
		cy.get('[data-cy=email-popover-content]').should('contain', '"analyzer": "universal"');
		cy.get('[data-cy=name-popover-icon]').trigger('mouseover', { force: true });
		cy.get('[data-cy=name-popover-content]').should('contain', '"analyzer": "universal"');
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
