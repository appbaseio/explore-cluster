import generateName from '../utils/generateName';
import { base_url, username, password, app_url, cluster } from '../utils/index';
import { LONG_REQUEST_RESOLVE_TIME, PAGE_LOAD_TIME } from '../utils/constants.js';

let indexName = '';

describe('Reset to default settings test flow', () => {
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

	it('Should change search relevancy settings', () => {
		cy.server();
		cy.route('**/_mapping').as('mapping');
		cy.route('**/_searchrelevancy/**').as('relevancy');
		cy.route('**/_aliasedindices').as('indices');
		cy.visit(`${base_url}/app/${indexName}/search`);
		cy.wait(['@mapping', '@relevancy', '@indices'], { timeout: 30000 });

		// Wait to not enter a race condition
		cy.wait(2000);

		// Change search settings
		cy.get('[data-cy=email-number-input]').click().type('{uparrow}{uparrow}{uparrow}{uparrow}');
		cy.wait(2000);
		cy.get('[data-cy=name-number-input]').click();
		cy.wait(2000);
		cy.get('[data-cy=rating-number-input]')
			.click()
			.type('{uparrow}{uparrow}{uparrow}{uparrow}{uparrow}{uparrow}')
			.wait(2000);

		// Visit aggregation settings
		cy.server();
		cy.route('**/_searchrelevancy/**').as('relevancy-aggs');
		cy.get('[data-cy=path-sub-AggregationSettings]').click();
		cy.wait('@relevancy-aggs', { timeout: 30000 });

		// Change aggregation settings
		cy.get('[data-cy=query-format-and-radio]').click().wait(1000);

		// Visit result settings
		cy.server();
		cy.route('**/_searchrelevancy/**').as('relevancy-results');
		cy.get('[data-cy=path-sub-ResultSettings]').click();
		cy.wait('@relevancy-results', { timeout: 30000 });
		// Change result settings
		cy.get('[data-cy=result-page-size]').click().type('{uparrow}');

		// Save settings
		cy.get('[data-cy=review-deploy-button]').click().wait(5000);
		cy.server();
		cy.route('PUT', '**/_searchrelevancy/**').as('relevancy-save');
		cy.get('[data-cy=review-save-button]').click();
		cy.wait(['@relevancy-save'], { timeout: 30000 });
	});

	it('Should reset to the default settings', () => {
		cy.server();
		cy.route('**/_mapping').as('mapping');
		cy.route('**/_searchrelevancy/**').as('relevancy');
		cy.route('**/_aliasedindices').as('indices');
		cy.visit(`${base_url}/app/${indexName}/results`);
		cy.wait(['@mapping', '@indices', '@relevancy'], { timeout: 30000 });

		cy.get('[data-cy=reset-default-button]').click().wait(5000);
		cy.get('[data-cy=search-field-email]')
			.should('contain', 'email')
			.get('[data-cy=search-field-email-status]')
			.should('contain', 'removed')
			.get('[data-cy=new-weight]')
			.eq(0)
			.should('contain', 'N/A')

			.get('[data-cy=search-field-name]')
			.should('contain', 'name')
			.get('[data-cy=search-field-name-status]')
			.should('contain', 'removed')
			.get('[data-cy=new-weight]')
			.eq(7)
			.should('contain', 'N/A')

			.get('[data-cy=search-field-rating]')
			.should('contain', 'rating')
			.get('[data-cy=search-field-rating-status]')
			.should('contain', 'removed')
			.get('[data-cy=new-weight]')
			.eq(14)
			.should('contain', 'N/A')

			.get('[data-cy=old-value-queryFormat-status]')
			.should('contain', 'and')
			.get('[data-cy=new-value-queryFormat-status]')
			.should('contain', 'or')

			.get('[data-cy=old-value-size-status]')
			.should('contain', '11')
			.get('[data-cy=new-value-size-status]')
			.should('contain', '10');

		// .get('[data-cy=old-value-language-status]')
		// .should('contain', 'english')
		// .get('[data-cy=new-value-language-status]')
		// .should('contain', 'universal');

		cy.server();
		cy.route('PUT', '**/_searchrelevancy/**').as('relevancy-save');
		cy.get('[data-cy=review-save-button]').click();
		cy.wait(['@relevancy-save'], { timeout: 30000 });
	});

	it('Should check the deployed default settings', () => {
		cy.server();
		// Result settings
		cy.route('**/_mapping').as('results-mapping');
		cy.route('**/_searchrelevancy/**').as('results-relevancy');
		cy.route('**/_aliasedindices').as('results-indices');
		cy.visit(`${base_url}/app/${indexName}/results`);
		cy.wait(['@results-mapping', '@results-indices', '@results-relevancy'], { timeout: 30000 });
		cy.get('[data-cy=result-page-size]').should('have.value', '10');

		// Aggregation settings
		cy.route('**/_searchrelevancy/**').as('relevancy-aggs');
		cy.get('[data-cy=path-sub-AggregationSettings]').click();
		cy.wait('@relevancy-aggs', { timeout: 30000 });
		cy.get('[data-cy=query-format-or-radio]').should('be.checked');

		// Search settings
		cy.route('**/_searchrelevancy/**').as('relevancy-search');
		cy.get('[data-cy=path-sub-SearchSettings]').click();
		cy.wait('@relevancy-search', { timeout: 30000 });
		cy.get('[data-cy=search-empty-field]').should('contain', 'No Search Fields Are Present');

		// Language settings
		cy.route('**/_searchrelevancy/**').as('relevancy-lang');
		cy.get('[data-cy=path-sub-LanguageSettings]').click();
		cy.wait('@relevancy-lang', { timeout: 30000 });
		cy.get('[data-cy=language-value]').should('contain', 'Universal');
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

	it('Should wait for banner to clear', () => {
		cy.wait(5000);
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
