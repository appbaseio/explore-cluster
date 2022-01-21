export const GeoResults = () => {
	return `
    /** @jsxRuntime classic */
    /** @jsx jsx */
    /* eslint-disable no-unused-vars */
    import React, {useState} from "react";
    import { jsx } from '@emotion/core';
    import get from 'lodash.get';
    import LayoutSwitch from "./LayoutSwitch";
    import ListLayout from "./ListLayout";
    import { getSearchPreferences, defaultPreferences } from '../../utils';


    function ResultsLayout({meta, data, isPreview, triggerClickAnalytics, renderMap, renderPagination}) {

        const [resultsLayout, setResultsLayout] = useState(
            get(
                getSearchPreferences(),
                'resultSettings.mapLayout',
                defaultPreferences.resultSettings.mapLayout,
            ),
        );

        const preferences = getSearchPreferences();

        const viewSwitcher = get(
            preferences,
            'resultSettings.viewSwitcher',
            defaultPreferences.resultSettings.viewSwitcher,
        );

        return (
            <div>
            <div >
                    {meta?.resultStats?.numberOfResults} results found in{' '}
                    {meta?.resultStats?.time}ms
                </div>
                {viewSwitcher && (
                    <LayoutSwitch switchViewLayout={setResultsLayout} resultsLayout={resultsLayout}/>
                )}

                {resultsLayout !== 'map' ? (
                    <ListLayout
                        data={data}
                        isPreview={isPreview}
                        triggerClickAnalytics={triggerClickAnalytics}
                        renderPagination={renderPagination}
                    />
                ): (
                    <div style={{height: '90vh'}}>
                        {renderMap()}
                    </div>
                )}
            </div>
        )
    }

    export default ResultsLayout;

    `;
};
