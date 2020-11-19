import React, { Fragment } from 'react';

import MappingComponent from './components/MappingComponent';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import ErrorToaster from '../../batteries/components/shared/ErrorToaster';

const bannerMessage = {
	title: 'Schema Settings',
	buttonText: 'Read Docs',
	videoLink: 'https://youtu.be/ejk2wybEwoc',
	description: 'View mappings, edit use-case and data types, add or delete fields',
	href: 'https://docs.appbase.io/docs/search/relevancy/#schema',
};

const MappingsPage = () => {
	return (
		<Fragment>
			<Banner {...bannerMessage} />
			<section style={{ padding: 50 }}>
				<ErrorToaster>
					<MappingComponent />
				</ErrorToaster>
			</section>
		</Fragment>
	);
};

export default MappingsPage;
