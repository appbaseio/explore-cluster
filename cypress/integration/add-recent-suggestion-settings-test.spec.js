import generateName from '../utils/generateName';
import { base_url, username, password, app_url, cluster } from '../utils/index';
import { PAGE_LOAD_TIME, REQUEST_RESOLVE_TIME } from '../utils/constants.js';

const indexName = 'clone-airbeds';

describe('Recent Suggestion Settings add test flow', () => {
	before(() => {
		cy.window().then((win) => {
			win.localStorage.clear();
			win.sessionStorage.clear();
		});
		// indexName = generateName();
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

	it('Should Recent suggestion settings page URL', () => {
		cy.visit(`${base_url}/cluster/suggestions`).wait(PAGE_LOAD_TIME);
		cy.get('.ant-tabs-nav .ant-tabs-tab:nth-child(2)').click();
	});

	it('Should Add Recent Suggestions Settings Form Data', () => {
		cy.get(
			'[data-cy=recent-suggestions-fields-container] > [data-cy=suggestions-footer] > [data-cy=buttons-container] > [style="display: flex;"] > [data-cy=reset-suggestions]',
		).click();

		cy.get('[data-cy=recent-suggestions-min-hits]').clear().type(10);
		cy.get('[data-cy=recent-suggestions-size]').clear().type(10);
		cy.get('[data-cy=recent-suggestions-minChars]').clear().type(10);

		cy.get('[data-cy=recent-suggestions-indices]').invoke('val', '');
		cy.get('[data-cy=recent-suggestions-indices]').click().type(indexName.substr(0, 3));
		cy.get(`[data-cy=${indexName}]`).click();
		cy.get('[data-cy=recent-suggestions-indices-label]').click();

		// save button
		cy.get(
			'[data-cy=recent-suggestions-fields-container] > [data-cy=suggestions-footer] > [data-cy=buttons-container] > [style="display: flex;"] > :nth-child(2) > div > [data-cy=review-deploy-suggestion-settings]',
		).click();
		cy.get('[data-cy=review-save-button]').click();
		let credentials = btoa(`${username}:${password}`);

		cy.wait(2500);
		cy.request({
			method: 'PUT',
			url: `${app_url}_recent_suggestions/preferences`,
			headers: {
				Authorization: `Basic ${credentials}`,
				'Content-Type': 'application/json',
			},
			body: {
				minHits: 1,
				size: 3,
				indices: [indexName],
			},
		});
		cy.wait(REQUEST_RESOLVE_TIME);
	});
	it('Should logout user', () => {
		cy.clearLocalStorage();
		cy.logoutUser();
	});
});
