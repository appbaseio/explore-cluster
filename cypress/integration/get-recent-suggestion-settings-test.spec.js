import generateName from '../utils/generateName';
import { base_url, username, password, app_url, cluster } from '../utils/index';

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
		cy.visit(`${base_url}/cluster/suggestions`).wait(2000);
		cy.get('.ant-tabs-nav .ant-tabs-tab:nth-child(2)').click();
	});

	it('Should Get Recent Suggestions Settings Form Data', () => {
		let credentials = btoa(`${username}:${password}`);
		cy.request({
			method: 'GET',
			url: `${app_url}_recent_suggestions/preferences`,
			headers: {
				Authorization: `Basic ${credentials}`,
			},
		}).then((payload) => {
			cy.wait(2000);

			const recentSuggestions = {
				minHits: parseInt(payload.body.minHits, 10) || 0,
				size: parseInt(payload.body.size, 10) || 1,
				minChars: parseInt(payload.body.minChars, 10) || 0,
				indices: payload.indices || ['*'],
			};

			cy.get('[data-cy=recent-suggestions-min-hits]').should(
				'have.value',
				recentSuggestions.minHits,
			);
			cy.get('[data-cy=recent-suggestions-size]').should(
				'have.value',
				recentSuggestions.size,
			);
			cy.get('[data-cy=recent-suggestions-minChars]').should(
				'have.value',
				recentSuggestions.minChars,
			);

			cy.get('[data-cy=recent-suggestions-indices] > div > ul > li').each(($el, index) => {
				if (index < payload.body.indices?.length - 1) {
					expect($el).to.have.text(payload.body.indices[index]);
				}
			});
		});
	});
	it('Should logout user', () => {
		cy.clearLocalStorage();
		cy.logoutUser();
	});
});
