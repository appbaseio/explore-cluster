import React from 'react';
import { FieldGroup, FieldControl } from 'react-reactive-form';
import { Input, Select } from 'antd';
import { currencies } from '../../utils';

const { Option } = Select;

const StoreInfo = () => (
	<FieldGroup name="storeInfo">
		{() => (
			<div css={{ maxWidth: 500, marginTop: 20 }}>
				<h2>Store Info</h2>
				<div css={{ display: 'grid', gridGap: 10 }}>
					<div>
						Locale:
						<FieldControl
							name="locale"
							render={({ handler }) => (
								<Input
									name="locale"
									placeholder="Input your locale"
									{...handler()}
									css={{ marginTop: 5 }}
								/>
							)}
						/>
					</div>
					<div>
						<FieldControl
							name="currency"
							render={({ handler }) => (
								<Select
									showSearch
									placeholder="Select your currency"
									optionFilterProp="children"
									{...handler()}
									filterOption={(input, option) =>
										option.props.children
											.toLowerCase()
											.indexOf(input.toLowerCase()) >= 0
									}
									css="width: 100%"
								>
									{currencies.map((country) => (
										<Option key={country.cc} value={country.cc}>
											{`${country.symbol} (${country.name})`}
										</Option>
									))}
								</Select>
							)}
						/>
					</div>
				</div>
			</div>
		)}
	</FieldGroup>
);

export default StoreInfo;
