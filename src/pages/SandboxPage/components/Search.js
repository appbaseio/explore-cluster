import React from 'react';
import PropTypes from 'prop-types';
import { Card, Button, Icon, Row, Col, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import { debounce } from 'lodash';
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

class Search extends React.Component {
	constructor(props) {
		super(props);
		const { search } = props;
		this.state = {
			value: search ? search.value || search.defaultValue || '' : '',
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
		const { app, search } = this.props;
		const { value } = this.state;

		if (
			app === nextProps.app &&
			JSON.stringify(search) === JSON.stringify(nextProps.search) &&
			nextState.value === value
		) {
			return false;
		}
		return true;
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
		const { app, search, handleModal, onValueChange } = this.props;
		const { value } = this.state;
		console.log(value);
		return (
			<Card>
				<Row type="flex" gutter={8} align="middle" justify="space-between">
					<Col xs={20}>
						{search.dataField && search.dataField.length ? (
							<DataSearch
								{...search}
								autosuggest
								value={value}
								onChange={this.handleChange}
								componentId={search.id}
								innerClass={{
									list: 'suggestions',
								}}
								className={searchStyle}
								onKeyDown={(e, triggerQuery) => {
									if (e.key === 'Enter') {
										triggerQuery();
									}
								}}
								onValueSelected={onValueChange}
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
};

Search.defaultProps = {
	search: {},
	handleValueChange: () => {},
	handleModal: () => {},
};

export default Search;
