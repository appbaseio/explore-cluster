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
        cy.visit(`${base_url}/cluster/suggestions`).wait(2000);
        cy.get('.ant-tabs-nav > :nth-child(1) > :nth-child(2)').click();
    });

    it('Should Get Recent Suggestions Settings Form Data', () => {
        let credentials = btoa(`${username}:${password}`);
        cy.request({
            method: 'GET',
            url: `${app_url}/_recent_suggestions/preferences`,
            headers: {
                Authorization: `Basic ${credentials}`
            }
        })
        .then((payload) => {
            console.log(payload,"jnkijnkio");
            cy.wait(2000);

            cy.get('[data-cy=recent-suggestions-min-hits]').should('have.value', payload.body.minHits);
        	cy.get('[data-cy=recent-suggestions-size]').should('have.value', payload.body.size);
        })
    });
});
