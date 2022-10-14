import React, { useEffect, useMemo, useState } from 'react';
import { func, object, string } from 'prop-types';
import {
	componentTypes,
	ReactiveBase,
	ReactiveChart,
	ReactiveComponent,
} from '@appbaseio/reactivesearch';
import { getURL } from '../../../../constants/config';
import { transformFacets } from '../../utils';

const DEBOUNCE_TIME = 1000;

function parseStringifiedFunction(funcString) {
	let parsedFunc;
	try {
		// eslint-disable-next-line
		parsedFunc = new Function(`return ${funcString}`)();
	} catch (e) {
		console.error(e);
	}
	return parsedFunc;
}
/**
 * CAUTION:
 * Pass hooks using useCallback or you might end in an infinite loop
 */

const LivePreview = React.memo(
	({
		pipeline,
		componentConfig,
		prefix,
		hookOwnRender,
		hookResultRender,
		hookDefaultQuery,
		hookCustomQuery,
	}) => {
		const [componentRsConfig, setComponentRsConfig] = useState({});
		const [isLoading, setIsLoading] = useState(true);
		const [functions, setFunctions] = useState({
			// hook used by filter
			component: {
				defaultQuery: undefined,
				customQuery: undefined,
				setOption: undefined,
			},
			hiddenComponent: {
				defaultQuery: undefined,
				render: undefined,
			},
			// hook used by result component
			result: {
				render: undefined,
			},
		});

		useEffect(() => {
			setIsLoading(true);
			const timeoutId = setTimeout(() => {
				const newRsConfig = transformFacets(componentConfig);
				// We expect that componentConfig.defaultQuery, customQuery, setOption would be stringified functions
				const defaultQueryWithHook = (...args) => {
					if (typeof hookDefaultQuery === 'function') {
						hookDefaultQuery(...args);
					}
					const parsedFunc = parseStringifiedFunction(componentConfig.defaultQuery);
					return parsedFunc && parsedFunc(...args);
				};
				const defaultQueryWithoutHook = (...args) => {
					const parsedFunc = parseStringifiedFunction(componentConfig.defaultQuery);
					return parsedFunc && parsedFunc(...args);
				};
				const customQueryWithHook = (...args) => {
					if (typeof hookCustomQuery === 'function') {
						hookCustomQuery(...args);
					}
					const parsedFunc = parseStringifiedFunction(componentConfig.customQuery);
					return parsedFunc && parsedFunc(...args);
				};
				const setOptionWithHook = (...args) => {
					if (typeof hookOwnRender === 'function') {
						hookOwnRender(...args);
					}
					const parsedFunc = parseStringifiedFunction(componentConfig.setOption);
					const data = args[0];
					return parsedFunc
						? parsedFunc(...args)
						: ReactiveChart.getOption({
								...componentConfig,
								...data,
								chartType: componentConfig.chartType,
						  });
				};
				const hookRsComponentProps = {
					component: {
						// Charts use setOption instead of render method for customization
						setOption:
							componentConfig.componentType === componentTypes.reactiveChart
								? setOptionWithHook
								: undefined,
						defaultQuery: defaultQueryWithHook,
						customQuery: customQueryWithHook,
					},
					hiddenComponent: {
						render: (...args) => {
							if (typeof hookOwnRender === 'function') {
								hookOwnRender(...args);
							}
							return 'OUTPUT to silence react errors';
						},
						defaultQuery: defaultQueryWithoutHook,
					},
					result: {
						render: (...args) => {
							if (typeof hookResultRender === 'function') {
								hookResultRender(...args);
							}
							return 'Results found!';
						},
					},
				};
				setFunctions(hookRsComponentProps);
				setComponentRsConfig(newRsConfig);
				setIsLoading(false);
			}, DEBOUNCE_TIME);

			return () => clearTimeout(timeoutId);
		}, [componentConfig]);

		// Original component
		const RS_COMPONENT_ID = prefix ? `${prefix}_component` : 'component';
		// To hook component's own render method we define a clone component. Since we can't define that on the component itself.
		const HIDDEN_RS_COMPONENT_ID = prefix ? `${prefix}_hook_component` : 'hook_component';
		// To hook render method of the dependencies.
		const HIDDEN_RESULT_COMPONENT_ID = prefix ? `${prefix}_result` : 'result';
		const hiddenComponentStyles = { visibility: 'hidden', position: 'absolute' };

		const showPreview =
			componentRsConfig.componentType === componentTypes.reactiveChart
				? componentRsConfig.chartType && componentRsConfig.dataField
				: componentRsConfig.dataField;

		const preferences = useMemo(
			() => ({
				[RS_COMPONENT_ID]: {
					rsConfig: {
						...componentRsConfig,
						title:
							componentRsConfig.componentType === componentTypes.tabDataList
								? ''
								: componentRsConfig.title,
					},
				},
				[HIDDEN_RS_COMPONENT_ID]: {
					rsConfig: { ...componentRsConfig },
				},
				[HIDDEN_RESULT_COMPONENT_ID]: {
					rsConfig: {
						dataField: componentRsConfig.dataField,
						componentType: componentTypes.reactiveList,
						react: { and: RS_COMPONENT_ID },
					},
				},
			}),
			[componentRsConfig],
		);
		return (
			<div>
				{showPreview ? (
					<>
						<h3 className="section-header">Live Preview</h3>
						<div className="preview-container">
							<ReactiveBase
								app={pipeline}
								url={getURL()}
								credentials={atob(localStorage.getItem('authToken'))}
								enableAppbase
								preferences={preferences}
							>
								{isLoading ? (
									<img
										style={{ display: 'block', margin: '0px auto' }}
										src="/static/images/loader.svg"
										alt="loading"
									/>
								) : (
									<>
										<ReactiveComponent
											componentId={RS_COMPONENT_ID}
											preferencesPath={RS_COMPONENT_ID}
											{...functions.component}
										/>
										{typeof functions.hiddenComponent.render === 'function' ? (
											<div style={hiddenComponentStyles}>
												<ReactiveComponent
													componentId={HIDDEN_RS_COMPONENT_ID}
													preferencesPath={HIDDEN_RS_COMPONENT_ID}
													{...functions.hiddenComponent}
												/>
											</div>
										) : null}
										{typeof functions.result.render === 'function' ? (
											<div style={hiddenComponentStyles}>
												<ReactiveComponent
													componentId={HIDDEN_RESULT_COMPONENT_ID}
													preferencesPath={HIDDEN_RESULT_COMPONENT_ID}
													render={functions.result.render}
												/>
											</div>
										) : null}
									</>
								)}
							</ReactiveBase>
						</div>
					</>
				) : null}
			</div>
		);
	},
	(prevProps, nextProps) => {
		let propsAreEqual = true;
		Object.keys(nextProps.componentConfig).forEach((prop) => {
			if (!(nextProps.componentConfig[prop] === prevProps.componentConfig[prop])) {
				propsAreEqual = false;
			}
		});
		return propsAreEqual;
	},
);

LivePreview.defaultProps = {
	prefix: '',
	hookResultRender: null,
	hookCustomQuery: null,
	hookDefaultQuery: null,
	hookOwnRender: null,
};

LivePreview.propTypes = {
	componentConfig: object.isRequired,
	pipeline: string.isRequired,
	prefix: string,
	hookResultRender: func,
	hookOwnRender: func,
	hookCustomQuery: func,
	hookDefaultQuery: func,
};

export default LivePreview;
