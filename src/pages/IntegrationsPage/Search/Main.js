import React from 'react';
import { Tabs, Affix } from 'antd';
import LayoutTab from '../tabs/Layout';
import SearchTab from '../tabs/Search';
import ChoosePlatformTab from '../tabs/ChoosePlatform';
import { container } from '../../ResultsPage/styles';
import PreviewModal from '../PreviewModal';
import ExportModal from '../ExportModal';
import SyncStatus from '../SyncStatus';
import PreferencesFormWrapper from '../PreferencesFormWraper';
import SavePreferences from '../SavePreferences';
import ResetPreferences from '../ResetPreferences';

const { TabPane } = Tabs;

const Main = () => (
	<PreferencesFormWrapper>
		{({ getPreferences, getPreferencesPayload, form }) => (
			<>
				<SyncStatus form={form} />
				<div
					style={{ backgroundColor: '#fff', padding: '10px 20px' }}
					className={container}
				>
					<Tabs defaultActiveKey="1" style={{ minHeight: 500 }}>
						<TabPane tab="E-Commerce Platform" key="1">
							<ChoosePlatformTab />
						</TabPane>
						<TabPane tab="Layout and Design" key="2">
							<LayoutTab />
						</TabPane>
						<TabPane tab="Search Settings" key="3">
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
								<ExportModal preferences={getPreferences} />
							</div>
							<div>
								<PreviewModal preferences={getPreferences} />
								<ResetPreferences />
								<SavePreferences getPreferencesPayload={getPreferencesPayload} />
							</div>
						</div>
					</Affix>
				</div>
			</>
		)}
	</PreferencesFormWrapper>
);

export default Main;
