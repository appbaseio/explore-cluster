import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { DownloadOutlined, EditOutlined, DeleteOutlined, LoadingOutlined } from '@ant-design/icons';
import { Button, Card, Col, message, notification, Row, Tooltip } from 'antd';
import { css } from 'emotion';
import { connect } from 'react-redux';
import moment from 'moment';
import { Link } from 'react-router-dom';
import DeleteModal from '../../../components/DeleteModal';

import { removeSearchBox } from '../../../batteries/modules/actions';
import CloneSearchBox from './CloneSearchBox';
import MobileMenu from './MobileMenu';
import ExportSearchBoxCode from './ExportSearchBoxCode';

const title = css`
	font-size: 16px;
	color: rgba(0, 0, 0, 0.85);
	margin: 0;
	font-weight: bold;
	display: flex;

	& > span {
		max-width: 300px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: grey;
	}
`;

const description = css`
	color: rgba(0, 0, 0, 0.65);
	font-size: 14px;
	margin: 0;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

const actions = css`
	margin-left: auto;
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	justify-content: flex-end;
	width: max-content;
	width: 100%;
	gap: 5px;
	button:not(:first-child),
	a {
		margin-left: 5px;
	}
	@media (max-width: 1024px) {
		button {
			margin-top: 5px;
		}
	}
`;

const mobileMenu = css`
	display: none;
	@media (max-width: 992px) {
		display: block;
		position: absolute;
		top: 0;
		right: 0;
		z-index: 1;
	}
`;

const card = css`
	.show-on-hover {
		transform: rotateX(90deg);
		opacity: 0;
		transition: all ease 0.3s;
	}
	&:hover {
		.show-on-hover {
			transform: rotateX(0deg);
			opacity: 1;
		}
	}
	.ant-input-number-handler-wrap {
		display: none;
	}

	.date-column {
		padding-left: 1.5rem !important;
		margin-right: 1rem;
		@media (max-width: 992px) {
			padding-left: 4px !important;
			float: left;
			width: max-content;
		}
		p {
			margin: 0px auto;
			font-size: 14px;
			&:first-child {
				margin-top: 0;
			}
		}
	}

	.usage-alert {
		padding: 3px 10px 3px 30px;

		i {
			top: 7.5px;
			left: 10px;
		}
	}
	.view-logs-btn {
		height: max-content;
		span {
			text-decoration: underline;
			font-weight: 600;
			font-size: 14px;
		}
	}
`;

// const overflow = { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };

const SearchBoxCard = (props) => {
	const { deleteSearchBox, showEdit, showExport, searchBoxItem } = props;

	const [showExportCode, setShowExportCode] = useState(false);
	const actionButtonSize = window.innerWidth < 1090 ? 'small' : 'default';

	const handleExport = () => {
		setShowExportCode(true);
	};

	const getCreatedUpdatedStats = () => {
		if (searchBoxItem.updated_at) {
			return (
				<div>
					<p style={{ width: 'max-content' }}>
						Updated:{' '}
						{moment.unix(searchBoxItem.updated_at).format('ddd D MMM, hh:mm A')}
					</p>
				</div>
			);
		}
		if (searchBoxItem.created_at) {
			return (
				<div>
					<p style={{ width: 'max-content' }}>
						Created:{' '}
						{moment.unix(searchBoxItem.created_at).format('ddd D MMM, hh:mm A')}
					</p>
				</div>
			);
		}
		return null;
	};
	return (
		<>
			<Card
				hoverable
				className={card}
				style={{
					background: 'white',
				}}
			>
				<Row style={{ position: 'relative' }} gutter={8}>
					<div className={mobileMenu}>
						<MobileMenu
							searchBoxItem={searchBoxItem}
							removeSearchBox={deleteSearchBox}
							onExportCode={handleExport}
						/>
					</div>

					<Col xl={8} lg={8} md={14} sm={24}>
						<h4 className={title}>
							<Tooltip title={searchBoxItem.id}>{searchBoxItem.id}</Tooltip>
						</h4>

						<p className={description}>
							<Tooltip title={searchBoxItem.description} placement="topLeft">
								{searchBoxItem.description}
							</Tooltip>
						</p>
					</Col>
					<Col lg={8} md={12} sm={24} className="date-column">
						{getCreatedUpdatedStats()}
					</Col>
					<Col xl={7} lg={7} xs={0} style={{ float: 'right' }}>
						<div className={actions}>
							<DeleteModal
								name="searchbox"
								value={searchBoxItem.id}
								title="Delete Searchbox"
								onDelete={() => {
									deleteSearchBox(searchBoxItem.id).then((res) => {
										if (res?.error) {
											notification.error({
												message: 'Error',
												description: res.error?.actual
													? res.error?.actual?.message
													: res.error?.message,
											});
										} else if (res.payload) {
											message.success('Searchbox successfully deleted');
											// means the current page is edit page
											if (!showEdit) {
												// history.push('/cluster/pipelines');
											}
										}
									});
								}}
							>
								{({ handleModal }) => (
									<div
										className="show-on-hover"
										style={{
											marginRight: 10,
											marginBottom: 3,
											color: '#999',
										}}
										onClick={handleModal}
									>
										{searchBoxItem.isDeleting ? (
											<LoadingOutlined />
										) : (
											<DeleteOutlined />
										)}{' '}
										Delete
									</div>
								)}
							</DeleteModal>{' '}
							{showEdit && (
								<Link to={`/cluster/searchboxes/${searchBoxItem.id}`}>
									<Tooltip title="Edit Searchbox">
										<Button size={actionButtonSize} type="primary">
											<EditOutlined /> Edit{' '}
										</Button>
									</Tooltip>
								</Link>
							)}
							{showExport && (
								<Tooltip title="Export Searchbox">
									{' '}
									<Button
										onClick={handleExport}
										size={actionButtonSize}
										type="primary"
									>
										<DownloadOutlined />
									</Button>
								</Tooltip>
							)}
							<Tooltip title="Clone Searchbox">
								<CloneSearchBox
									searchBox={searchBoxItem}
									buttonSize={actionButtonSize}
								/>
							</Tooltip>
						</div>
					</Col>
				</Row>
			</Card>
			<ExportSearchBoxCode
				visible={showExportCode}
				onCancel={() => setShowExportCode(false)}
				searchBoxId={searchBoxItem.id}
			/>
		</>
	);
};

SearchBoxCard.defaultProps = {
	searchBoxItem: {},
	showEdit: true,
	showExport: false,
};

SearchBoxCard.propTypes = {
	searchBoxItem: PropTypes.object,
	deleteSearchBox: PropTypes.func.isRequired,
	showEdit: PropTypes.bool,
	showExport: PropTypes.bool,
};

const mapStateToProps = () => {
	return {};
};

const mapDispatchToProps = (dispatch) => ({
	deleteSearchBox: (id) => dispatch(removeSearchBox(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchBoxCard);
