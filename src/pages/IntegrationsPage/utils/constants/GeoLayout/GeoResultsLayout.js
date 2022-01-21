export const GeoResultsLayout = () => {
	return `
    /** @jsxRuntime classic */
    /** @jsx jsx */
    /* eslint-disable no-unused-vars */
    import React, { useState } from "react";
    import { Card, Button, Icon, List } from 'antd';
    import { css, jsx } from '@emotion/core';
    import get from 'lodash.get';
    import strip from 'striptags';
    import Truncate from 'react-truncate';
    import { ReactiveGoogleMap, ReactiveOpenStreetMap } from '@appbaseio/reactivemaps';
    import { mediaMax } from '../../utils/media';
    import ListLayout from "./ListLayout";
    import ResultsLayout from './ResultsLayout';
    import { getSearchPreferences, defaultPreferences, getReactDependenciesFromPreferences } from '../../utils';

    export const cardStyles = ({ textColor, titleColor, primaryColor }) => css\`
        position: relative;
        overflow: hidden;
        max-width: 200px;
        height: 100%;
        .image-container {
            margin: 3px 0px;
            height: 100px;
            width: 190px;
        }
        .title-container {
            margin: 3px 0px;

            width: 190px;
            font-weight: 400px;
        }
        .description-container {
            margin: 3px 0px;

            width: 190px;
        }
        .overflow-text {
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }
        .product-button {
            top: -58%;
            position: absolute;
            background: \${primaryColor} !important;
            border: 0;
            box-shadow: 0 2px 4px \${titleColor}33;
            left: 50%;
            transform: translateX(-50%);
            transition: all ease 0.2s;
        }

        ::before {
            content: '';
            width: 100%;
            height: 0vh;
            background: \${primaryColor}00 !important;
            position: absolute;
            top: 0;
            left: 0;
            display: block;
            transition: all ease 0.4s;
        }


        &:hover {
            .product-button {
                top: 35%;
            }
            ::before {
                width: 100%;
                height: 100%;
                background: \${primaryColor}1a !important;
            }
        }
    \`;

    function GeoResultsLayout({isPreview}) {

        const preferences = getSearchPreferences();

        const theme = get(
            preferences,
            'themeSettings.rsConfig',
            defaultPreferences.themeSettings.rsConfig,
        );

        const themeType = get(
            preferences,
            'themeSettings.type',
            defaultPreferences.themeSettings.type,
        );

        const currency = get(
            preferences,
            'globalSettings.currency',
            defaultPreferences.globalSettings.currency,
        );

        const mapComponent = get(
            preferences,
            'resultSettings.mapComponent',
            defaultPreferences.resultSettings.mapComponent,
        );

        const defaultZoom = get(
            preferences,
            'resultSettings.defaultZoom',
            defaultPreferences.resultSettings.defaultZoom,
        );
        const showSearchAsMove = get(
            preferences,
            'resultSettings.showSearchAsMove',
            defaultPreferences.resultSettings.showSearchAsMove,
        );
        const showMarkerClusters = get(
            preferences,
            'resultSettings.showMarkerClusters',
            defaultPreferences.resultSettings.showMarkerClusters,
        );

        const resultSettings = get(preferences, 'resultSettings');

        const redirectUrlText = get(preferences, 'searchSettings.redirectUrlText.text', 'View Product');

        function getFontFamily() {
            const receivedFont = get(theme, 'typography.fontFamily', '');
            let fontFamily = '';
            if (receivedFont && receivedFont !== 'default') {
                fontFamily = receivedFont; // eslint-disable-line
            }
            return fontFamily ? { fontFamily } : {};
        }

        return (
            <div>
                {
                    mapComponent === 'googleMap' ? (
                        <ReactiveGoogleMap
                            componentId="map"
                            dataField={get('locationDataField', resultSettings, 'location')}
                            title="Maps Ui"
                            defaultZoom={defaultZoom}
                            pagination
                            onPageChange={() => {
                                window.scrollTo(0, 0);
                            }}
                            style={{
                                width: "100%",
                                height: "calc(100vh - 52px)"
                            }}
                            showMarkerClusters={showMarkerClusters}
                            showSearchAsMove={showSearchAsMove}
                            onPopoverClick={(item) => {
                                // console.log(item);
                                const handle = isPreview
                                    ? ''
                                    : get(item, get(resultSettings, 'fields.handle'));

                                const image = get(
                                    item,
                                    get(resultSettings, 'fields.image'),
                                );
                                const title = get(
                                    item,
                                    get(resultSettings, 'fields.title'),
                                );
                                const description = get(
                                    item,
                                    get(resultSettings, 'fields.description'),
                                );
                                const price = get(
                                    item,
                                    get(resultSettings, 'fields.price'),
                                );

                                const { variants } = item;

                                const redirectToProduct = !isPreview || handle;

                                return (
                                    <a
                                        href={
                                            redirectToProduct
                                                ? \`/products/\${handle}\`
                                                : undefined
                                        }
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        key={item._id}
                                        id={item._id}
                                    >
                                        <div
                                            css={cardStyles({
                                                ...get(theme, 'colors'),
                                            })}

                                        >
                                            { image ? (
                                                <img
                                                    className="image-container"
                                                    src={image}
                                                    alt={title}
                                                    onError={(event) => {
                                                        event.target.src = 'https://www.houseoftara.com/shop/wp-content/uploads/2019/05/placeholder.jpg'; // eslint-disable-line
                                                    }}
                                                />
                                            ): null }
                                            <div className="title-container">
                                                <p className="overflow-text">
                                                {title}
                                                </p>
                                            </div>
                                            <div className="description-container">
                                                <p className="overflow-text">
                                                {description}
                                                </p>
                                            </div>
                                            <div style={{ margin: '3px 0' }}>
                                                {variants?.length ||
                                                    price
                                                        ? \`\${currency} \${
                                                                variants
                                                                    ? get(
                                                                        variants[0],
                                                                        'price',
                                                                        '',
                                                                    )
                                                                    : price
                                                            }\`
                                                        : null}
                                            </div>

                                            {redirectToProduct ? (
                                                <Button
                                                    type="primary"
                                                    size="large"
                                                    className="product-button"
                                                >
                                                    <Icon type="eye" />
                                                    {redirectUrlText}
                                                </Button>
                                            ) : null}
                                        </div>
                                    </a>
                                )
                            }}
                            renderAllData={(
                                hits,
                                loadMore,
                                renderMap,
                                renderPagination,
                                triggerClickAnalytics,
                                meta,
                            ) => {
                                return (
                                    <ResultsLayout
                                        data={hits}
                                        meta={meta}
                                        isPreview={isPreview}
                                        triggerClickAnalytics={triggerClickAnalytics}
                                        renderMap={renderMap}
                                        renderPagination={renderPagination}
                                    />
                                );
                            }}
                            renderData={(data) => ({
                                label: (
                                    <span style={{ width: 40, display: "block", textAlign: "center" }}>
                                    \${data.price}
                                    </span>
                                )
                            })}
                            react={{
                                and: [
                                    'filter_by_product',
                                    ...getReactDependenciesFromPreferences(
                                        preferences,
                                        'result',
                                    ),
                                    'ToggleResults',
                                    ...getReactDependenciesFromPreferences(
                                        preferences,
                                        'result',
                                    ),
                                ],
                            }}
                        />
                    ) : (
                        <ReactiveOpenStreetMap
                            componentId="map"
                            dataField={get('locationDataField', resultSettings, 'location')}
                            title="Maps Ui"
                            defaultZoom={defaultZoom}
                            pagination
                            onPageChange={() => {
                                window.scrollTo(0, 0);
                            }}
                            style={{
                                width: "100%",
                                height: "calc(100vh - 52px)"
                            }}
                            showMarkerClusters={showMarkerClusters}
                            showSearchAsMove={showSearchAsMove}
                            onPopoverClick={(item) => {
                                const handle = isPreview
                                    ? ''
                                    : get(item, get(resultSettings, 'fields.handle'));

                                const image = get(
                                    item,
                                    get(resultSettings, 'fields.image'),
                                );
                                const title = get(
                                    item,
                                    get(resultSettings, 'fields.title'),
                                );
                                const description = get(
                                    item,
                                    get(resultSettings, 'fields.description'),
                                );
                                const price = get(
                                    item,
                                    get(resultSettings, 'fields.price'),
                                );

                                const { variants } = item;

                                const redirectToProduct = !isPreview || handle;

                                return (
                                    <a
                                        href={
                                            redirectToProduct
                                                ? \`/products/\${handle}\`
                                                : undefined
                                        }
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        key={item._id}
                                        id={item._id}
                                    >
                                        <div
                                            css={cardStyles({
                                                ...get(theme, 'colors'),
                                            })}

                                        >
                                            { image ? (
                                                <img
                                                    className="image-container"
                                                    src={image}
                                                    alt={title}
                                                    onError={(event) => {
                                                        event.target.src = 'https://www.houseoftara.com/shop/wp-content/uploads/2019/05/placeholder.jpg'; // eslint-disable-line
                                                    }}
                                                />
                                            ): null }
                                            <div className="title-container">
                                                <p className="overflow-text">
                                                {title}
                                                </p>
                                            </div>
                                            <div className="description-container">
                                                <p className="overflow-text">
                                                {description}
                                                </p>
                                            </div>
                                            <div style={{ margin: '3px 0' }}>
                                                {variants?.length ||
                                                    price
                                                        ? \`\${currency} \${
                                                                variants
                                                                    ? get(
                                                                        variants[0],
                                                                        'price',
                                                                        '',
                                                                    )
                                                                    : price
                                                            }\`
                                                        : null}
                                            </div>

                                            {redirectToProduct ? (
                                                <Button
                                                    type="primary"
                                                    size="large"
                                                    className="product-button"
                                                >
                                                    <Icon type="eye" />
                                                    {redirectUrlText}
                                                </Button>
                                            ) : null}
                                        </div>
                                    </a>
                                )
                            }}
                            renderAllData={(
                                hits,
                                loadMore,
                                renderMap,
                                renderPagination,
                                triggerClickAnalytics,
                                meta,
                            ) => {
                                return (
                                    <ResultsLayout
                                        data={hits}
                                        meta={meta}
                                        isPreview={isPreview}
                                        triggerClickAnalytics={triggerClickAnalytics}
                                        renderMap={renderMap}
                                        renderPagination={renderPagination}
                                    />
                                );
                            }}
                            renderData={(data) => ({
                                label: (
                                    <span style={{ width: 40, display: "block", textAlign: "center" }}>
                                    \${data.price}
                                    </span>
                                )
                            })}
                            react={{
                                and: [
                                    'filter_by_product',
                                    ...getReactDependenciesFromPreferences(
                                        preferences,
                                        'result',
                                    ),
                                    'ToggleResults',
                                    ...getReactDependenciesFromPreferences(
                                        preferences,
                                        'result',
                                    ),
                                ],
                            }}
                        />
                    )
                }
            </div>
        )
    }

    export default GeoResultsLayout;

    `;
};
