import React from 'react';
import { Result, Button, Spin } from 'antd';
import Frame from '../../../components/Frame';

class InsightLink extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			frameLoading: !!props.insight_link,
		};
	}

	toggleLoader = () => {
		this.setState(state => ({
			frameLoading: !state.frameLoading,
		}));
	};

	render() {
		const { hasSubscribed, insight_link } = this.props;
		const { frameLoading } = this.state;

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
			<React.Fragment>
				{frameLoading && <Spin />}
				<Frame
					src={insight_link}
					id="curated-insights"
					onLoad={this.toggleLoader}
					height="600px"
					width="100%"
					title="Curated Insights"
					frameBorder="0"
				/>
			</React.Fragment>
		);
	}
}

export default InsightLink;
