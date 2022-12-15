import generateName from '../utils/generateName';
import { base_url, username, password, app_url, cluster } from '../utils/index';
import { LONG_REQUEST_RESOLVE_TIME, PAGE_LOAD_TIME } from '../utils/constants.js';

let indexName = '';

describe('Update field schema settings test flow', () => {
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

		cy.wait('@indexing');
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

	it('Should open schema settings URL', () => {
		cy.server();
		cy.route('**/_mapping').as('mapping');
		cy.route('**/_searchrelevancy/**').as('relevancy');
		cy.route('**/_aliasedindices').as('indices');
		cy.visit(`${base_url}/app/${indexName}/schema`);
		cy.wait(['@mapping', '@indices', '@relevancy'], { timeout: 30000 });
	});

	it('Should change the datatype of rating from text to integer', () => {
		cy.get('[data-cy=data-type-rating]').click().type('{enter}{downarrow}{enter}').wait(5000);
	});

	it('Should confirm the data type of rating is integer before confirm mapping', () => {
		cy.get('[data-cy=rating-popover-icon]').trigger('mouseover').wait(1000);
		cy.get('[data-cy=rating-popover-content]').should('contain', '"type": "integer"');
	});

	it('Should confirm the mapping changes', () => {
		cy.server();
		cy.route('**/_mapping').as('mapping');
		cy.get('[data-cy=confirm-mapping-button]').click();
		cy.wait('@mapping', { timeout: 20000 });
	});

	it('Should check the data type of rating to integer', () => {
		cy.server();
		cy.route('**/_mapping').as('mapping');
		cy.route('**/_searchrelevancy/**').as('relevancy');
		cy.route('**/_aliasedindices').as('indices');
		cy.visit(`${base_url}/app/${indexName}/schema`);
		cy.wait(['@mapping', '@indices', '@relevancy'], { timeout: 30000 });

		cy.get('[data-cy=rating-popover-icon]').trigger('mouseover').wait(1000);
		cy.get('[data-cy=rating-popover-content]').should('contain', '"type": "integer"');
	});

	it('Should check & confirm the data fields from the redux store', () => {
		cy.window()
			.its('store')
			.invoke('getState')
			.its('$getAppMappings')
			.its(`rawMappings.${indexName}.properties.rating`)
			.then((obj) => {
				expect(obj).to.nested.include({ type: 'integer' });
			});
	});

	it('Should assign index name prior to deletion', () => {
		let credentials = btoa(`${username}:${password}`);

		cy.request({
			method: 'GET',
			url: `${app_url}_alias/${indexName}`,
			headers: {
				Authorization: `Basic ${credentials}`,
			},
		}).then((response) => {
			const data = response.body;
			console.log({ response, data });
			indexName = Object.keys(data)[0];
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
