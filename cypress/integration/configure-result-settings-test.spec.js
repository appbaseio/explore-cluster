import generateName from '../utils/generateName';
import { base_url, username, password, app_url, cluster } from '../utils/index';
import { PAGE_LOAD_TIME } from '../utils/constants.js';

let indexName = '';

describe('Configure result settings without reindexing test flow', () => {
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

	it('Should change result settings', () => {
		cy.server();
		cy.route('**/_mapping').as('mapping');
		cy.route('**/_searchrelevancy/**').as('relevancy');
		cy.route('**/_aliasedindices').as('indices');
		cy.visit(`${base_url}/app/${indexName}/results`);
		cy.wait(['@mapping', '@indices', '@relevancy'], { timeout: 30000 });

		// Should change page size
		cy.get('[data-cy=result-page-size]').click().type('{uparrow}');

		// Should change highlight settings
		cy.get('[data-cy=enable-highlight]').click();
		cy.get('[data-cy=highlight-fields]').click().type('email{enter}name{enter}').wait(1000);

		cy.get('[data-cy=highlight-fragments]').click().type('{uparrow}').wait(1000);

		cy.get('[data-cy=test-search-relevancy-button]').click().wait(2000);
		cy.get('[data-cy=raw-request-button]').click({ force: true }).wait(2000);
		cy.window()
			.then((win) => {
				const value = JSON.parse(win.monaco.editor.getModels()[0].getValue());
				const resultSettings = value.query[0];
				cy.expect(resultSettings.size).to.eql(11);
				cy.expect(resultSettings.highlightFields).to.includes.members(['email', 'name']);
				cy.expect(resultSettings).to.nested.include({
					'highlightOptions.number_of_fragments': 6,
				});
			})
			.get('.ant-modal-close-icon')
			.then((ele) => {
				const closeButton = ele[0];
				closeButton.click();
			});
	});

	it('Should review, save & deploy the new settings', () => {
		cy.get('[data-cy=review-deploy-button]').click().wait(5000);
		cy.get('[data-cy=old-value-size-status]')
			.should('contain', '10')
			.get(`[data-cy=new-value-size-status]`)
			.should('contain', '11')
			.get(`[data-cy=old-value-highlight-status]`)
			.should('contain', 'false')
			.get(`[data-cy=new-value-highlight-status]`)
			.should('contain', 'true')
			.get(`[data-cy=old-value-highlightFields-status]`)
			.should('contain', '')
			.get(`[data-cy=new-value-highlightFields-status]`)
			.should('contain', 'email, name')
			.get(`[data-cy=old-value-number_of_fragments-status]`)
			.should('contain', '5')
			.get(`[data-cy=new-value-number_of_fragments-status]`)
			.should('contain', '6');
		cy.server();
		cy.route('PUT', '**/_searchrelevancy/**').as('relevancy');
		cy.get('[data-cy=review-save-button]').click();
		cy.wait(['@relevancy'], { timeout: 30000 });
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
