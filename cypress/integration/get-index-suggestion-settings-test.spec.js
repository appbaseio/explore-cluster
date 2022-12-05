import generateName from '../utils/generateName';
import { base_url, username, password, app_url, cluster } from '../utils/index';
import { PAGE_LOAD_TIME } from './contants';

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
		cy.wait(3000);
	});

	it('Should Index suggestion settings page URL', () => {
		cy.visit(`${base_url}/cluster/suggestions`).wait(PAGE_LOAD_TIME);
		cy.get('.ant-tabs-nav .ant-tabs-tab:nth-child(3)').click();
	});

	it('Should Get Index Suggestions Settings Form Data', () => {
		let credentials = btoa(`${username}:${password}`);
		cy.request({
			method: 'GET',
			url: `${app_url}_index_suggestions/preferences`,
			headers: {
				Authorization: `Basic ${credentials}`,
			},
		}).then((payload) => {
			cy.wait(3000);
			const indexSuggestions = {
				showDistinctSuggestions: payload.body.showDistinctSuggestions || false,
				enablePredictiveSuggestions: payload.body.enablePredictiveSuggestions || false,
				maxPredictedWords: parseInt(payload.body.maxPredictedWords, 10) || 1,
				applyStopwords: payload.body.applyStopwords || false,
				customStopwords: payload.body.customStopwords || [],
				enableSynonyms: payload.body.enableSynonyms || false,
				size: parseInt(payload.body.size, 10) || 3,
				indices: payload.body.indices || ['*'],
				categoryField: payload.body.categoryField || '',
				urlField: payload.body.urlField || '',
			};

			cy.get('[data-cy=index-suggestions-indices]').click();
			cy.get('.ant-select-dropdown .ant-select-item').each(($el, index) => {
				if (index < payload.body.indices?.length - 1) {
					cy.wrap($el).contains(payload.body.indices[index]);
				}
			});
			cy.get('[data-cy=index-suggestions-indices]').blur();

			cy.get('[data-cy=show-distinct-suggestions]').should(
				'have.value',
				JSON.stringify(indexSuggestions.showDistinctSuggestions),
			);
			cy.get('[data-cy=enable-predictive-suggestions]').should(
				'have.value',
				JSON.stringify(indexSuggestions.enablePredictiveSuggestions),
			);
			cy.get('[data-cy=max-predicted-words]').should(
				'have.value',
				indexSuggestions.maxPredictedWords,
			);
			cy.get('[data-cy=apply-stopwords]').should(
				'have.value',
				JSON.stringify(indexSuggestions.applyStopwords),
			);

			cy.get('[data-cy=custom-stopwords]').click();
			cy.get('.ant-select-dropdown .ant-select-item').each(($el, index) => {
				if (index < payload.body.indices?.length - 1) {
					cy($el).wrap(indexSuggestions.customStopwords[index]);
				}
			});
			cy.get('[data-cy=custom-stopwords]').blur();

			cy.get('[data-cy=enable-synonyms]').should(
				'have.value',
				JSON.stringify(indexSuggestions.enableSynonyms),
			);
			cy.get('[data-cy=index-suggestions-size]').should('have.value', indexSuggestions.size);

			// cy.get('[data-cy=include-fields] > div > ul > li').each(($el, index) => {
			// 	if (index < payload.body.indices?.length - 1) {
			// 		expect($el).to.have.text(payload.body.includeFields[index]);
			// 	}
			// });

			// cy.get('[data-cy=exclude-fields] > div > ul > li').each(($el, index) => {
			// 	if (index < payload.body.indices?.length - 1) {
			// 		expect($el).to.have.text(payload.body.excludeFields[index]);
			// 	}
			// });

			// cy.get(
			// 	'[data-cy=category-field] > div > div.ant-select-selection-selected-value',
			// ).should('have.text', indexSuggestions.categoryField);
			// cy.get(
			// 	'[data-cy=url-index-setting] > div > div.ant-select-selection-selected-value',
			// ).should('have.text', indexSuggestions.urlField);
		});
	});
	it('Should logout user', () => {
		cy.clearLocalStorage();
		cy.logoutUser();
	});
});
