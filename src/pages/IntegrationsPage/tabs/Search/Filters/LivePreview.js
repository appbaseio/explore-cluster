import React, { useEffect, useState } from 'react';
import { func, object } from 'prop-types';
import { ReactiveBase, ReactiveComponent } from '@appbaseio/reactivesearch';
import { getURL } from '../../../../../constants/config';
import { transformFacets } from '../../../utils';

const LivePreview = ({ form, control, customizeConrolObj, setCustomizeConrolObj }) => {
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const newControl = transformFacets(control);
		if (
			newControl.dataField !== customizeConrolObj.dataField ||
			newControl.sortBy !== customizeConrolObj.sortBy ||
			newControl.size !== customizeConrolObj.size
		) {
			handleReload(700);
		}

		if (
			JSON.stringify(newControl.range) !== JSON.stringify(customizeConrolObj.range) ||
			newControl.showHistogram !== customizeConrolObj.showHistogram
		)
			handleReload(200);
		setCustomizeConrolObj(newControl);
	}, [control]);

	const handleReload = (time = '1500') => {
		setIsLoading(true);
		setTimeout(() => {
			setIsLoading(false);
		}, time);
	};

	return (
		<div>
			{customizeConrolObj.dataField ? (
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
									facet: { rsConfig: { ...customizeConrolObj } },
								}}
							>
								<ReactiveComponent componentId="facet" preferencesPath="facet" />
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
	customizeConrolObj: {},
	setCustomizeConrolObj: () => {},
};

LivePreview.propTypes = {
	control: object,
	form: object.isRequired,
	customizeConrolObj: object,
	setCustomizeConrolObj: func,
};

export default LivePreview;
