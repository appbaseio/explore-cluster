import generateName from '../utils/generateName';
import { base_url, username, password, app_url, cluster } from '../utils/index';
import { PAGE_LOAD_TIME } from '../utils/constants.js';

let indexName = '';

describe('Diff change table test flow', () => {
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

	it('Should open search settings URL', () => {
		cy.server();
		cy.route('**/_mapping').as('mapping');
		cy.route('**/_searchrelevancy/**').as('relevancy');
		cy.route('**/_aliasedindices').as('indices');
		cy.visit(`${base_url}/app/${indexName}/search`);
		cy.wait(['@mapping', '@relevancy', '@indices'], { timeout: 25000 });
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

	it('Should change query type to search operators', () => {
		cy.get('[data-cy=search-operators-radio-button]').click().wait(1000);
		cy.get('[data-cy=search-operators-radio-button]').click().wait(1000);
	});

	it('Should change query format to and', () => {
		cy.get('[data-cy=query-format-and-radio]').click().wait(1000);
	});

	it('Should enable typo tolerance', () => {
		cy.get('[data-cy=typo-tolerance-switch]').click().wait(1000);
	});

	it('Should open aggregation settings', () => {
		cy.get('[data-cy=path-sub-AggregationSettings]').click().wait(5000);
	});

	it('Should change query format to and', () => {
		cy.get('[data-cy=query-format-and-radio]').click().wait(1000);
	});

	it('Should open result settings', () => {
		cy.get('[data-cy=path-sub-ResultSettings]').click().wait(5000);
	});

	it('Should change the page size', () => {
		cy.get('[data-cy=result-page-size]').click().type('{uparrow}');
	});

	it('Should check for all the changed settings & their persistence', () => {
		cy.get('[data-cy=review-deploy-button]').click().wait(2000);
		cy.get('[data-cy=search-field-email]')
			.should('contain', 'email')
			.get('[data-cy=new-weight]')
			.eq(0)
			.should('contain', '3.0')
			.get('[data-cy=search-field-name]')
			.should('contain', 'name')
			.get('[data-cy=new-weight]')
			.eq(8)
			.should('contain', '1.0')
			.get('[data-cy=search-field-rating]')
			.should('contain', 'rating')
			.get('[data-cy=new-weight]')
			.eq(14)
			.should('contain', '4.0')
			.get('[data-cy=old-value-searchOperators-status]')
			.should('contain', 'false')
			.get('[data-cy=new-value-searchOperators-status]')
			.should('contain', 'true')
			.get('[data-cy=old-value-fuzziness-status]')
			.should('contain', '0')
			.get('[data-cy=new-value-fuzziness-status]')
			.should('contain', 'AUTO')
			.get('[data-cy=old-value-queryFormat-status]')
			.should('contain', 'or')
			.get('[data-cy=new-value-queryFormat-status]')
			.should('contain', 'and')
			.get('[data-cy=old-value-size-status]')
			.should('contain', '10')
			.get('[data-cy=new-value-size-status]')
			.should('contain', '11');

		cy.get('[data-cy=cancel-modal-button]').click();
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
