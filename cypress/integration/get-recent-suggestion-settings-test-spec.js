import generateName from '../utils/generateName';
import { base_url, username, password, app_url, cluster } from '../utils/index';

let indexName = 'airbeds-test-app';


describe('Recent Suggestion Settings add test flow', () => {
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

    it('Should Recent suggestion settings page URL', () => {
        cy.visit(`${base_url}/app/${indexName}/suggestions`).wait(2000);
        cy.get('.ant-tabs-nav > :nth-child(1) > :nth-child(2)').click();
    });

    it('Should Get Recent Suggestions Settings Form Data', () => {
		const payload = {
			"indices": ['airbeds-test-app'], // `index pattern` -> Supports a single index, comma separated indexes or wildcard indexes.
			"minHits": 1,   // Only return recent suggestions if the hits returned are > 0.
			"size": 5 // number input, [0, 100]
		}

		cy.wait(2000);

		cy.get('[data-cy=recent-suggestions-min-hits]').should('have.value', payload.minHits);
        cy.get('[data-cy=recent-suggestions-size]').should('have.value', payload.size);

		// cy.get('[data-cy=popular-suggestions-indicest]').should('have.value', payload.indices);

    });
});
