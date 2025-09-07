import React, { Fragment } from 'react';
import { Skeleton } from 'antd';
import { css, injectGlobal } from 'emotion';
import { Importer } from '@appbaseio/importer';
import { event, timingEvent } from '../../utils/gtag';
import moment from '../../utils/moment';

import ErrorToaster from '../../batteries/components/shared/ErrorToaster';

// eslint-disable-next-line no-unused-expressions
injectGlobal`
	.ant-layout-header{
		background: white !important;
	}

	.ant-modal-confirm-body > .anticon + .ant-modal-confirm-title + .ant-modal-confirm-content {
    	margin-left: 0;
	}
`;

class ImporterPage extends React.Component {
	constructor(props) {
		super(props);
		this.startTime = moment();
		this.state = {
			preparingApp: true,
		};
	}

	componentDidMount() {
		// triggering custom event for google analytics
		event({
			action: 'Importer',
			category: 'Develop',
			label: 'visit',
			value: null,
		});
		this.togglePreparing();

		setTimeout(() => {
			window.scrollTo({
				top: document.body.scrollHeight || document.documentElement.scrollHeight,
				behavior: 'smooth',
			});
		}, 1000);
	}

	componentWillUnmount() {
		// Sends the timing event to Google Analytics.
		timingEvent({
			action: 'timing_complete',
			category: 'Develop',
			label: 'importer-time',
			name: 'time',
			value: this.startTime.fromNow(),
		});
	}

	togglePreparing = () => {
		this.setState((prevState) => ({
			preparingApp: !prevState.preparingApp,
		}));
	};

	render() {
		const { preparingApp } = this.state;
		return (
			<Fragment>
				<ErrorToaster>
					<section
						className={css`
							.importer-layout-footer {
								padding-right: 60px !important;
								flex-direction: row !important;
								height: auto;
								bottom: 0 !important;
								padding-top: 26px !important;
							}
						`}
					>
						{preparingApp ? (
							<div style={{ maxWidth: '80%', margin: '20px auto' }}>
								<h2>Preparing app for Import. This may take few seconds.</h2>
								<Skeleton active />
							</div>
						) : (
							<Importer
								config={{
									sampleDataset: {
										url: '/samples/moviesData.json', // any JSON/NDJSON/JSON array URL
										label: 'Load sample movies',
										filename: 'movies.json',
									},
								}}
							/>
						)}
					</section>
				</ErrorToaster>
			</Fragment>
		);
	}
}

export default ImporterPage;
