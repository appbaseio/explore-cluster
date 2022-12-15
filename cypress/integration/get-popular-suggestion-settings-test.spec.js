import generateName from '../utils/generateName';
import { base_url, username, password, app_url, cluster } from '../utils/index';

describe('Popular Suggestion Settings add test flow', () => {
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

	it('Should Popular suggestion settings page URL', () => {
		cy.server();
		cy.route('**/preferences').as('preferences');
		cy.visit(`${base_url}/cluster/suggestions`);
		cy.wait('@preferences', { timeout: 30000 });
		cy.get('.ant-tabs-nav .ant-tabs-tab:nth-child(1)').click();
	});

	it('Should Get Popular Suggestions Settings Form Data', () => {
		let credentials = btoa(`${username}:${password}`);
		cy.request({
			method: 'GET',
			url: `${app_url}_popular_suggestions/preferences`,
			headers: {
				Authorization: `Basic ${credentials}`,
			},
		}).then((payload) => {
			cy.wait(2000);

			const popularSuggestions = {
				blacklist: payload.body.blacklist || [],
				externalSuggestions: payload.body.externalSuggestions || [],
				minCount: parseInt(payload.body.minCount, 10),
				minHits: parseInt(payload.body.minHits, 10),
				numberOfDays: payload.body.numberOfDays || 30,
				minChars: parseInt(payload.body.minChars, 10),
				size: parseInt(payload.body.size, 10),
				indices: payload.body.indices || ['*'],
				transformDiacritics: payload.body.transformDiacritics,
			};
			if (popularSuggestions.indices.length) {
				cy.get('[data-cy=popular-suggestions-indices] .ant-select-selection-item').each(
					($el, index) => {
						if (index < payload.body.indices?.length - 1) {
							cy.wrap($el).contains(payload.body.indices[index]);
						}
					},
				);
			}

			cy.get('[data-cy=number-of-days]').should(
				'have.value',
				popularSuggestions.numberOfDays,
			);
			cy.get('[data-cy=min-count]').should('have.value', popularSuggestions.minCount);
			cy.get('[data-cy=popular-suggestions-min-hits]').should(
				'have.value',
				popularSuggestions.minHits,
			);
			cy.get('[data-cy=min-characters]').should('have.value', popularSuggestions.minChars);
			cy.get('[data-cy=transform-diacritics]').should(
				'have.value',
				JSON.stringify(popularSuggestions.transformDiacritics),
			);
			cy.get('[data-cy=popular-suggestions-size]').should(
				'have.value',
				popularSuggestions.size,
			);
			if (popularSuggestions.blacklist.length) {
				cy.get('[data-cy=blacklist] .ant-select-selection-item').each(($el, i) => {
					if (i < popularSuggestions.blacklist?.length - 1) {
						cy.wrap($el).contains(popularSuggestions.blacklist[i]);
					}
				});
			}
		});
	});
	it('Should logout user', () => {
		cy.clearLocalStorage();
		cy.logoutUser();
	});
});
