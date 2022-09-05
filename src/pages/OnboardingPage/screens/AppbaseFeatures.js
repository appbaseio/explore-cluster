/* eslint-disable jsx-a11y/anchor-is-valid,jsx-a11y/mouse-events-have-key-events */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SearchApp from './SearchApp';
import Footer from '../components/Footer';
import appbaseHelpers from '../utils/appbaseHelpers';

const jsonBlock = `
<div style="background: #fefefe; overflow:auto;width:auto;padding:1rem;"><pre style="margin: 0; line-height: 180%; border: 0; background: transparent; border-radius: 0;">{
	<span style="color: #4070a0">&quot;genres&quot;</span><span style="color: #666666">:</span> <span style="color: #4070a0">&quot;Action&quot;</span>,
	<span style="color: #4070a0">&quot;original_language&quot;</span><span style="color: #666666">:</span> <span style="color: #4070a0">&quot;English&quot;</span>,
	<span style="color: #4070a0">&quot;original_title&quot;</span><span style="color: #666666">:</span> <span style="color: #4070a0">&quot;Star Wars: The Last Jedi&quot;</span>,
	<span style="color: #4070a0">&quot;overview&quot;</span><span style="color: #666666">:</span> <span style="color: #4070a0">&quot;Rey develops her newly discovered abilities with the guidance of Luke Skywalker, who is unsettled by the strength of her powers. Meanwhile, the Resistance prepares to do battle with the First Order.&quot;</span>,
	<span style="color: #4070a0">&quot;poster_path&quot;</span><span style="color: #666666">:</span> <span style="color: #4070a0">&quot;/kOVEVeg59E0wsnXmF9nrh6OmWII.jpg&quot;</span>,
	<span style="color: #4070a0">&quot;release_year&quot;</span><span style="color: #666666">:</span> <span style="color: #40a070">2017</span>,
	<span style="color: #4070a0">&quot;tagline&quot;</span><span style="color: #666666">:</span> <span style="color: #4070a0">&quot;Episode VIII - The Last Jedi&quot;</span>
}
</pre></div>
`;

export default class AppbaseFeatures extends Component {
	state = {
		showJSONBlock: false,
	};

	showJSONBlock = () => {
		this.setState({
			showJSONBlock: true,
		});
	};

	hideJSONBlock = () => {
		this.setState({
			showJSONBlock: false,
		});
	};

	indexData = () => {
		this.hideJSONBlock();
		appbaseHelpers.indexNewData();
	};

	renderIndexBlock = () => {
		const { showJSONBlock } = this.state;
		return (
			<div style={{ marginTop: 0 }} className="search-field-container full-row">
				<div>
					<h3>Streaming updates</h3>
					<p>
						We will add a new movie to our dataset. Once added, it will appear in
						realtime in the existing results if it matches the search query.
					</p>
				</div>
				<div
					className="input-wrapper"
					onMouseLeave={this.hideJSONBlock}
					style={{
						flexDirection: 'row-reverse',
						position: 'relative',
					}}
				>
					<a
						className="button primary"
						onMouseOver={this.showJSONBlock}
						onClick={this.indexData}
					>
						Add New Movie
					</a>

					<div
						className={`code-block hoverable ${showJSONBlock ? 'show' : ''}`}
						dangerouslySetInnerHTML={{ __html: jsonBlock }}
					/>
				</div>
			</div>
		);
	};

	renderSearchApp = () => {
		const { searchFields, facetFields } = this.props;
		return (
			<div>
				<SearchApp fields={searchFields} facets={facetFields} />
			</div>
		);
	};

	render() {
		const { nextScreen, app, previousScreen } = this.props;
		return (
			<div>
				<div className="wrapper">
					<div>
						<img
							src="/static/images/onboarding/Realtime.svg"
							alt="realtime reactivesearch.io"
						/>
					</div>
					<div className="content">
						<header>
							<h2>Stream realtime updates</h2>
						</header>
						<p>
							reactivesearch.io has built-in support for streaming realtime (aka live)
							updates on search queries
						</p>
					</div>
				</div>
				{this.renderIndexBlock()}
				{this.renderSearchApp()}
				<Footer
					nextScreen={nextScreen}
					previousScreen={previousScreen}
					label="Finish"
					app={app}
				/>
			</div>
		);
	}
}

AppbaseFeatures.propTypes = {
	searchFields: PropTypes.array,
	facetFields: PropTypes.array,
	nextScreen: PropTypes.func,
	app: PropTypes.string.isRequired,
	previousScreen: PropTypes.func,
};

AppbaseFeatures.defaultProps = {
	searchFields: [],
	facetFields: [],
	nextScreen: null,
	previousScreen: null,
};
