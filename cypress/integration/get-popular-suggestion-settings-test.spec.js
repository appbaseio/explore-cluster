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
        cy.visit(`${base_url}/cluster/suggestions`).wait(2000);
        cy.get('.ant-tabs-nav > :nth-child(1) > :nth-child(1)').click();
    });

    it('Should Get Popular Suggestions Settings Form Data', () => {
        const url = "http://localhost:8000"
        let credentials = btoa(`${username}:${password}`);
        cy.request({
            method: 'GET',
            url: `${url}/_popular_suggestions/preferences`,
            headers: {
                Authorization: `Basic ${credentials}`
            }
        })
        .then((payload) => {
            console.log(payload,"jnkijnkio");
            cy.wait(2000);

            cy.get('[data-cy=number-of-days]').should('have.value', payload.body.numberOfDays);
            cy.get('[data-cy=min-count]').should('have.value', payload.body.minCount);
            cy.get('[data-cy=popular-suggestions-min-hits]').should('have.value', payload.body.minHits);
            cy.get('[data-cy=min-characters]').should('have.value', payload.body.minChars);
            cy.get('[data-cy=transform-diacritics]').should('have.value', JSON.stringify(payload.body.transformDiacritics));
            cy.get('[data-cy=popular-suggestions-size]').should('have.value', payload.body.size);

        })
    });
});
