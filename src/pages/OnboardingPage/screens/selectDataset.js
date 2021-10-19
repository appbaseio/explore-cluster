/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import Footer from '../components/Footer';
import { Icon } from 'antd';
import PropTypes from 'prop-types';
import Loader from '../components/Loader';
import parser from 'url-parser-lite';
import appbaseHelpers from '../utils/appbaseHelpers';
import { moviesJson } from '../utils/sampleData/moviesData';
import { geoJson } from '../utils/sampleData/geoData';
import { ecommJson } from '../utils/sampleData/ecommData';

const datsetMappings = [
	{
		id: 'movies',
		name: 'Movies Dataset',
		description:
			'A dataset of 10,000 movies obtained from TMDB. This is ideal to experiment with SaaS and E-Commerce use-cases.',
		url:
			'http://img5a.flixcart.com/image/keyboard/tablet-keyboard/r/z/y/couponsmall-key-343-original-imaefv2emhpp3tku.jpeg',
		alt: 'movies-image',
		count: '10,000'
	},
	{
		id: 'products',
		name: 'Products Dataset',
		description:
			'A dataset of 1,500 e-commerce products. This is ideal to experiment with E-Commerce use-cases and aggregator use-cases.',
		url:
			'http://img5a.flixcart.com/image/keyboard/tablet-keyboard/r/z/y/couponsmall-key-343-original-imaefv2emhpp3tku.jpeg',
		alt: 'products-image',
		count: '1,500',
	},
	{
		id: 'geo',
		name: 'Geo Dataset',
		description:
			'A dataset of 3,500 eathquake samples. This is ideal to experiment with E-Commerce use-cases and aggregator use-cases.',
		url:
			'http://img5a.flixcart.com/image/keyboard/tablet-keyboard/r/z/y/couponsmall-key-343-original-imaefv2emhpp3tku.jpeg',
		alt: 'geo-image',
		count: '3,500'
	},
];


function selectDataset({ nextScreen, setURL, url: newUrl }) {
	const [dataset, setDataSet] = useState({ name: 'Movies Dataset', count: '10,000' });
    const [layout, setLayout] = useState(0);
    const [url,saveUrl] = useState(newUrl);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('Applying relevant settings...');

    function handleSelect(name, count) {
		setDataSet({
			name,
			count
		});
	}

	function setMapping() {
        setLoading(true);
        appbaseHelpers
			.applyAnalyzers()
			.then(() => {
                setStatus('Preparing the database configuration...')
			})
			.then(appbaseHelpers.updateMapping)
			.then(() => {
                setStatus('Indexing === data of === records... Almost done!')
			})
			.then(appbaseHelpers.indexData)
			.then(() => {
                setStatus('Loading data browser... Hang tight!')
			})
			.then(() => {
				appbaseHelpers.createURL(handleUrl);
			})
			.catch((e) => {
				if (
					e._bodyInit ===
					'{"error":{"root_cause":[{"type":"parse_exception","reason":"request body is required"}],"type":"parse_exception","reason":"request body is required"},"status":400}'
				) {
					appbaseHelpers.createURL(handleUrl);
				}
				console.log('@error-at-importing-data', e);
				console.log('@error-at-importing-data-response-type', typeof e);
				console.log('error', e);
			});
    }

	function hideLoader() {
        setStatus('');
        setLoading(false);
    }

	function jsonBlock() {
		if(dataset.name === 'Movies Dataset') {
			return moviesJson;
		} else if(dataset.name === 'Products Dataset') {
			return ecommJson;
		} else {
			return geoJson;
		}
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
        )
    }

	function handleUrl(url) {
        saveUrl(url);
        setURL(url);
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
			{
				layout === 0 ? (
					<div className="wrapper">
						<div>
							<img src="/static/images/onboarding/Create.svg" alt="create app" />
						</div>
						<div className="content">
							<header>
								<h2>Choose a sample dataset to import from</h2>
								<p>
									We will be using the appbase.io dashboard to import this dataset from.
								</p>
							</header>
							<div>
								{datsetMappings.map((data) => (
									<div
										style={{
											width: '100%',
											marginBottom: '15px',
											display: 'flex',
											background: 'white',
											border: data.name === dataset.name ? '1px solid #1890ff' : 'none',
											// background: '#e4f0fb
										}}
										onClick={() => handleSelect(data.name, data.count)}
									>
										<img
											src={data.url}
											alt={data.alt}
											style={{ height: '150px', width: '150px' }}
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
									Next &nbsp; <Icon type="right" theme="outlined" />
								</a>
							</div>
						</footer>
					</div>
				) : sampleLayout()
			}
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
