import generateName from '../utils/generateName';
import { base_url, username, password, app_url, cluster } from '../utils/index';

let indexName = '',
	indexName2 = '';

describe('Clone settings test flow', () => {
	before(() => {
		indexName = generateName();
		indexName2 = indexName + '-2';
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
				rating: '4',
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
				rating: '5',
			},
		});
	});

	it('Should open search settings URL', () => {
		cy.visit(`${base_url}/app/${indexName}/search`).wait(5000);
	});

	it('Should change field weight of email in search settings', () => {
		cy.get('[data-cy=email-number-input]').click().type('{uparrow}{uparrow}{uparrow}{uparrow}');
	});

	it('Wait for some time', () => {
		cy.wait(2000);
	});

	it('Should not change field weight of name in search settings', () => {
		cy.get('[data-cy=name-number-input]').click();
	});

	it('Wait for some time', () => {
		cy.wait(2000);
	});

	it('Should change field weight of rating in search settings', () => {
		cy.get('[data-cy=rating-number-input]')
			.click()
			.type('{uparrow}{uparrow}{uparrow}{uparrow}{uparrow}{uparrow}')
			.wait(2000);
	});

	it('Should review, save & deploy the changed settings', () => {
		cy.get('[data-cy=review-deploy-button]').click().wait(2000);
		cy.get('[data-cy=search-field-email]')
			.should('contain', 'email')
			.get('[data-cy=new-weight]')
			.eq(0)
			.should('contain', '3.0')
			.get('[data-cy=search-field-name]')
			.should('contain', 'name')
			.get('[data-cy=new-weight]')
			.eq(7)
			.should('contain', '1.0')
			.get('[data-cy=search-field-rating]')
			.should('contain', 'rating')
			.get('[data-cy=new-weight]')
			.eq(14)
			.should('contain', '4.0');
		cy.get('[data-cy=review-save-button]').click().wait(5000);
	});

	it('Should create a new index and clone the settings to it', () => {
		cy.root().contains('Copy Search Settings').click();
		cy.get('[data-cy=destination-index-name]')
			.type(indexName2)
			.get('[data-cy=copy-search-relevancy-settings]')
			.click()
			.get('[data-cy=copy-synonyms]')
			.click()
			.get('[data-cy=clone-button]')
			.click()
			.wait(10000);
	});

	it('Should open search settings URL of the new index', () => {
		cy.visit(`${base_url}/app/${indexName2}/search`).wait(5000);
	});

	it('Should verify the search settings of the new index', () => {
		cy.get('[data-cy=field-name-email]')
			.should('contain', 'email')
			.get('[data-cy=email-number-input]')
			.should('have.value', '3.0')
			.get('[data-cy=field-name-name]')
			.should('contain', 'name')
			.get('[data-cy=name-number-input]')
			.should('have.value', '1.0')
			.get('[data-cy=field-name-rating]')
			.should('contain', 'rating')
			.get('[data-cy=rating-number-input]')
			.should('have.value', '4.0');
	});

	it('Should delete the indexs', () => {
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
			.click()
			.wait(2000)
			.get(`[data-cy=delete-app-${indexName2}]`)
			.click({ multiple: true, force: true })
			.wait(1000)
			.get(`[data-cy=delete-index-name]`)
			.click()
			.type(`${indexName2}`)
			.wait(1000)
			.get(`[data-cy=delete-index-${indexName2}]`)
			.click();
	});

	it('Should logout user', () => {
		cy.get('[data-cy=logout-menu]').click().wait(1000).get('[data-cy=logout-button]').click();
	});

	after(() => {
		indexName = undefined;
		indexName2 = undefined;
	});
});
