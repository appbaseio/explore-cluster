import generateName from '../utils/generateName';
import { base_url, username, password, app_url, cluster } from '../utils/index';
import { PAGE_LOAD_TIME } from '../utils/constants.js';

let indexName = '',
	indexName2 = '';

describe('Clone settings test flow', () => {
	before(() => {
		cy.window().then((win) => {
			win.localStorage.clear();
			win.sessionStorage.clear();
		});
		indexName = generateName();
		indexName2 = indexName + '-2';
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
			.eq(8)
			.should('contain', '1.0')
			.get('[data-cy=search-field-rating]')
			.should('contain', 'rating')
			.get('[data-cy=new-weight]')
			.eq(14)
			.should('contain', '4.0');
		cy.server();
		cy.route('PUT', '**/_searchrelevancy/**').as('relevancy');
		cy.get('[data-cy=review-save-button]').click();
		cy.wait(['@relevancy'], { timeout: 25000 });
	});

	it('Should create a new index and clone the settings to it', () => {
		cy.server();
		cy.route('**/_mapping').as('mapping');
		cy.route('**/_searchrelevancy/**').as('relevancy');
		cy.route('**/_aliasedindices').as('indices');
		cy.visit(`${base_url}/app/${indexName}/search`);
		cy.wait(['@mapping', '@relevancy', '@indices'], { timeout: 25000 });

		cy.route('PUT', `**/_searchrelevancy/${indexName2}`).as('clone-relevancy');
		cy.root().contains('Copy Search Settings').click();
		cy.get('[data-cy=destination-index-name]')
			.type(indexName2)
			.get('[data-cy=copy-search-relevancy-settings]')
			.click()
			.get('[data-cy=copy-synonyms]')
			.click()
			.get('[data-cy=clone-button]')
			.click();
		cy.wait(['@clone-relevancy'], { timeout: 25000 });
	});

	it('Should verify the search settings of the new index', () => {
		cy.server();
		cy.route('**/_mapping').as('mapping');
		cy.route('**/_searchrelevancy/**').as('relevancy');
		cy.route('**/_aliasedindices').as('indices');
		cy.visit(`${base_url}/app/${indexName2}/search`);
		cy.wait(['@mapping', '@relevancy', '@indices'], { timeout: 25000 });

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

		cy.wait(5000);

		cy.request({
			method: 'DELETE',
			url: `${app_url}${indexName2}`,
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
		indexName2 = undefined;
	});
});
