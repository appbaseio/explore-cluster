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

    it('Should Add Index Suggestions Settings Form Data', () => {

        cy.get('[data-cy=index-suggestions-fields-container] > [data-cy=suggestions-footer] > [data-cy=buttons-container] > [style="display: flex;"] > [data-cy=reset-suggestions]').click();
        cy.wait(2000);

        cy.get('[data-cy=index-suggestions-indices]').invoke('val', '');
        cy.get('[data-cy=index-suggestions-indices]').click();
        cy.get('[data-cy=airbeds-test-app]').click({ force: true, multiple: true });
        cy.get('[data-cy=index-suggestions-fields-container]').click({ force: true, multiple: true });
        cy.wait(3000);

        cy.get('[data-cy=show-distinct-suggestions]').click();
        cy.get('[data-cy=enable-predictive-suggestions]').click();
        cy.get('[data-cy=max-predicted-words]').clear().type(2);
        cy.get('[data-cy=apply-stopwords]').click();
        cy.get('[data-cy=custom-stopwords]').clear().type("the,a");
        cy.get('[data-cy=enable-synonyms]').click();
        cy.get('[data-cy=index-suggestions-size]').clear().type(3);

        cy.get('[data-cy=include-fields]').click();
        cy.get('[data-cy=bed_type]').click();
        cy.get('[data-cy=include-fields-label]').click();

        // cy.get('[data-cy=exclude-fields]').click();
        // cy.get('[data-cy=bathrooms]').click({ force: true, multiple: true });
        // cy.get('[data-cy=exclude-fields-label]').click();

        cy.get('[data-cy=category-field]').click();
        cy.get('[data-cy=bathrooms]').click({ force: true, multiple: true });
        cy.get('[data-cy=categoryField-label]').click();

        cy.get('[data-cy=url-index-setting]').click();
        cy.get('[data-cy=bathrooms]').click({ force: true, multiple: true });
        cy.get('[data-cy=url-label]').click();

        cy.wait(1000);
        // save button
        cy.get('[data-cy=index-suggestions-fields-container] > [data-cy=suggestions-footer] > [data-cy=buttons-container] > [style="display: flex;"] > :nth-child(2) > div > [data-cy=review-deploy-suggestion-settings]').click();
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
                "applyStopwords": true,
                "customStopwords": ["the", "a"],
                "maxPredictedWords": 2,
                "customQuery": "efe",
                "includeFields": ["body_html", "image"],
                "categoryField": "date_from",
                "showDistinctSuggestions": true,
                "enablePredictiveSuggestions": true,
                "enableSynonyms": true,
                "size": 3,
                "indices": ["airbeds-test-app"],
                "exludeFields": [""]
            }
        });
    });
});
