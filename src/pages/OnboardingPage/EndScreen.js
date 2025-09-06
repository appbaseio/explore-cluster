/* eslint-disable react/jsx-curly-brace-presence */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { CopyOutlined, LinkOutlined } from '@ant-design/icons';
import { Layout } from 'antd';
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
									<CopyOutlined className="icon-active" />
								</CopyToClipboard>
								<a
									target="_blank"
									rel="noreferrer"
									href={csbURL}
									style={{ height: 20, color: 'black' }}
								>
									<LinkOutlined className="icon-active" />
								</a>
							</div>
						</div>
					)}
					<div className="banner-row">
						<div className="big-card">
							<h2>WEB SEARCH UI</h2>

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
									<h3>Learn how to build a web search UI</h3>
									<p>
										Reactivesearch.io UI components for building search
										experiences.
									</p>
									<a
										target="_blank"
										rel="noreferrer"
										className="button"
										href="https://docs.reactivesearch.io/docs/reactivesearch/react/overview/quickstart/"
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
								Create an index or browse your current indices via the dashboard.
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
							<h2>MOBILE SEARCH</h2>
							<img
								src="/static/images/onboarding/finish-screen/ReactiveNative.svg"
								alt="Reactive search"
							/>
							<p>
								reactivesearch.io Flutter UI components for building mobile search
								experiences.
							</p>
							<a
								className="button"
								target="_blank"
								rel="noreferrer"
								href="https://docs.reactivesearch.io/docs/reactivesearch/flutter-searchbox/quickstart/"
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
								reactivesearch.io UI components for building geo search experiences.
							</p>
							<a
								className="button"
								target="_blank"
								rel="noreferrer"
								href="https://docs.reactivesearch.io/docs/reactivesearch/react/overview/reactivemaps/"
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
								with ReactiveSearch.
							</p>
							<a
								className="button"
								target="_blank"
								rel="noreferrer"
								href="https://docs.reactivesearch.io/api/examples/rest/"
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
