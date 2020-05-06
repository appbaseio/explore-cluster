import React, { Fragment } from 'react';
import { string } from 'prop-types';

import Mappings from '../../batteries/components/Mappings';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';

const bannerMessage = {
	title: 'Schema Settings',
	buttonText: 'Read Docs',
	description: 'View mappings, edit use-case and data types, add or delete fields',
	href: 'https://docs.appbase.io/docs/search/relevancy/#schema',
};

const MappingsPage = ({ appName }) => (
	<Fragment>
		<Banner {...bannerMessage} />
		<section>
			<Mappings key={appName} appName={appName} appId={appName} />
		</section>
	</Fragment>
);

MappingsPage.propTypes = {
	appName: string.isRequired,
};

export default MappingsPage;
