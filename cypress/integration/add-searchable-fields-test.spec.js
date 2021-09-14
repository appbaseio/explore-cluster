import generateName from '../utils/generateName';
import { base_url, username, password, app_url, cluster } from '../utils/index';

let indexName = '';

describe('Searchable fields add test flow', () => {
	before(() => {
		cy.window().then((win) => {
			win.sessionStorage.clear();
		});
		indexName = generateName();
	});

	it('Should open arc dashboard locally', () => {
		cy.visit(`${base_url}`).wait(2000);
	});

	it('Should login from cluster URL', () => {
		cy.loginUser(username, password, cluster);
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

	it('Should open schema URL', () => {
		cy.visit(`${base_url}/app/${indexName}/schema`).wait(5000);
	});

	it('Should add new data fields in schema', () => {
		cy.get('[data-cy=new-field-button]').click().wait(1000);
		cy.tab().tab().type('address').root().contains('Add Field').click().wait(2000);
		cy.get('[data-cy=new-field-button]').click().wait(1000);
		cy.tab()
			.tab()
			.type('phone')
			.tab()
			.type('{enter}{downarrow}{downarrow}{enter}')
			.root()
			.contains('Add Field')
			.click()
			.wait(2000);
		cy.root().contains('Confirm Mapping Changes').click().wait(5000);
	});

	it('Should open search settings URL', () => {
		cy.visit(`${base_url}/app/${indexName}/search`).wait(5000);
	});

	it('Should verify search fields and add new field from schema', () => {
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

	it('Should review, save & deploy search settings', () => {
		cy.get('[data-cy=review-deploy-button]').click({ force: true }).wait(2000);
		cy.get('[data-cy=search-field-address]')
			.should('contain', 'address')
			.get('[data-cy=search-field-address-status]')
			.should('contain', 'new')
			.get('[data-cy=search-field-email]')
			.should('contain', 'email')
			.get('[data-cy=search-field-email-status]')
			.should('contain', 'new')
			.get('[data-cy=search-field-phone]')
			.should('contain', 'phone')
			.get('[data-cy=search-field-phone-status]')
			.should('contain', 'new')
			.get('[data-cy=search-field-name]')
			.should('contain', 'name')
			.get('[data-cy=search-field-name-status]')
			.should('contain', 'new');
		cy.get('[data-cy=review-save-button]').click().wait(5000);
	});

	it('Should check search fields after deployment', () => {
		cy.get('[data-cy=field-name-address]')
			.should('contain', 'address')
			.get('[data-cy=field-name-email]')
			.should('contain', 'email')
			.get('[data-cy=field-name-name]')
			.should('contain', 'name')
			.get('[data-cy=field-name-phone]')
			.should('contain', 'phone');
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
		cy.logoutUser();
	});

	after(() => {
		indexName = undefined;
	});
});
