import generateName from '../utils/generateName';
import { base_url, username, password, app_url, cluster } from '../utils/index';

let indexName = '';

describe('Change normalize diacritics test flow', () => {
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
		cy.loginUser(username, password, cluster);
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
			},
		});
	});

	it('Should open language settings URL', () => {
		cy.visit(`${base_url}/app/${indexName}/languages`).wait(5000);
	});

	it('Should disable Normalize Diacritics', () => {
		cy.get('[data-cy=normalize-diacritics-switch]').click().wait(1000);
	});

	it('Should review, save & deploy the changed settings', () => {
		cy.get('[data-cy=review-deploy-button]').click().wait(5000);
		cy.get('[data-cy=old-value-normalizeDiacritics-status]')
			.should('contain', 'true')
			.get('[data-cy=new-value-normalizeDiacritics-status]')
			.should('contain', 'false');
		cy.get('[data-cy=review-save-button]').click().wait(5000);
	});

	it('Should fetch setting from the app url & check for asciifolding to be not present in filters', () => {
		cy.request(`https://${username}:${password}@${cluster}/${indexName}/_settings`)
			.as('settings')
			.wait(5000);
		cy.get('@settings').should((response) => {
			expect(
				response.body[indexName].settings.index.analysis.analyzer.autosuggest_analyzer
					.filter,
			).to.not.include('asciifolding');
			expect(
				response.body[indexName].settings.index.analysis.analyzer.english.filter,
			).to.not.include('asciifolding');
			expect(
				response.body[indexName].settings.index.analysis.analyzer.ngram_analyzer.filter,
			).to.not.include('asciifolding');
			expect(
				response.body[indexName].settings.index.analysis.analyzer.ngram_search_analyzer
					.filter,
			).to.not.include('asciifolding');
			expect(
				response.body[indexName].settings.index.analysis.analyzer.synonyms.filter,
			).to.not.include('asciifolding');
			expect(
				response.body[indexName].settings.index.analysis.analyzer.universal.filter,
			).to.not.include('asciifolding');
			expect(
				response.body[indexName].settings.index.analysis.analyzer
					.universal_delimiter_analyzer.filter,
			).to.not.include('asciifolding');
		});
	});

	it('Should check the state for normalizeDiacritics is false from the redux store', () => {
		cy.window()
			.its('store')
			.invoke('getState')
			.its('$getAppSettings')
			.its('settings')
			.its(`${indexName}`)
			.its('language')
			.its('normalizeDiacritics')
			.should('eq', false);
	});

	it('Should enable Normalize Diacritics', () => {
		cy.get('[data-cy=normalize-diacritics-switch]').click().wait(1000);
	});

	it('Should review, save & deploy the changed settings', () => {
		cy.get('[data-cy=review-deploy-button]').click().wait(5000);
		cy.get('[data-cy=old-value-normalizeDiacritics-status]')
			.should('contain', 'false')
			.get('[data-cy=new-value-normalizeDiacritics-status]')
			.should('contain', 'true');
		cy.get('[data-cy=review-save-button]').click().wait(5000);
	});

	it('Should check the state for normalizeDiacritics is true from the redux store', () => {
		cy.window()
			.its('store')
			.invoke('getState')
			.its('$getAppSettings')
			.its('settings')
			.its(`${indexName}`)
			.its('language')
			.its('normalizeDiacritics')
			.should('eq', true);
	});

	it('Should fetch setting from the app url & check for asciifolding to be present in filters', () => {
		cy.request(`https://${username}:${password}@${cluster}/${indexName}/_settings`)
			.as('settings')
			.wait(5000);
		cy.get('@settings').should((response) => {
			expect(
				response.body[indexName].settings.index.analysis.analyzer.autosuggest_analyzer
					.filter,
			).to.include('asciifolding');
			expect(
				response.body[indexName].settings.index.analysis.analyzer.english.filter,
			).to.include('asciifolding');
			expect(
				response.body[indexName].settings.index.analysis.analyzer.ngram_analyzer.filter,
			).to.include('asciifolding');
			expect(
				response.body[indexName].settings.index.analysis.analyzer.ngram_search_analyzer
					.filter,
			).to.include('asciifolding');
			expect(
				response.body[indexName].settings.index.analysis.analyzer.synonyms.filter,
			).to.include('asciifolding');
			expect(
				response.body[indexName].settings.index.analysis.analyzer.universal.filter,
			).to.include('asciifolding');
			expect(
				response.body[indexName].settings.index.analysis.analyzer
					.universal_delimiter_analyzer.filter,
			).to.include('asciifolding');
		});
	});

	it('Should detect reinderxing and assign indexname prior deletion', () => {
		let credentials = btoa(`${username}:${password}`);

		fetch(`${app_url}_alias/${indexName}`, {
			headers: {
				Authorization: `Basic ${credentials}`,
			},
		})
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				indexName = Object.keys(data)[0];
			})
			.catch((err) => {
				console.log(err);
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
		cy.logoutUser();
	});

	after(() => {
		indexName = undefined;
	});
});
