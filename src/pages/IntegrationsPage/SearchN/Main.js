import React from 'react';
import { Tabs, Affix } from 'antd';
import { func, string } from 'prop-types';
import LayoutTab from '../tabs/Layout';
import SearchTab from '../tabs/Search';
import General from '../tabs/General';
import ChoosePlatformTab from '../tabs/ChoosePlatform';
import { container } from '../../ResultsPage/styles';
import PreviewModal from '../PreviewModal';
import ExportModal from '../ExportModal';
import SyncStatus from '../SyncStatus';
import PreferencesFormWrapper from '../PreferencesFormWrapperN';
import SavePreferences from '../SavePreferencesN';

const { TabPane } = Tabs;

const Main = ({ closeForm, preferenceId }) => (
	<PreferencesFormWrapper closeForm={closeForm} preferenceId={preferenceId}>
		{({ getPreferences, getPreferencesPayload, form }) => {
			const pipeline = form.get('pipeline') ? form.get('pipeline').value : null;
			return (
				<>
					{pipeline ? <SyncStatus form={form} pipeline={pipeline} /> : null}
					<div
						style={{ backgroundColor: '#fff', padding: '10px 20px' }}
						className={container}
					>
						<Tabs
							defaultActiveKey="1"
							style={{ minHeight: 500 }}
							destroyInactiveTabPane
						>
							<TabPane tab="General" key="1">
								<General />
							</TabPane>
							<TabPane tab="E-Commerce Platform" key="2">
								<ChoosePlatformTab pipeline={pipeline} />
							</TabPane>
							<TabPane tab="Layout and Design" key="3">
								<LayoutTab />
							</TabPane>
							<TabPane tab="Search Settings" key="4">
								<SearchTab />
							</TabPane>
						</Tabs>
						<Affix
							offsetBottom={0}
							style={{
								backgroundColor: '#fff',
								padding: '15px 10px',
								width: 'calc(100% - 50px)',
							}}
						>
							<div className="flex space-between card-footer">
								<div>
									<PreviewModal
										pipeline={pipeline}
										preferences={getPreferences}
									/>
									<ExportModal
										preferences={getPreferences}
										buttonProps={{
											style: {
												marginLeft: 10,
											},
										}}
									/>
								</div>
								<div>
									<SavePreferences
										form={form}
										closeForm={closeForm}
										preferenceId={preferenceId}
										getPreferencesPayload={getPreferencesPayload}
									/>
								</div>
							</div>
						</Affix>
					</div>
				</>
			);
		}}
	</PreferencesFormWrapper>
);

Main.defaultProps = {
	preferenceId: null,
};

Main.propTypes = {
	closeForm: func.isRequired,
	preferenceId: string,
};

export default Main;
