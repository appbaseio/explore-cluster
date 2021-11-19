import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import get from 'lodash/get';
import keys from 'lodash/keys';
import { connect } from 'react-redux'; // eslint-disable-next-line import/no-cycle
import ReviewAndSave from './ReviewAndSave';
import SearchPreviewSwitcher from '../../components/SearchPreviewSwitcher';
import { PreferenceFormContext } from './IndexSuggestions'; // eslint-disable-line import/no-cycle

const Footer = ({ originalData, tab, changedData, collapsed, apps }) => {
	const [visible, setVisible] = useState(false);
	const [app, setApp] = useState('');
	const [oldObj, setOldObj] = useState({
		popularSuggestions: {},
		recentSuggestions: {},
		indexSuggestions: {},
	});
	const [newObj, setNewObj] = useState({
		popularSuggestions: {},
		recentSuggestions: {},
		indexSuggestions: {},
	});

	useEffect(() => {
		const oldData = changeOriginalData();
		setOldObj({ ...oldData });
		setNewObj({ ...oldData });
	}, [originalData]);

	useEffect(() => {
		const data = changeNewData();
		setNewObj({ ...data });
	}, [changedData]);

	function changeOriginalData() {
		const newOldObj = { ...oldObj };
		if (tab === 'popular-suggestions') {
			newOldObj.popularSuggestions = originalData;
		} else if (tab === 'recent-suggestions') {
			newOldObj.recentSuggestions = originalData;
		} else {
			newOldObj.indexSuggestions = originalData;
		}
		return { ...newOldObj };
	}

	function changeNewData() {
		const setObj = { ...newObj };
		if (tab === 'popular-suggestions') {
			setObj.popularSuggestions = changedData;
		} else if (tab === 'recent-suggestions') {
			setObj.recentSuggestions = changedData;
		} else {
			setObj.indexSuggestions = changedData;
		}
		return { ...setObj };
	}

	function onAppSelect(index) {
		setApp(index);
		setVisible(true);
	}

	function toggleVisibility() {
		setVisible(!visible);
	}

	const filteredApps = keys(apps).filter(
		(appName) => !appName.startsWith('.') && !appName.startsWith('metricbeat'),
	);
	const { saveTemplate } = useContext(PreferenceFormContext);
	return (
		<div
			style={{
				position: 'fixed',
				overflow: 'hidden',
				bottom: 0,
				left: collapsed ? 80 : 260,
				background: 'white',
				right: 0,
				zIndex: 100,
			}}
			data-cy="suggestions-footer"
		>
			<div
				className="flex space-between card-footer"
				style={{ paddingLeft: 50, paddingRight: 50 }}
				data-cy="buttons-container"
			>
				<div>
					<SearchPreviewSwitcher
						filteredApps={filteredApps}
						onSelect={(e) => onAppSelect(e)}
						onCancel={() => toggleVisibility()}
						visible={visible}
						app={app}
						page="suggestions"
					/>
				</div>
				<div style={{ display: 'flex' }}>
					<Button
						style={{ marginRight: 5 }}
						size="large"
						onClick={() => saveTemplate({})}
						data-cy="reset-suggestions"
					>
						Reset To Default Settings
					</Button>
					<ReviewAndSave oldData={oldObj} newData={newObj} />
				</div>
			</div>
		</div>
	);
};

Footer.propTypes = {
	originalData: PropTypes.object,
	tab: PropTypes.string.isRequired,
	changedData: PropTypes.object.isRequired,
	collapsed: PropTypes.bool.isRequired,
	apps: PropTypes.object,
};

Footer.defaultProps = {
	originalData: {
		popularSuggestions: {},
		recentSuggestions: {},
		indexSuggestions: {},
	},
	apps: {},
};

const mapStateToProps = (state) => {
	const apps = get(state, 'apps.data');
	const collapsed = get(state, 'sideBarCollapsed');
	return {
		collapsed,
		apps,
	};
};

export default connect(mapStateToProps)(Footer);
