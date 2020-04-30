import React from 'react';
import { Card, Button, Icon, Row, Col, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
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

const Search = (props) => {
	const { app, search } = props;
	return (
		<Card>
			<Row type="flex" gutter={8} align="middle" justify="space-between">
				<Col xs={20}>
					{search.dataField && search.dataField.length ? null : (
						<div
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
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
					<DataSearch {...search} autosuggest componentId={search.id} />
				</Col>
				<Col xs={4}>
					<Link to={`/app/${app}/search`}>
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
};

export default Search;
