import generateName from '../utils/generateName';
import { base_url, username, password, app_url, cluster } from '../utils/index';
import { PAGE_LOAD_TIME } from './contants';

let indexName = '';

describe('Test relevancy use local settings test flow', () => {
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
		cy.wait(PAGE_LOAD_TIME);
	});

	it('Should create new index', () => {
		cy.get('[data-cy=initialize-new-index-creation]').click().wait(2000);
		generateName();
		cy.get('[data-cy=new-index-name]')
			.type(`${indexName}`)
			.get('[data-cy=new-index-language]')
			.click()
			.type('English{enter}')
			.wait(1000)
			.get('[data-cy=create-new-index]')
			.click();
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

	it('Should open search settings URL', () => {
		cy.visit(`${base_url}/app/${indexName}/search`).wait(5000);
	});

	it('Should remove one field from search settings', () => {
		cy.get('[data-cy=remove-field-rating]').click({ force: true }).wait(1000);
	});

	it('Should open aggregation settings', () => {
		cy.get('[data-cy=path-sub-AggregationSettings]').click().wait(5000);
	});

	it('Should change query format to and', () => {
		cy.get('[data-cy=query-format-and-radio]').click().wait(1000);
	});

	it('Should open result settings', () => {
		cy.get('[data-cy=path-sub-ResultSettings]').click().wait(5000);
	});

	it('Should change the page size', () => {
		cy.get('[data-cy=result-page-size]').click().type('{uparrow}');
	});

	it('Should check for local settings in test relevancy', () => {
		cy.get('[data-cy=test-search-relevancy-button]').click().wait(5000);
		cy.get('[data-cy=raw-request-button]').click({ force: true }).wait(5000);

		cy.window()
			.then((win) => {
				const value = JSON.parse(win.monaco.editor.getModels()[0].getValue());
				cy.log(JSON.stringify(value));
				const resultSettings = value.query[0];
				const searchQuery = value.query[1];
				cy.expect(resultSettings.size).to.eql(11);
				cy.expect(searchQuery.queryFormat).to.eql('or');
				cy.expect(searchQuery.dataField).to.not.include.members(['rating']);
			})
			.get('.ant-modal-close-icon')
			.then((ele) => {
				const closeButton = ele[0];
				closeButton.click();
			});
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
