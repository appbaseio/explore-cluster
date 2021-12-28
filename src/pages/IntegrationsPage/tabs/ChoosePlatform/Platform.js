import React from 'react';
import { bool, string } from 'prop-types';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { Switch, Radio, List, Button } from 'antd';
import { FieldControl, FieldGroup } from 'react-reactive-form';
import { getResyncURL, defaultSettings } from '../../utils';

const { Item } = List;

const Platform = ({ isRecommendation, index }) => (
	<div>
		<h2>Choose E-Commerce Platform</h2>
		<p>Choosing an E-Commerce Platform provides specific installation steps</p>
		<FieldGroup name="exportSettings">
			{() => (
				<div>
					<FieldControl name="type">
						{(control) => (
							<Radio.Group
								{...control.handler()}
								onChange={(value) => {
									control.markAsTouched();
									control.handler().onChange(value);
								}}
							>
								<Radio value="shopify">Shopify</Radio>
								<Radio value="other">
									Other (Wordpress, Magento, Big Commerce, others)
								</Radio>
							</Radio.Group>
						)}
					</FieldControl>
				</div>
			)}
		</FieldGroup>
		{!isRecommendation ? (
			<FieldGroup name="syncSettings">
				{({ disabled, value: syncPreferences }) =>
					disabled ? null : (
						<div
							style={{
								marginTop: 30,
							}}
						>
							<p>Indexing Preferences</p>
							<List
								dataSource={defaultSettings}
								bordered
								renderItem={(item) => (
									<FieldControl name={item.id}>
										{({ value, onChange }) => (
											<Item
												actions={[
													<Switch checked={value} onChange={onChange} />,
												]}
											>
												<Item.Meta title={item.label} />
											</Item>
										)}
									</FieldControl>
								)}
							/>
							<Button
								type="primary"
								style={{
									marginTop: 20,
									marginBottom: 50,
								}}
								disabled={!!index}
								target="blank"
								icon="reload"
								href={index ? getResyncURL(index, syncPreferences) : null}
							>
								Resync
							</Button>
						</div>
					)
				}
			</FieldGroup>
		) : null}
	</div>
);

Platform.defaultProps = {
	isRecommendation: false,
	index: null,
};

Platform.propTypes = {
	isRecommendation: bool,
	index: string,
};

const mapStateToProps = (state, props) => ({
	index: props.pipeline || get(state, '$getCurrentApp.name'),
});
export default connect(mapStateToProps)(Platform);
