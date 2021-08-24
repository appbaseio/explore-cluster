import generateName from '../utils/generateName';
import { base_url, username, password, app_url, cluster } from '../utils/index';

let indexName = '';

describe('Configure result settings without reindexing test flow', () => {
	before(() => {
		cy.window().then((win) => {
			win.sessionStorage.clear();
		});
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

	it('Should open result settings url', () => {
		cy.visit(`${base_url}/app/${indexName}/results`).wait(10000);
	});

	it('Should change the page size', () => {
		cy.get('[data-cy=result-page-size]').click().type('{uparrow}');
	});

	it('Should enable highlighting & set highlighting fields', () => {
		cy.get('[data-cy=enable-highlight]').click();
		cy.get('[data-cy=highlight-fields]').click().type('email{enter}name{enter}').wait(1000);
	});

	it('Should set the number of fragments', () => {
		cy.get('[data-cy=highlight-fragments]').click().type('{uparrow}').wait(1000);
	});

	it('Should check for local settings in test relevancy', () => {
		cy.get('[data-cy=test-search-relevancy-button]').click().wait(2000);
		cy.get('[data-cy=raw-request-button]').click({ force: true }).wait(2000);
		cy.window()
			.then((win) => {
				const editor = win.ace.edit('query-editor');
				const value = JSON.parse(editor.getValue());
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
		cy.get('[data-cy=review-save-button]').click().wait(5000);
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
		cy.get('[data-cy=logout-menu]').click().wait(1000).get('[data-cy=logout-button]').click();
	});

	after(() => {
		indexName = undefined;
	});
});
