/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import { RightOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import parser from 'url-parser-lite';
import Loader from '../components/Loader';
import Footer from '../components/Footer';
import appbaseHelpers from '../utils/appbaseHelpers';
import { moviesJson } from '../utils/sampleData/moviesData';
import { geoJson } from '../utils/sampleData/geoData';
import { ecommJson } from '../utils/sampleData/ecommData';

const datsetMappings = [
	{
		id: 'movies',
		name: 'Movies Dataset',
		description:
			'A dataset of 10,000 movies obtained from TMDB. This is ideal to experiment with SaaS use-cases.',
		url: 'https://www.themoviedb.org/t/p/w1280/xmbU4JTUm8rsdtn7Y3Fcm30GpeT.jpg',
		alt: 'movies-image',
		count: '10,000',
	},
	{
		id: 'products',
		name: 'Products Dataset',
		description:
			'A dataset of 3,000 e-commerce products. This is ideal to experiment with E-commerce use-cases.',
		url: 'https://imgur.com/eZ4wZMq.png',
		alt: 'products-image',
		count: '3,000',
	},
	{
		id: 'geo',
		name: 'Geo Dataset',
		description:
			'A dataset of 3,500 earthquake samples from the last 100 years. This is ideal to experiment with the Geo use-cases.',
		url: 'https://imgur.com/q9neV4t.png',
		alt: 'geo-image',
		count: '3,500',
	},
];

function selectDataset({ nextScreen, setURL, url: newUrl, handleDataset }) {
	const [dataset, setDataSet] = useState({ name: 'Movies Dataset', count: '10,000' });
	const [layout, setLayout] = useState(0);
	const [url, saveUrl] = useState(newUrl);
	const [loading, setLoading] = useState(false);
	const [status, setStatus] = useState('Applying relevant settings...');

	function handleSelect(name, count, id) {
		setDataSet({
			name,
			count,
		});
		handleDataset(id);
	}

	async function setMapping() {
		try {
			setLoading(true);
			await appbaseHelpers.applyAnalyzers();
			setStatus('Preparing the database configuration...');

			await appbaseHelpers.updateMapping(dataset);
			setStatus(`Indexing ${dataset.name} of ${dataset.count} records... Almost done!`);

			await appbaseHelpers.indexData(dataset);
			setStatus('Loading data browser... Hang tight!');

			await appbaseHelpers.createURL(handleUrl);
		} catch (e) {
			if (
				e._bodyInit ===
				'{"error":{"root_cause":[{"type":"parse_exception","reason":"request body is required"}],"type":"parse_exception","reason":"request body is required"},"status":400}'
			) {
				appbaseHelpers.createURL(handleUrl);
			}
			console.log('@error-at-importing-data', e);
			console.log('@error-at-importing-data-response-type', typeof e);
			console.log('error', e);
		}
	}

	function hideLoader() {
		setStatus('');
		setLoading(false);
	}

	function jsonBlock() {
		if (dataset.name === 'Movies Dataset') {
			return moviesJson;
		}
		if (dataset.name === 'Products Dataset') {
			return ecommJson;
		}
		return geoJson;
	}

	function renderJSONBlock() {
		return (
			<div>
				<p>Showing a sample JSON to be imported:</p>
				<div
					style={{ width: '650px' }}
					className="code-block"
					dangerouslySetInnerHTML={{ __html: jsonBlock() }}
				/>
			</div>
		);
	}

	function handleUrl(data) {
		saveUrl(data);
		setURL(data);
	}

	function handleLayout() {
		setLayout(1);
	}

	function sampleLayout() {
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
								<p>{`Explore your imported ${dataset.name}.`}</p>
							) : (
								<p>{`We will import a dataset of ${dataset.count} items obtained from TMDB.`}</p>
							)}
						</header>

						{url ? null : <div className="col-wrapper">{renderJSONBlock()}</div>}
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
							onLoad={() => hideLoader()}
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
								onClick={() => setMapping()}
								data-cy="submit-data"
								className="primary button big"
							>
								{`Import ${dataset.name}`}
							</a>
						</div>
					</footer>
				)}
			</div>
		);
	}

	return (
		<div>
			{layout === 0 ? (
				<div className="wrapper">
					<div>
						<img src="/static/images/onboarding/Create.svg" alt="create app" />
					</div>
					<div className="content">
						<header>
							<h2>Choose a sample dataset to import from</h2>
							<p>
								We will be using the reactivesearch.io dashboard to import this
								dataset from.
							</p>
						</header>
						<div>
							{datsetMappings.map((data) => (
								<div
									className="dataset-container"
									style={{
										border:
											data.name === dataset.name
												? '1px solid #1890ff'
												: 'none',
										background:
											data.name === dataset.name
												? 'rgb(234, 245, 255)'
												: 'white',
									}}
									data-cy={data.id}
									key={data.id}
									onClick={() => handleSelect(data.name, data.count, data.id)}
								>
									<img
										src={data.url}
										alt={data.alt}
										style={{ height: '150px', width: '150px', margin: 20 }}
									/>
									<div>
										<h3>{data.name}</h3>
										<p>{data.description}</p>
									</div>
								</div>
							))}
						</div>
					</div>
					<footer>
						<div className="left-column">
							<a
								className="button has-icon"
								data-cy="submit-data-import"
								onClick={handleLayout}
							>
								Next &nbsp; <RightOutlined />
							</a>
						</div>
					</footer>
				</div>
			) : (
				sampleLayout()
			)}
		</div>
	);
}

selectDataset.propTypes = {
	setURL: PropTypes.func.isRequired,
	nextScreen: PropTypes.func,
	url: PropTypes.string,
};

selectDataset.defaultProps = {
	nextScreen: null,
	url: undefined,
};

export default selectDataset;
