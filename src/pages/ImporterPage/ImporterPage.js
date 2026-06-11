import React, { Fragment } from 'react';
import { Skeleton } from 'antd';
import { css, injectGlobal } from 'emotion';
import { Importer } from '@appbaseio/importer';
import { event, timingEvent } from '../../utils/gtag';
import moment from '../../utils/moment';

import ErrorToaster from '../../batteries/components/shared/ErrorToaster';
import { getImporterClusterConfig } from '../../utils/importerCluster';

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
			importerConfig: null,
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
		this.setState({
			preparingApp: false,
			importerConfig: this.buildImporterConfig(),
		});

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

	buildImporterConfig = () => {
		const cluster = getImporterClusterConfig();
		return {
			sampleDataset: {
				url: '/samples/moviesData.json',
				label: 'Load sample movies',
				filename: 'movies.json',
			},
			...(cluster ? { cluster } : {}),
		};
	};

	render() {
		const { preparingApp, importerConfig } = this.state;
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
							<Importer config={importerConfig} />
						)}
					</section>
				</ErrorToaster>
			</Fragment>
		);
	}
}

export default ImporterPage;
