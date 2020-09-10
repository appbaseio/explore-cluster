import React, { Fragment } from 'react';
import { string } from 'prop-types';

import Mappings from './components/Mappings';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import ErrorToaster from '../../batteries/components/shared/ErrorToaster';

const bannerMessage = {
	title: 'Schema Settings',
	buttonText: 'Read Docs',
	description: 'View mappings, edit use-case and data types, add or delete fields',
	href: 'https://docs.appbase.io/docs/search/relevancy/#schema',
};

const MappingsPage = ({ appName }) => (
	<Fragment>
		<Banner {...bannerMessage} />
		<section style={{ padding: 50 }}>
			<ErrorToaster>
				<Mappings key={appName} appName={appName} />
			</ErrorToaster>
		</section>
	</Fragment>
);

MappingsPage.propTypes = {
	appName: string.isRequired,
};

export default MappingsPage;
