import generateName from '../utils/generateName';
import { base_url, username, password, app_url, cluster } from '../utils/index';
import { PAGE_LOAD_TIME } from '../utils/constants.js';

let indexName = '';

describe('Disable ngram remove search fields and reindex data test flow', () => {
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

	it('Should open search settings URL', () => {
		cy.server();
		cy.route('**/_mapping').as('mapping');
		cy.route('**/_searchrelevancy/**').as('relevancy');
		cy.route('**/_aliasedindices').as('indices');
		cy.visit(`${base_url}/app/${indexName}/search`);
		cy.wait(['@mapping', '@relevancy', '@indices'], { timeout: 25000 });
	});

	it('Should add all data feilds as search feilds', () => {
		cy.get('[data-cy=review-deploy-button]').click({ force: true }).wait(5000);
	});

	it('Should review, save & deploy search settings', () => {
		cy.get('[data-cy=search-field-email]')
			.should('contain', 'email')
			.get('[data-cy=search-field-email-status]')
			.should('contain', 'new')
			.get('[data-cy=search-field-name]')
			.should('contain', 'name')
			.get('[data-cy=search-field-name-status]')
			.should('contain', 'new');
		cy.server();
		cy.route('PUT', '**/_searchrelevancy/**').as('relevancy');
		cy.get('[data-cy=review-save-button]').click();
		cy.wait(['@relevancy'], { timeout: 25000 });
	});

	it('Should check search fields after deployment', () => {
		cy.server();
		cy.route('**/_mapping').as('mapping');
		cy.route('**/_searchrelevancy/**').as('relevancy');
		cy.route('**/_aliasedindices').as('indices');
		cy.visit(`${base_url}/app/${indexName}/search`);
		cy.wait(['@mapping', '@relevancy', '@indices'], { timeout: 25000 });

		cy.get('[data-cy=field-name-email]')
			.should('contain', 'email')
			.get('[data-cy=field-name-name]')
			.should('contain', 'name');
	});

	it('Should disable ngram from search settings', () => {
		cy.get('[data-cy=ngram-switch]').click().wait(2000);
	});

	it('Should review, save and deploy the new settings', () => {
		cy.get('[data-cy=review-deploy-button]').click().wait(5000);
		cy.get('[data-cy=old-value-enableNgram-status]')
			.should('contain', 'true')
			.get('[data-cy=new-value-enableNgram-status]')
			.should('contain', 'false');
		cy.server();
		cy.route('PUT', '**/_searchrelevancy/**').as('relevancy');
		cy.get('[data-cy=review-save-button]').click();
		cy.wait(['@relevancy'], { timeout: 25000 });
	});

	it('Should check if .search fields are removed', () => {
		cy.server();
		cy.route('**/_mapping').as('mapping');
		cy.route('**/_searchrelevancy/**').as('relevancy');
		cy.route('**/_aliasedindices').as('indices');
		cy.visit(`${base_url}/app/${indexName}/search`);
		cy.wait(['@mapping', '@relevancy', '@indices'], { timeout: 25000 });

		cy.get('[data-cy=email-popover-icon]')
			.trigger('mouseover')
			.get('[data-cy=email-popover-content]')
			.should('not.contain', 'search')
			.wait(1000);
		cy.get('[data-cy=name-popover-icon]')
			.trigger('mouseover', { force: true })
			.get('[data-cy=name-popover-content]')
			.should('not.contain', 'search')
			.wait(1000);
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
