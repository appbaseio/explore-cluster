import generateName from '../utils/generateName';
import { base_url, username, password, app_url, cluster } from '../utils/index';
import { PAGE_LOAD_TIME } from './contants';

let indexName = '';

describe('New field from schema should allow it to add to agg settings test flow', () => {
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
		cy.get('[data-cy=initialize-new-index-creation]').click().wait(2000);
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
		cy.server();
		cy.route('**/_mapping').as('mapping');
		cy.visit(`${base_url}/app/${indexName}/schema`);
		cy.wait('@mapping');
	});

	it('Should add new data fields in schema', () => {
		cy.get('[data-cy=new-field-button]').click().wait(1000);
		cy.get('input[placeholder="Enter field name"]')
			.type('phone')
			.root()
			.contains('Add Field')
			.click()
			.wait(2000);

		cy.get('[data-cy=new-field-button]').click().wait(1000);
		cy.get('input[placeholder="Enter field name"]')
			.type('rating')
			.tab()
			.type('{enter}{downarrow}{downarrow}{enter}', { force: true })
			.root()
			.contains('Add Field')
			.click()
			.wait(2000);
	});

	it('Should confirm the mapping changes', () => {
		cy.server();
		cy.route('**/_mapping').as('mapping');
		cy.get('[data-cy=confirm-mapping-button]').click();
		cy.wait('@mapping', { timeout: 20000 });
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
		cy.visit(`${base_url}/app/${indexName}/aggs`).wait(PAGE_LOAD_TIME);
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
		cy.get('[data-cy=cancel-modal-button]').click();
	});

	it('Should detect re-indexing and assign index name prior to deletion', () => {
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
