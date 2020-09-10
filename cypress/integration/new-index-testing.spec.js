let {
	DEV: { base_url, username, password, app_url },
} = Cypress.env('arc-dashboard');
let TEST_URL = `${base_url}/?url=${app_url}&username=${username}&password=${password}&cluster=appbase-demo-ansible&showHelpChat=false&showProfile=false`;
let appName = '';
describe('New index test flow', () => {
	before(() => {
		appName = `test-cypress-index-${Math.random(new Date().getTime())
			.toString(36)
			.substring(5)}`;
	});
	it('Should create a new Index', () => {
		cy.visit(TEST_URL, { timeout: 100000 })
			.wait(10000)
			.get('[data-cy=initialize-new-index-creation]')
			.click()
			.get('[data-cy=new-index-name]')
			.type(`${appName}`)
			.get('[data-cy=create-new-index]')
			.click()
			.wait(5000)
			.url()
			.should('include', `/app/${appName}`);
	});
	it('Should import sample data', () => {
		cy.visit(`${base_url}/app/${appName}/import?url=${app_url}&username=${username}&password=${password}&cluster=appbase-demo-ansible&showHelpChat=false&showProfile=false`, { timeout: 100000 })
			.wait(10000)
			.contains('Load Sample Data')
			.click()
			.get('input[name="index"]')
			.type(`-${Math.random(new Date().getTime()).toString(36).substring(2)}`)
			.root()
			.contains('Start Import')
			.click()
			.root()
			.contains('Start Import')
			.parent()
			.wait(70000)
			.contains('Start Import', { timeout: 100000 })
			.parent()
			.get('button')
			.should('be.disabled');
	});
	it('Should update Search settings', () => {
		cy.visit(`${base_url}/app/${appName}/search`, { timeout: 10000 })
			.get('[data-cy=toggle-synonyms]')
			.click()
			.get('[data-cy=toggle-ngram]')
			.click()
			.get('[data-cy=initiate-search-setting-change-request]')
			.click()
			.get('[data-cy=review-and-save]')
			.click();
	});
	it('Should update Aggregation settings', () => {
		cy.visit(`${base_url}/app/${appName}/aggs`, { timeout: 4000 })
			.get('[data-cy=default-aggregation-size')
			.clear()
			.type(`${Math.floor(Math.random() * 90 + 10)}`)
			.get('[data-cy=include-null-values]')
			.click()
			.get('[data-cy=initiate-search-setting-change-request]')
			.click()
			.get('[data-cy=review-and-save]')
			.click()
			.then(() => {
				cy.get('[data-cy=initiate-search-setting-change-request]').should('be.disabled');
			})
			.wait(2000)
			.get('[data-cy=reset-to-default')
			.should('be.enabled');
	});
	it('Should update Result settings', () => {
		cy.visit(`${base_url}/app/${appName}/results`, { timeout: 4000 })
			.wait(5000)
			.get('[data-cy=result-page-size]')
			.clear()
			.type(`${Math.random(5).toPrecision(2) * 100}`)
			.blur()
			.get('[data-cy=include-fields]')
			.type('{enter}')
			.trigger('input')
			.root()
			.click()
			.get('[data-cy=exclude-fields]')
			.type('{enter}')
			.trigger('input')
			.root()
			.click()
			.root()
			.get('[data-cy=initiate-search-setting-change-request]')
			.click()
			.root()
			.get('[data-cy=review-and-save]')
			.click()
			.wait(2000)
			.get('[data-cy=reset-to-default')
			.should('be.enabled');
	});
	it('Should add synonyms', () => {
		const synonym1 = `sample${Math.random(new Date().getTime()).toString(36).substring(5)}`;
		const synonym2 = `general${Math.random(new Date().getTime()).toString(36).substring(5)}`;
		cy.visit(`${base_url}/app/${appName}/synonyms`, { timeout: 4000 })
			.wait(5000)
			.get('[data-cy=add-synonyms')
			.click()
			.get('[data-cy=synonyms-input]')
			.parent()
			.trigger('mousedown')
			.type(`${synonym1},${synonym2},`)
			.get('[data-cy=confirm-synonyms]')
			.click()
			.wait(5000)
			.root()
			.contains(synonym1)
			.wait(5000)
			.root()
			.contains('Test Search Relevancy')
			.click();
	});
	after(() => {
		base_url = undefined;
		app_url = undefined;
		username = undefined;
		password = undefined;
		TEST_URL = undefined;
		appName = undefined;
	});
});
