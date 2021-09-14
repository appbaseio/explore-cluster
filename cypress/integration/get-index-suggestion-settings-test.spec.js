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
        cy.visit(`${base_url}/app/${indexName}/suggestions`).wait(2000);
        cy.get('.ant-tabs-nav > :nth-child(1) > :nth-child(2)').click();
    });

    it('Should Get Index Suggestions Settings Form Data', () => {

    });
});
