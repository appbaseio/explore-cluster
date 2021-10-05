import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';

import SearchApp from './SearchApp';
import Footer from '../components/Footer';

export default class Search extends Component {
	state = {
		error: '',
		// eslint-disable-next-line react/destructuring-assignment
		selectedOption: this.props.facetFields.map((item) => ({ label: item, value: item })) || [],
	};

	handleChange = (selectedOption) => {
		this.setState({ selectedOption });
	};

	setError = (e) => {
		if (this.interval) clearInterval(this.interval);
		this.setState(
			{
				error: e,
			},
			() => {
				this.interval = setTimeout(() => {
					this.setState({ error: '' });
				}, 5000);
			},
		);
	};

	handleChange = (selectedOption) => {
		if (!selectedOption.length) {
			this.setError('There should be at least one field set for aggregation.');
		} else {
			this.setState({
				selectedOption,
				error: '',
			});
			const values = selectedOption.map((item) => item.value);
			const { setFacetFields } = this.props;
			setFacetFields(values);
		}
	};

	renderSearchApp = () => {
		const { searchFields, facetFields } = this.props;
		return (
			<div>
				{this.renderFacetInput(true)}
				<SearchApp fields={searchFields} facets={facetFields} />
			</div>
		);
	};

	renderFacetInput = (horizontal) => {
		const { error, selectedOption } = this.state;
		return (
			<div className={`search-field-container ${horizontal ? 'full-row' : ''}`}>
				<div>
					<h3>Set Aggregation Fields</h3>
					<p>
						Select the fields you want to set to be of Aggregation kind. They will be
						updated dynamically in the UI.
					</p>
				</div>
				<div className="input-wrapper" data-cy="aggregation-fields">
					<Select
						name="form-field-name"
						value={selectedOption}
						onChange={this.handleChange}
						placeholder="Select aggregation fields"
						isMulti
						inputId="searchable-aggergation-field"
						isClearable={false}
						options={[
							{
								value: 'release_date',
								label: 'release_date',
							},
							{
								value: 'genres',
								label: 'genres',
							},
							{
								value: 'vote_average',
								label: 'vote_average',
							},
						]}
					/>
				</div>
				{error && (
					<p
						style={{
							marginTop: 15,
							color: 'tomato',
						}}
					>
						{error}
					</p>
				)}
			</div>
		);
	};

	render() {
		const { nextScreen, app, previousScreen, facetFields } = this.props;
		return (
			<div>
				<div className="wrapper">
					<div>
						<img src="/static/images/onboarding/Aggregation.svg" alt="aggregations" />
					</div>
					<div className="content">
						<header>
							<h2>Set aggregation fields</h2>
							<p>
								Similarly, we can also set certain fields to be of{' '}
								<strong>Aggregation</strong> kind. These fields will be indexed into
								data-structures that are optimized for performing computations and
								sorting functionalites.
							</p>
							<p>
								We will start by letting you set some
								<strong>Aggregation</strong> fields.
							</p>
						</header>
						{facetFields.length ? null : this.renderFacetInput()}
					</div>
				</div>

				{facetFields.length ? this.renderSearchApp() : null}

				{/* <Footer
					nextScreen={this.props.nextScreen}
					previousScreen={this.props.previousScreen}
					disabled={!this.props.facetFields.length}
				/> */}
				<Footer
					nextScreen={nextScreen}
					previousScreen={previousScreen}
					disabled={!facetFields.length}
					label="Finish"
					app={app}
				/>
			</div>
		);
	}
}

Search.propTypes = {
	nextScreen: PropTypes.func,
	app: PropTypes.string.isRequired,
	previousScreen: PropTypes.func,
	facetFields: PropTypes.array,
	searchFields: PropTypes.array,
	setFacetFields: PropTypes.func.isRequired,
};

Search.defaultProps = {
	nextScreen: null,
	previousScreen: null,
	facetFields: [],
	searchFields: [],
};
