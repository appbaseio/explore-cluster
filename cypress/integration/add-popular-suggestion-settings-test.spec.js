import generateName from '../utils/generateName';
import { base_url, username, password, app_url, cluster } from '../utils/index';

const indexName = 'clone-airbeds';

describe('Popular Suggestion Settings add test flow', () => {
	before(() => {
		cy.window().then((win) => {
			win.localStorage.clear();
			win.sessionStorage.clear();
		});
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
		cy.wait(3000);
	});

	it('Should Popular suggestion settings page URL', () => {
		cy.visit(`${base_url}/cluster/suggestions`).wait(2000);
		cy.get('.ant-tabs-nav .ant-tabs-tab:nth-child(1)').click();
	});

	it('Should Add Popular Suggestions Settings Form Data', () => {
		cy.get('[data-cy=reset-suggestions]').click();

		cy.get('[data-cy=number-of-days]').clear().type(2);
		cy.get('[data-cy=min-count]').clear().type(2);
		cy.get('[data-cy=popular-suggestions-min-hits]').clear().type(2);
		cy.get('[data-cy=min-characters]').clear().type(2);
		cy.get('[data-cy=transform-diacritics]').check();
		cy.get('[data-cy=blacklist]').type('black');
		cy.get('[data-cy=popular-suggestions-size]').clear().type(2);

		// save button
		cy.get('[data-cy=review-deploy-suggestion-settings]').click();
		cy.get('[data-cy=review-save-button]').click();
		const url = 'http://localhost:8000';
		let credentials = btoa(`${username}:${password}`);

		cy.request({
			method: 'PUT',
			url: `${app_url}_popular_suggestions/preferences`,
			headers: {
				Authorization: `Basic ${credentials}`,
				'Content-Type': 'application/json',
			},
			body: {
				blacklist: ['movie'],
				externalSuggestions: [],
				minCount: 2,
				minHits: 2,
				numberOfDays: 2,
				minCharacters: 2,
				size: 2,
				transformDiacritics: true,
				indices: [indexName],
			},
		});
	});
	it('Should logout user', () => {
		cy.clearLocalStorage();
		cy.logoutUser();
	});
});
