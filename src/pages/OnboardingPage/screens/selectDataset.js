import React, { useState } from 'react';
import Footer from '../components/Footer';

const datsetMappings = [
	{
		id: 'movies',
		name: 'Movies Dataset',
		description:
			'A dataset of 10,000 movies obtained from TMDB. This is ideal to experiment with SaaS and E-Commerce use-cases.',
		url:
			'http://img5a.flixcart.com/image/keyboard/tablet-keyboard/r/z/y/couponsmall-key-343-original-imaefv2emhpp3tku.jpeg',
		alt: 'movies-image',
	},
	{
		id: 'products',
		name: 'Products Dataset',
		description:
			'A dataset of 1,500 e-commerce products. This is ideal to experiment with E-Commerce use-cases and aggregator use-cases.',
		url:
			'http://img5a.flixcart.com/image/keyboard/tablet-keyboard/r/z/y/couponsmall-key-343-original-imaefv2emhpp3tku.jpeg',
		alt: 'products-image',
	},
	{
		id: 'geo',
		name: 'Geo Dataset',
		description:
			'A dataset of 3,500 eathquake samples. This is ideal to experiment with E-Commerce use-cases and aggregator use-cases.',
		url:
			'http://img5a.flixcart.com/image/keyboard/tablet-keyboard/r/z/y/couponsmall-key-343-original-imaefv2emhpp3tku.jpeg',
		alt: 'geo-image',
	},
];

function selectDataset({ nextScreen }) {
	const [dataset, setDataSet] = useState('movie');

	function handleSelect(id) {
		setDataSet(id);
	}

	return (
		<div>
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
									border: data.id === dataset ? '1px solid #1890ff' : 'none',
									// background: '#e4f0fb
								}}
								onClick={() => handleSelect(data.id)}
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
			</div>
			<Footer nextScreen={nextScreen} />
		</div>
	);
}

export default selectDataset;
