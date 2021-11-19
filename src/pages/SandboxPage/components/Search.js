import React from 'react';
import PropTypes from 'prop-types';
import { Card, Button, Icon, Row, Col, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import debounce from 'lodash/debounce';
import { DataSearch, SelectedFilters } from '@appbaseio/reactivesearch';
import { css } from 'emotion';
import settingsMap from '../../../components/ReviewAndSave/helper';

export const highlighter = css`
	width: 6px;
	height: 6px;
	padding: 5px;
	border-radius: 50%;
	position: absolute;
	display: block;
	left: 50%;
	transform: translateX(-50%);
	background: #1890ff;
	bottom: -5px;
	margin: 0 !important;
	@keyframes grow {
		0% {
			transform: scale(0.95);
			box-shadow: 0 0 0 0 #1890ff;
		}

		70% {
			transform: scale(1);
			box-shadow: 0 0 0 5px rgba(0, 0, 0, 0);
		}

		100% {
			transform: scale(0.95);
			box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
		}
	}
	animation: grow 1s infinite ease;
`;

const searchStyle = css`
	.suggestions {
		z-index: 5;
	}
`;

const iconStyles = css`
	display: flex;
	align-items: center;
	padding: 10px;
	.icon-position {
		height: 20px;
		margin-right: 0.7rem;
		fill: rgb(112, 112, 112);
		position: relative;
	}
	.suggstion-position {
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
		width: 95%;
	}
	&:hover {
		cursor: pointer;
	}
`;

const suggestionsIcons = {
	popular: {
		alt: 'Popular icon',
		path: 'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z',
	},
	recent: {
		alt: 'Recent Icon',
		path: 'M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z',
	},
	index: {
		alt: 'Index Icon',
		path: 'M16.041 15.856c-0.034 0.026-0.067 0.055-0.099 0.087s-0.060 0.064-0.087 0.099c-1.258 1.213-2.969 1.958-4.855 1.958-1.933 0-3.682-0.782-4.95-2.050s-2.050-3.017-2.050-4.95 0.782-3.682 2.050-4.95 3.017-2.050 4.95-2.050 3.682 0.782 4.95 2.050 2.050 3.017 2.050 4.95c0 1.886-0.745 3.597-1.959 4.856zM21.707 20.293l-3.675-3.675c1.231-1.54 1.968-3.493 1.968-5.618 0-2.485-1.008-4.736-2.636-6.364s-3.879-2.636-6.364-2.636-4.736 1.008-6.364 2.636-2.636 3.879-2.636 6.364 1.008 4.736 2.636 6.364 3.879 2.636 6.364 2.636c2.125 0 4.078-0.737 5.618-1.968l3.675 3.675c0.391 0.391 1.024 0.391 1.414 0s0.391-1.024 0-1.414z',
	},
	promoted: {
		alt: 'Promoted Icon',
		path: 'M12 5.173l2.335 4.817 5.305.732-3.861 3.71.942 5.27-4.721-2.524-4.721 2.525.942-5.27-3.861-3.71 5.305-.733 2.335-4.817zm0-4.586l-3.668 7.568-8.332 1.151 6.064 5.828-1.48 8.279 7.416-3.967 7.416 3.966-1.48-8.279 6.064-5.827-8.332-1.15-3.668-7.569z',
	},
};
class Search extends React.Component {
	constructor(props) {
		super(props);
		const { search, isTypeahead } = props;
		this.state = {
			value: search ? search.value || search.defaultValue || '' : '',
			blur: true,
			isTypeahead,
		};
	}

	componentDidMount() {
		const { handleValueChange, search } = this.props;

		this.handleSearchDebounced = debounce(() => {
			const { value } = this.state;
			handleValueChange(search.id, value);
		}, 500);
	}

	shouldComponentUpdate(nextProps, nextState) {
		const { app, search, isTypeahead } = this.props;
		const { value } = this.state;

		if (
			app === nextProps.app &&
			JSON.stringify(search) === JSON.stringify(nextProps.search) &&
			nextState.value === value &&
			isTypeahead === nextProps.isTypeahead
		) {
			return false;
		}
		return true;
	}

	componentDidUpdate(prevProps) {
		const { isTypeahead } = this.props;

		if (isTypeahead !== prevProps.isTypeahead) {
			// eslint-disable-next-line react/no-did-update-set-state
			this.setState({ isTypeahead });
		}
	}

	handleChange = (value) => {
		this.setState(
			{
				value,
			},
			this.handleSearchDebounced,
		);
	};

	render() {
		const { app, search, handleModal, onValueChange, fetchResults, page } = this.props;
		const { value, blur, isTypeahead } = this.state;
		return (
			<Card>
				<Row type="flex" gutter={8} align="middle" justify="space-between">
					<Col xs={page === 'rules' ? 24 : 20}>
						{search.dataField && search.dataField.length ? (
							<DataSearch
								{...search}
								autosuggest
								enablePredictiveSuggestions
								value={value}
								onChange={this.handleChange}
								componentId={search.id}
								innerClass={{
									list: 'suggestions',
								}}
								className={searchStyle}
								onKeyDown={(e, triggerQuery) => {
									if (isTypeahead) {
										if (e.key === 'Enter') {
											triggerQuery();
										} else {
											fetchResults(false);
										}
									} else {
										fetchResults(false);
										triggerQuery();
									}
								}}
								onFocus={() => {
									this.setState({
										blur: false,
									});
								}}
								onBlur={() => {
									fetchResults(true);
									this.setState({
										blur: true,
									});
								}}
								onValueSelected={onValueChange}
								render={({ rawData, downshiftProps }) => {
									const suggestionsArr = rawData?.hits?.hits;
									if (
										suggestionsArr?.length &&
										isTypeahead &&
										downshiftProps.isOpen
									) {
										return (
											<div
												style={{
													display: blur ? 'none' : 'block',
													position: 'absolute',
													color: '#424242',
													fontSize: '0.9rem',
													border: '1px solid #ddd',
													background: 'white',
													borderRadius: 2,
													marginTop: 0,
													width: '100%',
													overflowY: 'scroll',
													zIndex: 10,
													maxHeight: '100vh',
													boxShadow: '0 2px 4px #d9d9d9',
												}}
											>
												{suggestionsArr.map(
													(suggestion, index) =>
														suggestion.label && (
															<div
																css={iconStyles}
																style={{
																	background:
																		index ===
																		downshiftProps.highlightedIndex
																			? '#eee'
																			: 'transparent',
																}}
																key={`${suggestion._id}-${index}`} // eslint-disable-line react/no-array-index-key
															>
																<svg
																	className="icon-position"
																	xmlns="http://www.w3.org/2000/svg"
																	alt={
																		suggestionsIcons[
																			suggestion
																				._suggestion_type
																		].alt || 'Index Icon'
																	}
																	viewBox="0 0 24 24"
																	style={{
																		height:
																			suggestion._suggestion_type ===
																			'index'
																				? '18px'
																				: '20px',
																	}}
																>
																	<path
																		d="M0 0h24v24H0z"
																		fill="none"
																	/>
																	<path
																		d={
																			suggestionsIcons[
																				suggestion
																					._suggestion_type
																			].path ||
																			'M16.041 15.856c-0.034 0.026-0.067 0.055-0.099 0.087s-0.060 0.064-0.087 0.099c-1.258 1.213-2.969 1.958-4.855 1.958-1.933 0-3.682-0.782-4.95-2.050s-2.050-3.017-2.050-4.95 0.782-3.682 2.050-4.95 3.017-2.050 4.95-2.050 3.682 0.782 4.95 2.050 2.050 3.017 2.050 4.95c0 1.886-0.745 3.597-1.959 4.856zM21.707 20.293l-3.675-3.675c1.231-1.54 1.968-3.493 1.968-5.618 0-2.485-1.008-4.736-2.636-6.364s-3.879-2.636-6.364-2.636-4.736 1.008-6.364 2.636-2.636 3.879-2.636 6.364 1.008 4.736 2.636 6.364 3.879 2.636 6.364 2.636c2.125 0 4.078-0.737 5.618-1.968l3.675 3.675c0.391 0.391 1.024 0.391 1.414 0s0.391-1.024 0-1.414z'
																		}
																	/>
																</svg>
																<div
																	className="suggstion-position"
																	{...downshiftProps.getItemProps(
																		{ item: suggestion },
																	)}
																	dangerouslySetInnerHTML={{
																		__html: suggestion.label,
																	}}
																/>
															</div>
														),
												)}
											</div>
										);
									}
									return null;
								}}
							/>
						) : (
							<div
								style={{
									width: '100%',
									height: '100%',
									background: 'rgba(255,255,255,0.6)',
									zIndex: 2,
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
								}}
							>
								Set searchable fields to enable search.
							</div>
						)}
					</Col>
					{page !== 'rules' && (
						<Col xs={4}>
							<Link
								onClick={
									window.location.pathname === `/app/${app}/search`
										? handleModal
										: null
								}
								to={`/app/${app}/search`}
							>
								<Tooltip title={settingsMap.set_search.description}>
									<Button size="large" ghost type="primary">
										<Icon type="edit" />
										{settingsMap.set_search.title}
									</Button>
								</Tooltip>
								{search.dataField && search.dataField.length ? null : (
									<span className={highlighter} />
								)}
							</Link>
						</Col>
					)}
					<Col xs={24}>
						<SelectedFilters />
					</Col>
				</Row>
			</Card>
		);
	}
}

Search.propTypes = {
	search: PropTypes.object,
	app: PropTypes.string.isRequired,
	handleValueChange: PropTypes.func,
	handleModal: PropTypes.func,
	onValueChange: PropTypes.func.isRequired,
	isTypeahead: PropTypes.bool,
	fetchResults: PropTypes.func.isRequired,
	page: PropTypes.string,
};

Search.defaultProps = {
	search: {},
	handleValueChange: () => {},
	handleModal: () => {},
	isTypeahead: false,
	page: '',
};

export default Search;
