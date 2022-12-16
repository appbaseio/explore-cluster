import React from 'react';
import PropTypes from 'prop-types';
import { EditOutlined } from '@ant-design/icons';
import { Card, Button, Row, Col, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import { SearchBox, SelectedFilters } from '@appbaseio/reactivesearch';
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

class Search extends React.Component {
	constructor(props) {
		super(props);
		const { search } = props;
		this.state = {
			value: search ? search.value || search.defaultValue || '' : '',
		};
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

	handleChange = (value) => {
		this.setState({ value });
	};

	render() {
		const { app, search, handleModal, onValueChange, page, handleValueChange, isTypeahead } =
			this.props;
		const { value } = this.state;

		return (
			<Card>
				<Row type="flex" gutter={8} align="middle" justify="space-between">
					<Col xs={page === 'rules' ? 24 : 20}>
						{search.dataField && search.dataField.length ? (
							<SearchBox
								{...search}
								autosuggest={isTypeahead}
								enablePopularSuggestions={isTypeahead}
								enableRecentSuggestions={isTypeahead}
								enablePredictiveSuggestions={isTypeahead}
								value={value}
								onChange={(valueParam, triggerQuery) => {
									this.handleChange(valueParam);
									handleValueChange(search.id, valueParam);
									if (!isTypeahead) triggerQuery();
								}}
								componentId={search.id}
								innerClass={{
									list: 'suggestions',
								}}
								className={searchStyle}
								onValueSelected={onValueChange}
								debounce={50}
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
						<Col xs={4} style={{ paddingBottom: 14 }}>
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
										<EditOutlined />
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
