import React, { useEffect, useState } from 'react';
import { get, orderBy } from 'lodash';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Select, Tag, Tooltip } from 'antd';
import { css } from 'emotion';
import moment from 'moment';
import { getPermission } from '../../../batteries/modules/actions';
import CreateCredentials from '../../../components/CreateCredentials';

const CredentialsSelector = ({ value, onChange, permissions, fetchPermissions, selectStyle }) => {
	const [showForm, setShowForm] = useState(false);
	const [currentPermissionInfo, setCurrentPermissionInfo] = useState(undefined);

	useEffect(() => {
		fetchPermissions();
	}, []);

	const sortedByUpdatedAt = orderBy(
		permissions,
		(a) => {
			const timestamp = a.updated_at || a.created_at;
			const timeInMilliSecondsSinceEpoch = new Date(timestamp).valueOf();
			return timeInMilliSecondsSinceEpoch;
		},
		['desc'],
	);
	return (
		<>
			<Select
				value={value || undefined}
				showSearch
				placeholder="Choose an existing API credential"
				style={{
					minWidth: 300,
					width: '100%',
					...selectStyle,
				}}
				optionLabelProp="value"
				onSelect={(val) => {
					onChange(val);
				}}
				optionFilterProp="children"
				filterOption={(input, option) =>
					option.props.title.toLowerCase().indexOf(input.toLowerCase()) >= 0
				}
			>
				{sortedByUpdatedAt.map((permission) => {
					const timestamp = permission.updated_at || permission.created_at;
					const timeInSecondsSinceEpoch = new Date(timestamp).valueOf() / 1000;

					return (
						<Select.Option
							key={`${permission.username}-${permission.password}`}
							value={`${permission.username}:${permission.password}`}
							title={permission.description}
						>
							<div
								css={css`
									.row-data {
										display: flex;
										justify-content: space-between;
									}
									.overflow {
										max-width: 400px;
										text-overflow: ellipsis;
										overflow: hidden;
										white-space: no-wrap;
									}
								`}
							>
								<div className="row-data">
									<div
										className="overflow"
										style={{
											maxWidth: '400px',
											textOverflow: 'ellipsis',
											overflow: 'hidden',
											whiteSpace: 'no-wrap',
										}}
									>
										<Tooltip title={permission.description}>
											{permission.description}
										</Tooltip>
									</div>
									<Tag>{permission.ops[0]}</Tag>
								</div>
								<div className="row-data">
									<Button
										type="link"
										style={{
											padding: 0,
										}}
										onClick={() => {
											setShowForm(true);
											setCurrentPermissionInfo(permission);
										}}
									>
										View access details
									</Button>
									<>
										{moment
											.unix(timeInSecondsSinceEpoch)
											.format('ddd DD MMM, hh:mm A') || 'NA'}
									</>
								</div>
							</div>
						</Select.Option>
					);
				})}
			</Select>
			<CreateCredentials
				titleText="View Access Details"
				onSubmit={() => {}}
				show={showForm}
				handleCancel={() => {
					setShowForm(false);
				}}
				initialValues={currentPermissionInfo}
				readOnly
			/>
		</>
	);
};
CredentialsSelector.defaultProps = {
	value: undefined,
	selectStyle: {},
};
CredentialsSelector.propTypes = {
	value: PropTypes.string,
	onChange: PropTypes.func.isRequired,
	permissions: PropTypes.array.isRequired,
	fetchPermissions: PropTypes.func.isRequired,
	selectStyle: PropTypes.object,
};

const mapStateToProps = (state) => {
	const appPermissions = get(state, '$getAppPermissions.results.default');
	const defaultState = {
		permissions: get(appPermissions, 'results', []),
	};

	return defaultState;
};

const mapDispatchToProps = (dispatch) => ({
	fetchPermissions: (appName) => dispatch(getPermission(appName)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CredentialsSelector);
