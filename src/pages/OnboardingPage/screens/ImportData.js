/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import parser from 'url-parser-lite';
import Footer from '../components/Footer';
import Loader from '../components/Loader';
import appbaseHelpers from '../utils/appbaseHelpers';

const jsonBlock = `
<div style="background: #DCF8FF; overflow:auto;width:auto;padding:1rem;">
<pre style="margin: 0; line-height: 180%; border: 0; background: transparent; border-radius: 0;">
 <code>
 [
    {
        "adult": false,
        "backdrop_path": "https://www.themoviedb.org/t/p/w1280/inJjDhCjfhh3RtrJWBmmDqeuSYC.jpg",
        "genres": [ "Action", "Adventure", "Fantasy" ],
        "id": 399566,
        "original_language": "en",
        "original_title": "Godzilla vs. Kong",
        "overview": "In a time when monsters walk the Earth, humanity’s fight for its future sets Godzilla and Kong on a collision course that will see the two most powerful forces of nature on the planet collide in a spectacular battle for the ages.",
        "popularity": 456.906,
        "poster_path": "https://www.themoviedb.org/t/p/w1280/pgqgaUx1cJb5oZQQ5v0tNARCeBp.jpg",
        "release_date": "2021-03-24",
        "title": "Godzilla vs. Kong",
        "video": false,
        "vote_average": 7.9,
        "vote_count": 7001,
        "release_year": 2021,
    },
    {
        "adult": false,
        "backdrop_path": "https://www.themoviedb.org/t/p/w1280/dssCw0mUmD4EriUmkwB3PnsGu4q.jpg",
        "genre_ids": [ "Animation", "Action", "Fantasy" ],
        "id": 841755,
        "original_language": "en",
        "original_title": "Mortal Kombat Legends: Battle of the Realms",
        "overview": "The Earthrealm heroes must journey to the Outworld and fight for the survival of their homeland, invaded by the forces of evil warlord Shao Kahn, in the tournament to end all tournaments: the final Mortal Kombat.",
        "popularity": 395.824,
        "poster_path": "https://www.themoviedb.org/t/p/w1280/ablrE8IbWcIrAxMmm4gnPn75AMS.jpg",
        "release_date": "2021-08-30",
        "title": "Mortal Kombat Legends: Battle of the Realms",
        "video": false,
        "vote_average": 8,
        "vote_count": 138,
        "release_year": 2021,
    }
]
 </code>
</pre></div>
`;

export default class Introduction extends Component {
	constructor(props) {
		super(props);

		const { url } = props;
		this.state = {
			status: 'Applying relevant settings...',
			loading: false,
			url,
			layout: 0,
		};
	}

	setMapping = () => {
		this.setState({
			loading: true,
		});
		appbaseHelpers
			.applyAnalyzers()
			.then(() => {
				this.setState({
					status: 'Preparing the database configuration...',
				});
			})
			.then(appbaseHelpers.updateMapping)
			.then(() => {
				this.setState({
					status: 'Indexing movies data of 10,000 records... Almost done!',
				});
			})
			.then(appbaseHelpers.indexData)
			.then(() => {
				this.setState({
					status: 'Loading data browser... Hang tight!',
				});
			})
			.then(() => {
				appbaseHelpers.createURL(this.setURL);
			})
			.catch((e) => {
				if (
					e._bodyInit ===
					'{"error":{"root_cause":[{"type":"parse_exception","reason":"request body is required"}],"type":"parse_exception","reason":"request body is required"},"status":400}'
				) {
					appbaseHelpers.createURL(this.setURL);
				}
				console.log('@error-at-importing-data', e);
				console.log('@error-at-importing-data-response-type', typeof e);
				console.log('error', e);
			});
	};

	hideLoader = () => {
		this.setState({
			status: '',
			loading: false,
		});
	};

	renderJSONBlock = () => (
		<div>
			<p>Showing a sample JSON to be imported:</p>
			<div
				style={{ width: '650px' }}
				className="code-block"
				dangerouslySetInnerHTML={{ __html: jsonBlock }}
			/>
		</div>
	);

	setURL = (url) => {
		this.setState({
			url,
		});
		const { setURL } = this.props;
		setURL(url);
	};

	nextLayout = () => {
		this.setState({
			layout: 1,
		});
	};

	renderImportContent = () => {
		const { nextScreen } = this.props;
		return (
			<div>
				<div className="wrapper">
					<div>
						<img src="/static/images/onboarding/Import.svg" alt="importing data" />
					</div>
					<div className="content">
						<header className="vcenter">
							<h2>Import data into your app</h2>
						</header>
						<div>
							<h3>There are three ways to bring your data into appbase.io:</h3>

							<div className="feature-list">
								<div>
									<div style={{ display: 'block' }}>
										<img
											src="/static/images/onboarding/Dashboard.png"
											srcSet="/static/images/onboarding/Dashboard.png 110w, /static/images/onboarding/Dashboard@2x.png 220w"
											alt="Dashboard"
										/>
									</div>
									<p>
										Dashboard offers a GUI for importing JSON/CSV files when
										creating a new app.
									</p>
								</div>
								<div>
									<div style={{ display: 'block' }}>
										<img
											src="/static/images/onboarding/CLI.png"
											srcSet="/static/images/onboarding/CLI.png 110w, /static/images/onboarding/CLI@2x.png 220w"
											alt="CLI"
										/>
									</div>
									<p>
										<a
											className="dashed"
											href="https://github.com/appbaseio/abc"
											target="_blank"
											rel="noopener noreferrer"
										>
											CLI
										</a>{' '}
										syncs data from popular database and file formats like
										MongoDB, MySQL, PostgreSQL, SQLServer, Kafka, JSON and CSV.
									</p>
								</div>
								<div>
									<div style={{ display: 'block' }}>
										<img
											src="/static/images/onboarding/REST.png"
											srcSet="/static/images/onboarding/REST.png 110w, /static/images/onboarding/REST@2x.png 220w"
											alt="REST API"
										/>
									</div>
									<p>
										<a
											className="dashed"
											href="https://rest.appbase.io"
											target="_blank"
											rel="noopener noreferrer"
										>
											REST based APIs
										</a>{' '}
										enable indexing data in a programming language of your
										choice.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
				<Footer nextScreen={nextScreen} />
			</div>
		);
	};

	render() {
		const { url, loading, layout, status } = this.state;
		const { nextScreen } = this.props;

		if (layout === 0) return this.renderImportContent();

		let iframeURL = null;
		if (url) {
			const config = JSON.parse(url);
			const { protocol, host, auth } = parser(config.url);
			const dejavuAddress = `${protocol}://${auth}@${host}`;
			iframeURL = `https://dejavu.appbase.io/?appname=${config.appname}&url=${dejavuAddress}&footer=false&sidebar=false&appswitcher=false&mode=edit&cloneApp=false&oldBanner=false`;
		}

		return (
			<div>
				<div className="wrapper">
					<div>
						<img src="/static/images/onboarding/Import.svg" alt="importing data" />
					</div>
					<div className="content">
						<header className="vcenter">
							<h2>Import data into your app</h2>
							{url ? (
								<p>Explore your imported dataset for the movies store.</p>
							) : (
								<p>We will import a dataset of 10,000 movies obtained from TMDB.</p>
							)}
						</header>

						{url ? null : <div className="col-wrapper">{this.renderJSONBlock()}</div>}
					</div>
				</div>
				{iframeURL ? (
					<div>
						<iframe
							height="600px"
							width="100%"
							title="dejavu"
							src={iframeURL}
							frameBorder="0"
							style={{ marginTop: '-10px' }}
							onLoad={this.hideLoader}
						/>
					</div>
				) : null}
				<Loader show={loading} label={status} />
				{url ? (
					<Footer nextScreen={nextScreen} />
				) : (
					<footer>
						<div className="left-column">
							<a
								onClick={this.setMapping}
								data-cy="submit-data"
								className="primary button big"
							>
								Import Movies Dataset
							</a>
						</div>
					</footer>
				)}
			</div>
		);
	}
}

Introduction.propTypes = {
	setURL: PropTypes.func.isRequired,
	nextScreen: PropTypes.func,
	url: PropTypes.string,
};

Introduction.defaultProps = {
	nextScreen: null,
	url: undefined,
};
