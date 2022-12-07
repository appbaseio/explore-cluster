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
		cy.wait(PAGE_LOAD_TIME);
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

		cy.wait('@indexing').wait(5000);
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
		cy.server();
		cy.route('**/_searchrelevancy/**').as('relevancy');
		cy.visit(`${base_url}/app/${indexName}/languages`);
		cy.wait('@relevancy', { timeout: 25000 }).wait(5000);
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
		cy.server();
		cy.route('**/_mapping').as('mapping');
		cy.route('POST', '**/_reindex/**').as('reindex');
		cy.get('[data-cy=review-save-button]').click();
		cy.wait(['@mapping', '@reindex'], { timeout: 25000 });
	});

	it('Should check the new language analyzer in search settings', () => {
		cy.visit(`${base_url}/app/${indexName}/search`).wait(PAGE_LOAD_TIME);
		cy.get('[data-cy=email-popover-icon]').trigger('mouseover');
		cy.get('[data-cy=email-popover-content]').should('contain', '"analyzer": "universal"');
		cy.get('[data-cy=name-popover-icon]').trigger('mouseover', { force: true });
		cy.get('[data-cy=name-popover-content]').should('contain', '"analyzer": "universal"');
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
