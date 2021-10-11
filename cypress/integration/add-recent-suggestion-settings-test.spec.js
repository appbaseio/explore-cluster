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

    it('Should Add Recent Suggestions Settings Form Data', () => {
        cy.get('[data-cy=recent-suggestions-min-hits]').clear().type(1);
        cy.get('[data-cy=recent-suggestions-size]').clear().type(3);

        // save button
        cy.get('[data-cy=recent-suggestions-save]').click();
        let credentials = btoa(`${username}:${password}`);

        cy.request({
            method: 'PUT',
            url: `${app_url}_recent_suggestions/preferences`,
            headers: {
				Authorization: `Basic ${credentials}`,
				'Content-Type': 'application/json',
			},
            body: {
                "minHits": 1,
                "size": 3,
                "indices": ["airbeds-test-app"]
            }
        });

    });
});
