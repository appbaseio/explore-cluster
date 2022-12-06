import generateName from '../utils/generateName';
import { base_url, username, password, app_url, cluster } from '../utils/index';
import { PAGE_LOAD_TIME } from '../utils/constants.js';

const indexName = 'clone-airbeds';

describe('Index Suggestion Settings add test flow', () => {
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
	});

	it('Should Index suggestion settings page URL', () => {
		cy.visit(`${base_url}/cluster/suggestions`);
		cy.wait(PAGE_LOAD_TIME);
		cy.get('.ant-tabs-nav .ant-tabs-tab:nth-child(3)').click();
	});

	it('Should Add Index Suggestions Settings Form Data', () => {
		cy.get(
			'[data-cy=index-suggestions-fields-container] > [data-cy=suggestions-footer] > [data-cy=buttons-container] > [style="display: flex;"] > [data-cy=reset-suggestions]',
		).click();
		cy.wait(2000);

		cy.get('[data-cy=index-suggestions-indices]').invoke('val', '');
		// In the index selector, type first few letters of the index so it shows up in the list
		cy.get('[data-cy=index-suggestions-indices]').click().type(indexName.substr(0, 3));
		cy.get(`[data-cy=${indexName}]`).click({ force: true, multiple: true });
		cy.get('[data-cy=index-suggestions-fields-container]').click({
			force: true,
			multiple: true,
		});
		cy.wait(3000);

		cy.get('[data-cy=show-distinct-suggestions]').click();
		cy.get('[data-cy=enable-predictive-suggestions]').click();
		cy.get('[data-cy=max-predicted-words]').clear().type(2);
		cy.get('[data-cy=apply-stopwords]').click();
		cy.get('[data-cy=custom-stopwords]').type('the,a,');
		cy.get('[data-cy=enable-synonyms]').click();
		cy.get('[data-cy=index-suggestions-size]').clear().type(3);

		// cy.get('[data-cy=include-fields]').click();
		// cy.get('[data-cy=bed_type]').click();
		// cy.get('[data-cy=include-fields-label]').click();

		// cy.get('[data-cy=exclude-fields]').click();
		// cy.get('[data-cy=bathrooms]').click({ force: true, multiple: true });
		// cy.get('[data-cy=exclude-fields-label]').click();

		// cy.get('[data-cy=category-field]').click();
		// cy.get('[data-cy=bathrooms]').click({ force: true, multiple: true });
		// cy.get('[data-cy=categoryField-label]').click();

		// cy.get('[data-cy=url-index-setting]').click();
		// cy.get('[data-cy=bathrooms]').click({ force: true, multiple: true });
		// cy.get('[data-cy=url-label]').click();

		cy.wait(1000);
		// save button
		cy.get(
			'[data-cy=index-suggestions-fields-container] > [data-cy=suggestions-footer] > [data-cy=buttons-container] > [style="display: flex;"] > :nth-child(2) > div > [data-cy=review-deploy-suggestion-settings]',
		).click();
		cy.get('[data-cy=review-save-button]').click();
		let credentials = btoa(`${username}:${password}`);

		cy.request({
			method: 'PUT',
			url: `${app_url}_index_suggestions/preferences`,
			headers: {
				Authorization: `Basic ${credentials}`,
				'Content-Type': 'application/json',
			},
			body: {
				applyStopwords: true,
				customStopwords: ['the', 'a'],
				maxPredictedWords: 2,
				customQuery: 'efe',
				includeFields: ['body_html', 'image'],
				categoryField: 'date_from',
				showDistinctSuggestions: true,
				enablePredictiveSuggestions: true,
				enableSynonyms: true,
				size: 3,
				indices: [indexName],
				exludeFields: [''],
			},
		});

		cy.get(
			'[data-cy=index-suggestions-fields-container] > [data-cy=suggestions-footer] > [data-cy=buttons-container] > [style="display: flex;"] > [data-cy=reset-suggestions]',
		).click();
	});
	it('Should logout user', () => {
		cy.clearLocalStorage();
		cy.logoutUser();
	});
});
