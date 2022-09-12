import React, { useEffect, useState } from 'react';
import { Tabs } from 'antd';
import { array, object, string } from 'prop-types';
import { FieldGroup } from 'react-reactive-form';
import DefaultResults from './DefaultResults';

const { TabPane } = Tabs;

const TabLayout = ({ values, form, pipeline }) => {
	const [activeKey, setActiveKey] = useState('_default');
	useEffect(() => {
		if (values.length) setActiveKey(`${values[values.length - 1]}-${values.length - 1}`);
		else setActiveKey('_default');
	}, [values]);

	return (
		<div style={{ padding: 20 }}>
			<FieldGroup
				control={form.get('displayFields')}
				strict={false}
				render={() => {
					return (
						<Tabs
							defaultActiveKey="_default"
							activeKey={activeKey}
							style={{ minHeight: 300 }}
							onTabClick={(tab) => setActiveKey(tab)}
						>
							{(values || []).map((tab, idx) => (
								// eslint-disable-next-line
								<TabPane tab={tab} key={`${tab}-${idx}`}>
									<FieldGroup
										name={tab}
										strict={false}
										render={() => <DefaultResults pipeline={pipeline} />}
									/>
								</TabPane>
							))}

							<TabPane tab="Default" key="_default">
								<FieldGroup
									name="_default"
									strict={false}
									render={() => <DefaultResults pipeline={pipeline} />}
								/>
							</TabPane>
						</Tabs>
					);
				}}
			/>
		</div>
	);
};

TabLayout.propTypes = {
	values: array,
	form: object.isRequired,
	pipeline: string,
};

TabLayout.defaultProps = {
	values: [],
	pipeline: undefined,
};

export default TabLayout;
