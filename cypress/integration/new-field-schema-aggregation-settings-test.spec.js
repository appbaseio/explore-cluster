import generateName from '../utils/generateName';
import { base_url, username, password, app_url, cluster } from '../utils/index';

let indexName = '';

describe('New field from schema should allow it to add to agg settings test flow', () => {
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

	it('Should open schema settings URL', () => {
		cy.visit(`${base_url}/app/${indexName}/schema`).wait(5000);
	});

	it('Should add new data fields in schema', () => {
		cy.get('[data-cy=new-field-button]').click().wait(1000);
		cy.tab().tab().type('phone').root().contains('Add Field').click().wait(2000);

		cy.get('[data-cy=new-field-button]').click().wait(1000);
		cy.tab()
			.tab()
			.type('rating')
			.tab()
			.type('{enter}{downarrow}{downarrow}{enter}')
			.root()
			.contains('Add Field')
			.click()
			.wait(2000);
	});

	it('Should confirm the mapping changes', () => {
		cy.get('[data-cy=confirm-mapping-button]').click().wait(5000);
	});

	it('Should check & confirm the data fields from the redux store', () => {
		cy.window()
			.its('store')
			.invoke('getState')
			.its('$getAppMappings')
			.its(`traversedMappings.${indexName}`)
			.then((arr) => {
				expect(arr).to.have.ordered.members(['email', 'name', 'phone', 'rating']);
			});
	});

	it('Should open aggregation settings URL', () => {
		cy.visit(`${base_url}/app/${indexName}/aggs`).wait(5000);
	});

	it('Should check for the fields availbale to add in aggregation settings', () => {
		cy.get('[data-cy=aggregation-fields-dropdown]').click().type('phone{enter}').wait(1000);
		cy.get('[data-cy=aggregation-fields-dropdown]').click().type('rating{enter}');
	});

	it('Should check for the fields added in aggregation settings', () => {
		cy.get('[data-cy=field-name-phone]').should('contain', 'phone');
		cy.get('[data-cy=field-name-rating]').should('not.contain', 'rating');
		cy.get('[data-cy=review-deploy-button]').click().wait(1000);
		cy.get('[data-cy=aggregation-field-phone]').should('contain', 'phone');
		cy.get('[data-cy=aggregation-field-rating]').should('not.exist');
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
