import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { array, func, string } from 'prop-types';
import { Button, Select, Tag, Tooltip } from 'antd';
import orderBy from 'lodash/orderBy';
import get from 'lodash/get';
import { suggestionStyles } from '../SearchN/Wizard/styles';
import { getPermission } from '../../../batteries/modules/actions';
import ErrorToaster from '../../../batteries/components/shared/ErrorToaster';
import CreateCredentials from '../../../components/CreateCredentials';

const CredentialsModal = ({ value, onChange, permissions, fetchPermissions }) => {
	const [showForm, setShowForm] = useState(false);
	const [currentPermissionInfo, setCurrentPermissionInfo] = useState(undefined);
	const [mode, setMode] = useState('create');

	useEffect(() => {
		fetchPermissions();
	}, []);

	const handleCancel = () => {
		setShowForm(false);
		setMode('create');
	};

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
					minWidth: 500,
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
							<div className={suggestionStyles}>
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
									<Tag>
										{permission.ops[0]}{' '}
										{permission.ops[1] ? `& ${permission.ops[1]}` : ''}
									</Tag>
								</div>
								<div className="row-data">
									<Button
										type="link"
										style={{ padding: 0 }}
										onClick={() => {
											setMode('view');
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
			<ErrorToaster inline>
				<CreateCredentials
					titleText={mode === 'create' ? 'Create Credentials' : 'View Access Details'}
					show={showForm}
					handleCancel={() => handleCancel()}
					initialValues={currentPermissionInfo}
					readOnly={mode !== 'create'}
				/>
			</ErrorToaster>
		</>
	);
};

CredentialsModal.defaultProps = {
	value: '',
	onChange: () => {},
};

CredentialsModal.propTypes = {
	value: string,
	onChange: func,
	permissions: array.isRequired,
	fetchPermissions: func.isRequired,
};

const mapStateToProps = (state) => {
	const appPermissions = get(state, '$getAppPermissions.results.default');
	return {
		permissions: get(appPermissions, 'results', []),
	};
};

const mapDispatchToProps = (dispatch) => ({
	fetchPermissions: (appName) => dispatch(getPermission(appName)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CredentialsModal);
