import generateName from '../utils/generateName';
import { base_url, username, password, app_url, cluster } from '../utils/index';

let indexName = '';

describe('New index test flow', () => {
	before(() => {
		indexName = generateName();
	});

	it('Should open arc dashboard locally', () => {
		cy.visit(`${base_url}`).wait(2000);
	});

	it('Should login from cluster URL', () => {
		cy.get('[data-cy=cluster-url]')
			.clear()
			.type(`https://${username}:${password}@${cluster}`)
			.wait(1000)
			.blur()
			.wait(1000);
		cy.get('[data-cy=signin-button]').click();
	});

	it('Should create new index', () => {
		cy.wait(5000).get('[data-cy=initialize-new-index-creation]').click().wait(2000);
		generateName();
		cy.get('[data-cy=new-index-name]')
			.type(`${indexName}`)
			.get('[data-cy=new-index-language]')
			.click()
			.type('English{enter}')
			.wait(1000)
			.get('[data-cy=create-new-index]')
			.click()
			.wait(5000);
	});

	it('Should open language settings URL', () => {
		cy.visit(`${base_url}/app/${indexName}/languages`).wait(5000);
	});

	it('Should check selected language', () => {
		cy.get('[data-cy=language-value]')
			.children()
			.get('.ant-select-selection-selected-value')
			.then(($div) => {
				expect($div).to.contain('English');
			});
	});

	it('Should delete index', () => {
		cy.visit(`${base_url}/`)
			.wait(1000)
			.get(`[data-cy=delete-app-${indexName}]`)
			.click({ multiple: true, force: true })
			.wait(1000)
			.get(`[data-cy=delete-index-name]`)
			.click()
			.type(`${indexName}`)
			.wait(1000)
			.get(`[data-cy=delete-index-${indexName}]`)
			.click();
	});

	it('Should logout user', () => {
		cy.get('[data-cy=logout-menu]').click().wait(1000).get('[data-cy=logout-button]').click();
	});

	after(() => {
		indexName = undefined;
	});
});
