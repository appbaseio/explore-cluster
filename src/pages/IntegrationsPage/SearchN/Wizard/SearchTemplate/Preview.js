import { string } from 'prop-types';
import React, { useEffect, useState } from 'react';
import Loader from '../../../../../components/Loader';
import { getTemplate } from '../../../utils/index';

const Preview = ({ theme }) => {
	const [templateObj, setTemplateObj] = useState({});

	useEffect(() => {
		setTemplateObj(getTemplate(theme));
	}, []);

	if (!Object.keys(templateObj).length) return <Loader />;
	return (
		<div
			style={{
				textAlign: 'center',
			}}
		>
			<iframe
				title="iframe-preview"
				id="iframe-preview"
				frameBorder="0"
				width="100%"
				height={window.innerHeight}
				src={templateObj.netlifyURL}
			/>
		</div>
	);
};

Preview.defaultProps = {
	theme: 'classic',
};

Preview.propTypes = {
	theme: string,
};

export default Preview;
