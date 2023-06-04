import React from 'react';
import IframeResizer from 'iframe-resizer-react';

const PricingComponent = () => {
	return (
		<IframeResizer
			log
			src="https://www.reactivesearch.io/embed/pages/caab8851-5674-43f2-9f8e-1282cdf24688/blocks/pricing2"
			style={{ width: '100%', border: 'none' }}
		/>
	);
};

export default PricingComponent;
