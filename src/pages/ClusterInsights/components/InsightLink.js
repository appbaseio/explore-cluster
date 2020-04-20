import React from 'react';
import { Result, Button } from 'antd';

const InsightLink = ({ hasSubscribed, insight_link }) => {
	if (!hasSubscribed) {
		return 'Placeholder Image';
	}

	if (hasSubscribed && !insight_link) {
		return (
			<Result
				status="404"
				title="Insights not available"
				subTitle="Analysis is in progress, insights will be available soon. Contact us for more details."
				extra={
					<Button onClick={() => window.Intercom('show')} type="primary">
						Chat with us
					</Button>
				}
			/>
		);
	}

	return (
		<iframe
			src={insight_link}
			height="600px"
			width="100%"
			title="Curated Insights"
			frameBorder="0"
		/>
	);
};

export default InsightLink;
