import generateName from '../utils/generateName';
import { base_url, username, password, app_url, cluster } from '../utils/index';

let indexName = 'airbeds-test-app';


describe('Popular Suggestion Settings add test flow', () => {
    before(() => {
		cy.window().then((win) => {
			win.sessionStorage.clear();
		});
		// indexName = generateName();
	});

	it('Should open arc dashboard locally', () => {
		cy.visit(`${base_url}`).wait(2000);
	});

	it('Should login from cluster URL', () => {
		cy.loginUser(username, password, cluster);
        cy.wait(3000);
	});

    it('Should Popular suggestion settings page URL', () => {
        cy.visit(`${base_url}/app/${indexName}/suggestions`).wait(2000);
        cy.get('.ant-tabs-nav > :nth-child(1) > :nth-child(1)').click();
    });

    it('Should Get Popular Suggestions Settings Form Data', () => {

        let credentials = btoa(`${username}:${password}`);
        const payload = {
            "indices": ['airbeds-test-app'],
            "numberOfDays": 2,
            "minCount": 3,
            "minHits": 3,
            "minCharacters": 3,
            "transformDiacritics": true,
            "size": 5,
            "blacklist": ['movie'],
            "externalSuggestions": '[]',
        };

        cy.wait(2000);

        cy.get('[data-cy=number-of-days]').should('have.value', payload.numberOfDays);
        cy.get('[data-cy=min-count]').should('have.value', payload.minCount);
        cy.get('[data-cy=popular-suggestions-min-hits]').should('have.value', payload.minHits);
        cy.get('[data-cy=min-characters]').should('have.value', payload.minCharacters);
        cy.get('[data-cy=transform-diacritics]').should('be.checked');
        cy.get('[data-cy=popular-suggestions-size]').should('have.value', payload.size);

    });
});
