/* eslint-disable react/jsx-curly-brace-presence */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { Layout, Icon } from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import FullHeader from '../../components/FullHeader';
import { endScreenStyles } from './styles';
// TODO: Add navbar

function EndScreen({ sandboxURL }) {
	const [csbURL, setCsbURL] = useState('');

	useEffect(() => {
		if (sandboxURL !== '/') {
			setCsbURL(sandboxURL);
		}
	}, [sandboxURL]);

	return (
		<Layout>
			<FullHeader />
			<div className={endScreenStyles}>
				<div className="container">
					{csbURL && (
						<div className="header-card">
							{/* eslint-disable-next-line */}
							<h3 style={{ fontWeight: 'bold' }}>Share what you've built:</h3>
							<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
								<div className="overflow-text">{csbURL}</div>
								<CopyToClipboard text={csbURL}>
									<Icon type="copy" theme="outlined" className="icon-active" />
								</CopyToClipboard>
								<a
									target="_blank"
									rel="noreferrer"
									href={csbURL}
									style={{ height: 20, color: 'black' }}
								>
									<Icon type="link" theme="outlined" className="icon-active" />
								</a>
							</div>
						</div>
					)}
					<div className="banner-row">
						<div className="big-card">
							<h2>WEB APP</h2>

							<div>
								<div className="col">
									<img
										src="/static/images/onboarding/finish-screen/Trophy.png"
										srcSet="/static/images/onboarding/finish-screen/Trophy.png 245w, /static/images/onboarding/finish-screen/Trophy@2x.png 490w"
										alt="Trophy"
									/>
									<p>
										You
										{"'"}
										ve finished the tutorial.
									</p>
								</div>

								<div className="col">
									<img
										style={{
											width: '150px',
										}}
										src="/static/images/onboarding/finish-screen/Webapp.png"
										srcSet="/static/images/onboarding/finish-screen/Webapp.png 245w, /static/images/onboarding/finish-screen/Webapp@2x.png 490w"
										alt="Webapp"
									/>
									<h3>Learn how to build a web app</h3>
									<p>
										reactivesearch.io UI components for building data-driven web
										apps.
									</p>
									<a
										target="_blank"
										rel="noreferrer"
										className="button"
										href="https://docs.appbase.io/docs/reactivesearch/v3/overview/quickstart/"
									>
										Get Started
									</a>
								</div>
							</div>
						</div>
						<div className="small-card">
							<h2>DASHBOARD</h2>

							<img
								style={{
									width: '150px',
									margin: '40px auto 20px',
								}}
								src="/static/images/onboarding/finish-screen/Group@3x.svg"
								alt="Dashboard"
							/>

							<p
								style={{
									fontSize: '16px',
									lineHeight: '26px',
									maxWidth: '250px',
									margin: '20px auto',
								}}
							>
								Create an app or browse your current apps via the dashboard.
							</p>
							<a
								className="button"
								href={`/app/${window.location.search.split('=')[1]}`}
							>
								Go to Dashboard
							</a>
						</div>
					</div>

					<div className="card-row">
						<div className="card">
							<h2>MOBILE APP</h2>
							<img
								src="/static/images/onboarding/finish-screen/ReactiveNative.svg"
								alt="Reactive search"
							/>
							<p>reactivesearch.io UI components for building mobile apps.</p>
							<a
								className="button"
								target="_blank"
								rel="noreferrer"
								href="https://docs.appbase.io/docs/reactivesearch/react-native-searchbox/quickstart/"
							>
								Learn More
							</a>
						</div>
						<div className="card">
							<h2>MAPS APP</h2>
							<img
								src="/static/images/onboarding/finish-screen/ReactiveMaps.svg"
								alt="Reactive maps"
							/>
							<p>
								reactivesearch.io UI components for building realtime geolocation
								apps.
							</p>
							<a
								className="button"
								target="_blank"
								rel="noreferrer"
								href="https://docs.appbase.io/docs/reactivesearch/v3/overview/reactivemaps/"
							>
								Learn More
							</a>
						</div>
						<div className="card">
							<h2>APIs</h2>
							<img
								width="100px"
								style={{ margin: '40px 0px 55px' }}
								src="/static/images/onboarding/finish-screen/api@3x.svg"
								alt="API"
							/>
							<p>
								Get started with the APIs for indexing, querying and searching data
								with appbase.
							</p>
							<a
								className="button"
								target="_blank"
								rel="noreferrer"
								href="https://docs.appbase.io/api/examples/rest/"
							>
								Learn More
							</a>
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
}

EndScreen.propTypes = {
	sandboxURL: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => {
	const sandboxURL = get(state, 'csbURL.csbURL', '');
	return {
		sandboxURL,
	};
};

export default connect(mapStateToProps, null)(EndScreen);
