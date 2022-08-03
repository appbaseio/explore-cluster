import React, { useEffect, useState } from 'react';
import { func, object } from 'prop-types';
import { ReactiveBase, ReactiveComponent } from '@appbaseio/reactivesearch';
import { getURL } from '../../../../../constants/config';
import { transformCharts } from '../../../utils';
import { chartTypes } from './constants';

const LivePreview = ({ form, control, customizeControlObj, setCustomizeControlObj }) => {
	const [isLoading, setIsLoading] = useState(false);
	useEffect(() => {
		const newControl = transformCharts(control);
		if (
			newControl.dataField !== customizeControlObj.dataField ||
			newControl.sortBy !== customizeControlObj.sortBy ||
			newControl.size !== customizeControlObj.size ||
			newControl.defaultQuery !== customizeControlObj.defaultQuery ||
			newControl.setOption !== customizeControlObj.setOption
		) {
			handleReload(700);
		}

		if (
			JSON.stringify(newControl.range) !== JSON.stringify(customizeControlObj.range) ||
			newControl.showHistogram !== customizeControlObj.showHistogram
		)
			handleReload(200);
		setCustomizeControlObj(newControl);
	}, [control]);

	const handleReload = (time = 1500) => {
		setIsLoading(true);
		setTimeout(() => {
			setIsLoading(false);
		}, time);
	};
	const shouldDisplayPreview = (obj) => {
		if (obj.chartType === chartTypes.search.scatter.id) {
			return (
				customizeControlObj.dataField &&
				customizeControlObj.xAxisField &&
				customizeControlObj.yAxisField
			);
		}
		return customizeControlObj.dataField && customizeControlObj.chartType;
	};
	return (
		<div>
			{shouldDisplayPreview(customizeControlObj) ? (
				<>
					<h3 className="section-header">Live Preview</h3>
					<div className="preview-container">
						{isLoading ? (
							<img src="/static/images/loader.svg" alt="loading" />
						) : (
							<ReactiveBase
								app={form.get('pipeline') ? form.get('pipeline').value : ''}
								url={getURL()}
								credentials={atob(localStorage.getItem('authToken'))}
								enableAppbase
								preferences={{
									facet: { rsConfig: { ...customizeControlObj } },
								}}
							>
								<ReactiveComponent
									key={customizeControlObj.chartType}
									componentId="facet"
									preferencesPath="facet"
								/>
							</ReactiveBase>
						)}
					</div>
				</>
			) : null}
		</div>
	);
};

LivePreview.defaultProps = {
	control: {},
	customizeControlObj: {},
	setCustomizeControlObj: () => {},
};

LivePreview.propTypes = {
	control: object,
	form: object.isRequired,
	customizeControlObj: object,
	setCustomizeControlObj: func,
};

export default LivePreview;
