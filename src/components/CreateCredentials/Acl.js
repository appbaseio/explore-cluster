import React from 'react';
import PropTypes from 'prop-types';
import { Table, Checkbox, Input, Tooltip, Icon } from 'antd';
import get from 'lodash/get';
import { FieldControl } from 'react-reactive-form';
import { aclOptionsLabel, aclOptionsMessage } from './utils';

// Custom acls tabular view
class Acl extends React.PureComponent {
	constructor(props) {
		super(props);
		this.dataSource = get(props, 'control.controls', []).map((groupCtrl) => ({
			key: groupCtrl.get('acl').value,
			Tag: () => (
				<FieldControl
					control={groupCtrl.get('tag')}
					render={({ handler }) => <Checkbox {...handler('checkbox')} />}
				/>
			),
			RateLimit: () =>
				groupCtrl.get('rateLimit') ? (
					<FieldControl
						control={groupCtrl.get('rateLimit')}
						render={({ handler, invalid }) => (
							<Input
								className={invalid ? 'input-error' : null}
								min="1"
								type="number"
								{...handler()}
							/>
						)}
					/>
				) : null,
		}));
		this.columns = [
			{
				title: 'Category',
				dataIndex: 'key',
				render: (item) => (
					<span>
						{aclOptionsLabel[item]}
						<Tooltip
							css="margin-left: 5px;color:#898989"
							overlay={aclOptionsMessage[item]}
							placement="rightTop"
						>
							<Icon type="info-circle" theme="outlined" />
						</Tooltip>
					</span>
				),
				key: 'key',
			},
			{
				title: 'Enabled',
				render: ({ Tag }) => <Tag />,
				key: 'tags',
			},
		];
		if (props.isRateLimitPresent) {
			this.columns.push({
				title: 'Rate Limit / sec',
				render: ({ RateLimit }) => <RateLimit />,
				key: 'rate limit',
			});
		}
	}

	render() {
		return (
			<Table
				scroll={{ y: 200 }}
				style={{
					width: '100%',
				}}
				pagination={false}
				dataSource={this.dataSource}
				columns={this.columns}
			/>
		);
	}
}

Acl.defaultProps = {
	isRateLimitPresent: true,
	control: {},
};

Acl.propTypes = {
	isRateLimitPresent: PropTypes.bool,
	control: PropTypes.object,
};

export default Acl;
