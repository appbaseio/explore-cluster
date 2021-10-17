import generateName from '../utils/generateName';
import { base_url, username, password, app_url, cluster } from '../utils/index';

let indexName = 'airbeds-test-app';


describe('Index Suggestion Settings add test flow', () => {
    before(() => {
		cy.window().then((win) => {
			win.sessionStorage.clear();
		});
	});

	it('Should open arc dashboard locally', () => {
		cy.visit(`${base_url}`).wait(2000);
	});

	it('Should login from cluster URL', () => {
		cy.loginUser(username, password, cluster);
        cy.wait(3000);
	});

    it('Should Index suggestion settings page URL', () => {
        cy.visit(`${base_url}/cluster/suggestions`).wait(2000);
        cy.get('.ant-tabs-nav > :nth-child(1) > :nth-child(3)').click();
    });

    it('Should Get Index Suggestions Settings Form Data', () => {
		const url = "http://localhost:8000"
        let credentials = btoa(`${username}:${password}`);
		cy.request({
            method: 'GET',
            url: `${url}/_index_suggestions/preferences`,
            headers: {
                Authorization: `Basic ${credentials}`
            }
        })
        .then((payload) => {
            cy.wait(3000);
            cy.get('[data-cy=index-suggestions-indices] > div > ul > li').each(($el, index) => {
                if (index < payload.body.indices.length - 1) {
                    expect($el).to.have.text(payload.body.indices[index]);
                }
            });
            // cy.get('[data-cy=index-suggestions-indices]').invoke('val').should('deep.equal', payload.body.indices);
            cy.get('[data-cy=show-distinct-suggestions]').should('have.value', JSON.stringify(payload.body.showDistinctSuggestions));
			cy.get('[data-cy=enable-predictive-suggestions]').should('have.value', JSON.stringify(payload.body.enablePredictiveSuggestions));
			cy.get('[data-cy=max-predicted-words]').should('have.value', payload.body.maxPredictedWords);
			cy.get('[data-cy=apply-stopwords]').should('have.value', JSON.stringify(payload.body.applyStopwords));
			cy.get('[data-cy=custom-stopwords]').should('have.value', payload.body.customStopwords.join(','));
			cy.get('[data-cy=enable-synonyms]').should('have.value', JSON.stringify(payload.body.enableSynonyms));
			cy.get('[data-cy=index-suggestions-size]').should('have.value', payload.body.size);

            cy.get('[data-cy=include-fields] > div > ul > li').each(($el, index) => {
                if (index < payload.body.indices.length - 1) {
                    expect($el).to.have.text(payload.body.includeFields[index]);
                }
            });

            cy.get('[data-cy=exclude-fields] > div > ul > li').each(($el, index) => {
                if (index < payload.body.indices.length - 1) {
                    expect($el).to.have.text(payload.body.excludeFields[index]);
                }
            });

            cy.get('[data-cy=category-field] > div > div.ant-select-selection-selected-value').should('have.text', payload.body.categoryField);
            cy.get('[data-cy=url-index-setting] > div > div.ant-select-selection-selected-value').should('have.text', payload.body.urlField);

        })

    });
});
