export const Search = () => {
	return `/** @jsxRuntime classic */
/** @jsx jsx */
/* eslint-disable no-unused-vars */
import { css, jsx, Global } from '@emotion/core';
import React, { Component } from 'react';
import {
    ReactiveBase,
    SearchBox,
    MultiList,
    ReactiveList,
    SelectedFilters,
    DynamicRangeSlider,
    ReactiveComponent,
    RangeInput,
} from '@appbaseio/reactivesearch';
import {
    UL,
    Checkbox,
} from '@appbaseio/reactivesearch/lib/styles/FormControlList';
import get from 'lodash.get';
import { string, bool } from 'prop-types';
import strip from 'striptags';
import Truncate from 'react-truncate';
import { Card, Collapse, Button, Icon, Affix, Tooltip, List } from 'antd';
import { mediaMax } from '../utils/media';
import Suggestions from './Suggestions';
import LayoutSwitch from './LayoutSwitch';
import ResultsLayout from './ResultsLayout';
import {
    browserColors,
    defaultPreferences,
    getReactDependenciesFromPreferences,
    getSearchPreferences,
    shopifyDefaultFields,
} from '../utils';
import GeoResultsLayout from './GeoLayout/GeoResultsLayout';
import Filters from './Filters';

const { Meta } = Card;
const { Panel } = Collapse;

const resultRef = React.createRef();

const minimalSearchStyles = ({ titleColor }) => css\`
    input {
        border: 0;
        color: \${titleColor};
        box-shadow: 0px 0px 4px \${titleColor}1a;
    }
\`;

const loaderStyle = css\`
    margin: 10px 0;
    position: relative;
\`;

export const listLayoutStyles = css\`
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    \${mediaMax.medium} {
        flex-direction: column;
        align-items: center;
        margin-bottom: 50px;
    }
\`;

const reactiveListCls = (toggleFilters, theme) => css\`
    .custom-no-results {
        display: flex;
        justify-content: center;
        padding: 25px 0;
    }
    .custom-pagination {
        max-width: none;
        padding-bottom: 50px;
        a {
            border-radius: 2px;
        }
        a.active {
            color: \${get(theme, 'colors.textColor')};
        }
        @media (max-width: 768px) {
            display: \${toggleFilters ? 'none' : 'block'};
        }
    }
    .custom-powered-by {
        margin: 15px;
        display: none;
        visibility: hidden;
    }
    .custom-result-info {
        gap: 15px;
        padding: 18px 0px;
        height: 60px;
    }
    .custom-result-info > div {
        @media (max-width: 768px) {
            display: none;
        }
    }
    .custom-result-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        grid-gap: 10px;
        \${mediaMax.medium} {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            display: \${toggleFilters ? 'none' : 'grid'};
        }
        \${mediaMax.small} {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        }
    }
\`;

export const cardStyles = ({ textColor, titleColor, primaryColor }) => css\`
    position: relative;
    overflow: hidden;
    max-width: 250px;
    height: 100%;
    .card-image-container {
        width: 250px;
        height: 250px;
        \${mediaMax.medium} {
            height: 100%;
            width: 100%;
        }
    }
    .product-button {
        top: -50%;
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

    .ant-card-cover {
        height: 250px;
        \${mediaMax.medium} {
            height: 200px;
        }
    }
    .ant-card-body {
        padding: 15px 10px;
    }
    \${mediaMax.small} {
        .ant-card-body {
            padding: 10px 5px;
        }
    }

    .ant-card-cover img {
        object-fit: cover;
        height: 100%;
        width: 100%;
    }

    .ant-card-meta-title {
        color: \${titleColor};
        white-space: unset;
    }

    .ant-card-meta-title h3 {
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .ant-card-meta-description {
        color: \${textColor};
        \${mediaMax.small} {
            font-size: 0.7rem;
        }
    }

    &:hover {
        .product-button {
            top: 50%;
        }
        ::before {
            width: 100%;
            height: 100%;
            background: \${primaryColor}1a !important;
        }
    }

    @media (max-width: 768px) {
        .ant-card-cover img {
            object-fit: cover;
        }
    }
\`;

export const listStyles = ({ titleColor, primaryColor }) => css\`
    position: relative;
    overflow: hidden;
    padding: 5px 20px;
    width: 100%;
    height: 100%;
    .product-button {
        top: -50%;
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
            top: 45%;
        }
        ::before {
            width: 100%;
            height: 100%;
            background: \${primaryColor}1a !important;
        }
    }
\`;

export const cardTitleStyles = ({ titleColor, primaryColor }) => css\`
    margin: 0;
    padding: 0;
    color: \${titleColor};
    \${mediaMax.small} {
        font-size: 0.9rem;
    }
    mark {
        color: \${titleColor};
        background-color: \${primaryColor}4d};
    }
\`;
const viewSwitcherStyles = css\`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    .icon-styles {
        padding: 5px;
        &: hover {
            cursor: pointer;
            color: #40a9ff;
        }
    }
\`;
const mobileButtonStyles = css\`
    border-radius: 0;
    border: 0;
\`;

const colorContainer = css\`
    display: grid;
    grid-gap: 5px;
    grid-template-columns: repeat(auto-fill, 30px);
    justify-content: center;
\`;

const searchRef = React.createRef();

let userIdObj = {};
class Search extends Component {
    constructor() {
        super();
        this.state = {
            toggleFilters: false,
            isMobile: window.innerWidth <= 768,
            blur: false,
        };
        this.preferences = getSearchPreferences();
        this.theme = get(
            this.preferences,
            'themeSettings.rsConfig',
            defaultPreferences.themeSettings.rsConfig,
        );
        this.themeSettings = get(
            this.preferences,
            'themeSettings',
            defaultPreferences.themeSettings,
        );
        this.themeType = get(
            this.preferences,
            'themeSettings.type',
            defaultPreferences.themeSettings.type,
        );
        this.currency = get(
            this.preferences,
            'globalSettings.currency',
            defaultPreferences.globalSettings.currency,
        );
        this.index = get(this.preferences, 'appbaseSettings.index');
        this.credentials = get(this.preferences, 'appbaseSettings.credentials');
        this.url = get(this.preferences, 'appbaseSettings.url');
        this.userId = get(this.preferences, 'appbaseSettings.userId', '');
        this.resultSettings = get(this.preferences, 'resultSettings');
        this.searchSettings = get(this.preferences, 'searchSettings');
        this.globalSettings = get(this.preferences, 'globalSettings', {});
        this.dynamicFacets =
            get(this.preferences, 'facetSettings.dynamicFacets') || [];
        this.staticFacets =
            get(this.preferences, 'facetSettings.staticFacets') || [];
        this.colorFilter = this.staticFacets.find((o) => o.name === 'color');
        this.collectionFilter = this.staticFacets.find(
            (o) => o.name === 'collection',
        );
        this.productTypeFilter = this.staticFacets.find(
            (o) => o.name === 'productType',
        );

        this.sizeFilter = this.staticFacets.find((o) => o.name === 'size');
        this.priceFilter = this.staticFacets.find((o) => o.name === 'price');

        this.exportType = get(
            this.preferences,
            'exportSettings.type',
            defaultPreferences.exportType,
        );
    }

    async componentDidMount() {
        window.addEventListener('resize', this.updateDimensions);
        try {
            const inputRef = get(searchRef, 'current._inputRef', null);

            if(this.userId) {
                userIdObj = {
                    userId: this.userId
                }
            }
            if (inputRef) {
                const param = new URLSearchParams(window.location.search).get(
                    'q',
                );
                if (!param) {
                    inputRef.focus();
                }
            }

            if (
                get(
                    this.resultSettings,
                    'rsConfig.infiniteScroll',
                    defaultPreferences.resultSettings.rsConfig.infiniteScroll,
                )
            ) {
                const containerCollection = document.getElementsByClassName(
                    'ant-modal',
                );

                if (containerCollection && containerCollection.length > 0) {
                    // eslint-disable-next-line
                    this.scrollContainer = containerCollection[0];
                    this.scrollContainer.addEventListener(
                        'scroll',
                        this.scrollHandler,
                    );
                }
            }
        } catch (error) {
            // eslint-disable-next-line
            console.error(error);
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    updateDimensions = () => {
        this.setState({
            isMobile: window.innerWidth <= 768,
            toggleFilters: false,
        });
    };

    scrollHandler = () => {
        const { scrollTop, clientHeight, scrollHeight } = this.scrollContainer;

        if (scrollTop + clientHeight >= scrollHeight) {
            if (resultRef.current) {
                resultRef.current.loadMore();
            }
        }
    };

    getMultiListProps = (listComponentProps) => {
        const { title, ...restProps } = listComponentProps;
        return restProps;
    };

    handleToggleFilter = () => {
        this.setState(({ toggleFilters }) => ({
            toggleFilters: !toggleFilters,
        }));
    };

    getFontFamily = () => {
        const receivedFont = get(this.theme, 'typography.fontFamily', '');
        let fontFamily = '';
        if (receivedFont && receivedFont !== 'default') {
            fontFamily = receivedFont; // eslint-disable-line
        }
        return fontFamily ? { fontFamily } : {};
    };

    renderCollectionFilter = (font) => {
        if (!this.collectionFilter) {
            return null;
        }

        const type = get(this.collectionFilter, 'rsConfig.filterType', '');
        if(type === 'list') {
            return (
                <React.Fragment>
                    <ReactiveComponent
                        componentId="filter_by_collection"
                        customQuery={() =>
                            this.exportType === 'shopify'
                                ? {
                                    query: {
                                        term: { 'type.keyword': ['collection'] },
                                    },
                                }
                                : null
                        }
                    />
                    <MultiList
                        innerClass={{
                            input: 'list-input'
                        }}
                        componentId="collection"
                        dataField="collection"
                        style={{

                        }}
                        defaultQuery={() => ({
                            aggs: {
                                collections: {
                                    terms: {
                                        field: '_id',
                                        size: 50,
                                        order: {
                                            'product_count.value': 'desc',
                                        },
                                    },
                                    aggs: {
                                        top_collections: {
                                            top_hits: {
                                                _source: {
                                                    includes: [
                                                        'title',
                                                        'product_count',
                                                    ],
                                                },
                                                size: 1,
                                            },
                                        },
                                        product_count: {
                                            sum: {
                                                field: 'product_count',
                                            },
                                        },
                                    },
                                },
                            },
                        })}
                        size={50}
                        showCheckbox={this.themeType !== 'minimal'}
                        react={{
                            and: [
                                'filter_by_collection',
                                // TODO: Make it reactive to other filters
                                // ...getReactDependenciesFromPreferences(
                                //     this.preferences,
                                //     'collection',
                                // ),
                            ],
                        }}
                        // TODO: transform the value to title later
                        showFilter={false}
                        render={({ loading, data, value, handleChange }) => {
                            if (loading) {
                                return (
                                    <div
                                        css={loaderStyle}
                                        // eslint-disable-next-line
                                        dangerouslySetInnerHTML={{
                                            __html: get(
                                                this.collectionFilter,
                                                'customMessages.loading',
                                                'Loading collections',
                                            ),
                                        }}
                                    />
                                );
                            }
                            return (
                                <UL role="listbox" aria-label="collection-items">
                                    {data.length ? null : (
                                        <div
                                            // eslint-disable-next-line
                                            dangerouslySetInnerHTML={{
                                                __html: get(
                                                    this.collectionFilter,
                                                    'customMessages.noResults',
                                                    'No items Found',
                                                ),
                                            }}
                                        />
                                    )}
                                    {data.map((item) => {
                                        const isChecked = !!value[item.key];
                                        const title = get(
                                            item,
                                            'top_collections.hits.hits[0]._source.title',
                                        );
                                        const count = get(
                                            item,
                                            'top_collections.hits.hits[0]._source.product_count',
                                        );
                                        return (
                                            <li
                                                key={item.key}
                                                className={\`\${
                                                    isChecked ? 'active' : ''
                                                }\`}
                                                role="option"
                                                aria-checked={isChecked}
                                                aria-selected={isChecked}
                                            >
                                                <Checkbox
                                                    id={\`collection-\${item.key}\`}
                                                    name={\`collection-\${item.key}\`}
                                                    value={item.key}
                                                    onChange={handleChange}
                                                    checked={isChecked}
                                                    show
                                                />
                                                {/* eslint-disable-next-line */}
                                                <label
                                                    htmlFor={\`collection-\${item.key}\`}
                                                >
                                                    <span>
                                                        <span>{title}</span>
                                                        <span>{count}</span>
                                                    </span>
                                                </label>
                                            </li>
                                        );
                                    })}
                                </UL>
                            );
                        }}
                        URLParams
                        {...get(this.collectionFilter, 'rsConfig')}
                        title=""
                    />
                </React.Fragment>
            );
        }

        if( get(this.collectionFilter, 'rsConfig.startValue', '') && get(this.collectionFilter, 'rsConfig.endValue', '')) {
            return (
                <RangeInput
                    key="filter_by_collection"
                    componentId="filter_by_collection"
                    dataField={get(
                        this.collectionFilter,
                        'rsConfig.dataField',
                        shopifyDefaultFields.size,
                    )}
                    range={{
                        start: parseInt(get(
                            this.collectionFilter,
                            'rsConfig.startValue',
                            ''
                        ), 10),
                        end: parseInt(get(
                            this.collectionFilter,
                            'rsConfig.endValue',
                            ''
                        ), 10),
                    }}
                    rangeLabels={{
                        start: get(
                            this.collectionFilter,
                            'rsConfig.startLabel',
                            ''
                        ),
                        end: get(
                            this.collectionFilter,
                            'rsConfig.endLabel',
                            ''
                        ),
                    }}
                    showHistogram={get(
                        this.collectionFilter,
                        'rsConfig.showHistogram',
                        false
                    )}
                    filterLabel={get(this.collectionFilter, 'rsConfig.title', 'Collection')}
                    URLParams
                    css={font}
                />
            );
        }
        return (
            <DynamicRangeSlider
                key="filter_by_collection"
                componentId="filter_by_collection"
                dataField={get(
                    this.collectionFilter,
                    'rsConfig.dataField',
                    shopifyDefaultFields.size,
                )}
                showHistogram={get(
                    this.collectionFilter,
                    'rsConfig.showHistogram',
                    false
                )}
                filterLabel={get(this.collectionFilter, 'rsConfig.title', 'Collection')}
                URLParams
                css={font}
            />
        )

    };

    renderProductTypeFilter = (font) => {
        if (!this.productTypeFilter) {
            return null;
        }

        const type = get(this.productTypeFilter, 'rsConfig.filterType', '');
        if(type === 'list') {
            return (
                <MultiList
                    componentId="productType"
                    dataField="product_type.keyword"
                    innerClass={{
                        input: 'list-input'
                    }}
                    css={font}
                    showCheckbox={this.themeType !== 'minimal'}
                    react={{
                        and: [
                            ...getReactDependenciesFromPreferences(
                                this.preferences,
                                'productType',
                            ),
                        ],
                    }}
                    filterLabel="Product Type"
                    URLParams
                    {...get(this.productTypeFilter, 'rsConfig')}
                    title=""
                />
            );
        }

        if( get(this.productTypeFilter, 'rsConfig.startValue', '') && get(this.productTypeFilter, 'rsConfig.endValue', '')) {
            return (
                <RangeInput
                    key="productType"
                    componentId="productType"
                    dataField="product_type"
                    range={{
                        start: parseInt(get(
                            this.productTypeFilter,
                            'rsConfig.startValue',
                            ''
                        ), 10),
                        end: parseInt(get(
                            this.productTypeFilter,
                            'rsConfig.endValue',
                            ''
                        ), 10),
                    }}
                    rangeLabels={{
                        start: get(
                            this.productTypeFilter,
                            'rsConfig.startLabel',
                            ''
                        ),
                        end: get(
                            this.productTypeFilter,
                            'rsConfig.endLabel',
                            ''
                        ),
                    }}
                    showHistogram={get(
                        this.productTypeFilter,
                        'rsConfig.showHistogram',
                        false
                    )}
                    URLParams
                    filterLabel={get(this.productTypeFilter, 'rsConfig.title', 'productType')}
                    css={font}
                />
            );
        }
        return (
            <DynamicRangeSlider
                key="productType"
                componentId="productType"
                dataField={get(
                    this.productTypeFilter,
                    'rsConfig.dataField',
                    shopifyDefaultFields.size,
                )}
                showHistogram={get(
                    this.productTypeFilter,
                    'rsConfig.showHistogram',
                    false
                )}
                URLParams
                css={font}
                filterLabel={get(this.productTypeFilter, 'rsConfig.title', 'productType')}
            />
        )
    };

    renderColorFilter = (font) => {
        const type = get(this.colorFilter, 'rsConfig.filterType', '');
        if(type === 'list') {
            return (
                <MultiList
                    componentId="color"
                    innerClass={{
                        input: 'list-input'
                    }}
                    react={{
                        and: [
                            'colorOption',
                            ...getReactDependenciesFromPreferences(
                                this.preferences,
                                'color',
                            ),
                        ],
                    }}
                    showSearch={false}
                    css={font}
                    showCheckbox={this.themeType !== 'minimal'}
                    render={({ loading, error, data, handleChange, value }) => {
                        const values = [...new Set(Object.keys(value))];
                        const browserStringColors = Object.keys(browserColors);
                        if (loading) {
                            return (
                                <div
                                    css={loaderStyle}
                                    // eslint-disable-next-line
                                    dangerouslySetInnerHTML={{
                                        __html: get(
                                            this.colorFilter,
                                            'customMessages.noResults',
                                            'Fetching Colors',
                                        ),
                                    }}
                                />
                            );
                        }
                        if (error) {
                            return (
                                <div>
                                    No colors found!
                                </div>
                            );
                        }
                        if (data.length === 0) {
                            return (
                                <div
                                    // eslint-disable-next-line
                                    dangerouslySetInnerHTML={{
                                        __html: get(
                                            this.colorFilter,
                                            'customMessages.noResults',
                                            'Fetching Colors',
                                        ),
                                    }}
                                />
                            );
                        }
                        const primaryColor =
                            get(this.theme, 'colors.primaryColor', '') || '#0B6AFF';
                        const normalizedData = [];
                        data.forEach((i) => {
                            if (
                                !normalizedData.find(
                                    (n) => n.key === i.key.toLowerCase(),
                                )
                            ) {
                                normalizedData.push({
                                    ...i,
                                    key: i.key.toLowerCase(),
                                });
                            }
                        });
                        return (
                            <div css={colorContainer}>
                                {normalizedData.map((item) =>
                                    browserStringColors.includes(
                                        item.key.toLowerCase(),
                                    ) ? (
                                        <Tooltip
                                            key={item.key}
                                            placement="top"
                                            title={item.key}
                                        >
                                            {/* eslint-disable-next-line */}
                                            <div
                                                onClick={() => handleChange(item.key)}
                                                style={{
                                                    width: '100%',
                                                    height: 30,
                                                    background: item.key,
                                                    transition: 'all ease .2s',
                                                    cursor: 'pointer',
                                                    border:
                                                        values &&
                                                        values.includes(item.key)
                                                            ? \`2px solid \${primaryColor}\`
                                                            : \`1px solid #ccc\`,
                                                }}
                                            />
                                        </Tooltip>
                                    ) : null,
                                )}
                            </div>
                        );
                    }}
                    loader={
                        <div
                            css={loaderStyle}
                            // eslint-disable-next-line
                            dangerouslySetInnerHTML={{
                                __html: get(
                                    this.colorFilter,
                                    'customMessages.loading',
                                    'Loading colors',
                                ),
                            }}
                        />
                    }
                    URLParams
                    {...get(this.colorFilter, 'rsConfig')}
                    dataField={get(
                        this.colorFilter,
                        'rsConfig.dataField',
                        shopifyDefaultFields.color,
                    )}
                    title=""
                />
            );
        }

        if( get(this.colorFilter, 'rsConfig.startValue', '') && get(this.colorFilter, 'rsConfig.endValue', '')) {
            return (
                <RangeInput
                    key="color"
                    componentId="color"
                    dataField={get(
                        this.colorFilter,
                        'rsConfig.dataField',
                        shopifyDefaultFields.size,
                    )}
                    range={{
                        start: parseInt(get(
                            this.colorFilter,
                            'rsConfig.startValue',
                            ''
                        ), 10),
                        end: parseInt(get(
                            this.colorFilter,
                            'rsConfig.endValue',
                            ''
                        ), 10),
                    }}
                    rangeLabels={{
                        start: get(
                            this.colorFilter,
                            'rsConfig.startLabel',
                            ''
                        ),
                        end: get(
                            this.colorFilter,
                            'rsConfig.endLabel',
                            ''
                        ),
                    }}
                    showHistogram={get(
                        this.colorFilter,
                        'rsConfig.showHistogram',
                        false
                    )}
                    URLParams
                    css={font}
                    filterLabel={get(this.colorFilter, 'rsConfig.title', 'color')}
                />
            )
        }
        return (
            <DynamicRangeSlider
                key="color"
                componentId="color"
                dataField={get(
                    this.colorFilter,
                    'rsConfig.dataField',
                    shopifyDefaultFields.size,
                )}
                showHistogram={get(
                    this.colorFilter,
                    'rsConfig.showHistogram',
                    false
                )}
                URLParams
                filterLabel={get(this.colorFilter, 'rsConfig.title', 'color')}
                css={font}
            />
        )

    }

    renderSizeFilter = (font) => {
        const type = get(this.sizeFilter, 'rsConfig.filterType', '');
        if(type === 'list') {
            return (
                <React.Fragment>
                    <MultiList
                        componentId="size"
                        innerClass={{
                            input: 'list-input'
                        }}
                        react={{
                            and: [
                                'sizeOption',
                                ...getReactDependenciesFromPreferences(
                                    this.preferences,
                                    'size',
                                ),
                            ],
                        }}
                        css={font}
                        loader={
                            <div
                                css={loaderStyle}
                                // eslint-disable-next-line
                                dangerouslySetInnerHTML={{
                                    __html: get(
                                        this.sizeFilter,
                                        'customMessages.loading',
                                        'Loading sizes',
                                    ),
                                }}
                            />
                        }
                        renderNoResults={() => (
                            <div
                                // eslint-disable-next-line
                                dangerouslySetInnerHTML={{
                                    __html: get(
                                        this.sizeFilter,
                                        'customMessages.noResults',
                                        'No sizes Found',
                                    ),
                                }}
                            />
                        )}
                        showCheckbox={this.themeType !== 'minimal'}
                        URLParams
                        {...get(this.sizeFilter, 'rsConfig')}
                        dataField={get(
                            this.sizeFilter,
                            'rsConfig.dataField',
                            shopifyDefaultFields.size,
                        )}
                        title=""
                    />
                </React.Fragment>
            );
        }

        if( get(this.sizeFilter, 'rsConfig.startValue', '') && get(this.sizeFilter, 'rsConfig.endValue', '')) {
            return (
                <RangeInput
                    key="size"
                    componentId="size"
                    dataField={get(
                        this.sizeFilter,
                        'rsConfig.dataField',
                        shopifyDefaultFields.size,
                    )}
                    range={{
                        start: parseInt(get(
                            this.sizeFilter,
                            'rsConfig.startValue',
                            ''
                        ), 10),
                        end: parseInt(get(
                            this.sizeFilter,
                            'rsConfig.endValue',
                            ''
                        ), 10),
                    }}
                    rangeLabels={{
                        start: get(
                            this.sizeFilter,
                            'rsConfig.startLabel',
                            ''
                        ),
                        end: get(
                            this.sizeFilter,
                            'rsConfig.endLabel',
                            ''
                        ),
                    }}
                    showHistogram={get(
                        this.sizeFilter,
                        'rsConfig.showHistogram',
                        false
                    )}
                    URLParams
                    css={font}
                    filterLabel={get(this.sizeFilter, 'rsConfig.title', 'size')}
                />
            );
        }
        return (
            <DynamicRangeSlider
                key="size"
                componentId="size"
                dataField={get(
                    this.sizeFilter,
                    'rsConfig.dataField',
                    shopifyDefaultFields.size,
                )}
                showHistogram={get(
                    this.sizeFilter,
                    'rsConfig.showHistogram',
                    false
                )}
                URLParams
                css={font}
                filterLabel={get(this.sizeFilter, 'rsConfig.title', 'size')}
            />
        )

    }

    renderPriceFilter = (font) => {
        if( get(this.priceFilter, 'rsConfig.startValue', '') && get(this.priceFilter, 'rsConfig.endValue', '')) {
            return (
                <RangeInput
                    componentId="price"
                    dataField={get(
                        this.priceFilter,
                        'rsConfig.dataField',
                        'variants.price',
                    )}
                    range={{
                        start: parseInt(get(
                            this.priceFilter,
                            'rsConfig.startValue',
                            ''
                        ), 10),
                        end: parseInt(get(
                            this.priceFilter,
                            'rsConfig.endValue',
                            ''
                        ), 10),
                    }}
                    rangeLabels={{
                        start: get(
                            this.priceFilter,
                            'rsConfig.startLabel',
                            ''
                        ),
                        end: get(
                            this.priceFilter,
                            'rsConfig.endLabel',
                            ''
                        ),
                    }}
                    showHistogram={get(
                        this.priceFilter,
                        'rsConfig.showHistogram',
                        false
                    )}
                    URLParams
                    css={font}
                    filterLabel={get(this.priceFilter, 'rsConfig.title', 'size')}
                />
            )
        }

        return (
            <DynamicRangeSlider
                componentId="price"
                dataField={get(
                    this.priceFilter,
                    'rsConfig.dataField',
                    'variants.price',
                )}
                showHistogram={get(
                    this.priceFilter,
                    'rsConfig.showHistogram',
                    false
                )}
                URLParams
                css={font}
                style={{
                    marginTop: 50,
                }}
                loader={
                    <div
                        css={loaderStyle}
                        // eslint-disable-next-line
                        dangerouslySetInnerHTML={{
                            __html: get(
                                this.priceFilter,
                                'customMessages.loading',
                                '',
                            ),
                        }}
                    />
                }
                rangeLabels={(min, max) => ({
                    start: \`\${
                        this.currency
                    } \${min.toFixed(2)}\`,
                    end: \`\${
                        this.currency
                    } \${max.toFixed(2)}\`,
                })}
                {...this.priceFilter.rsConfig}
                title=""
            />
        )
    }

    isMobile = () => {
        return window.innerWidth <= 768 ;
    }

    renderCategorySearch = (categorySearchProps) => {
        const { toggleFilters, blur } = this.state;
        const { isPreview } = this.props;
        const searchIcon = get(this.searchSettings, 'searchButton.icon', '');

        return (
            <SearchBox
                // Don't change the component id it is tied to shopify
                componentId="q"
                filterLabel="Search"
                className="search"
                debounce={100}
                placeholder={get(this.searchSettings, 'searchButton.text') || "Search for products..."}
                iconPosition="right"
                icon={searchIcon ? <img src={searchIcon} alt="Search Icon" width="20px" height="20px"/> : searchIcon}
                ref={searchRef}
                URLParams
                style={{
                    marginBottom: 20,
                    position: 'sticky',
                    top: '10px',
                    zIndex: 10000,
                    display: toggleFilters ? 'none' : 'block',
                    background: 'white'
                }}
                // onKeyDown={(e) => {
                //     if(e.keyCode === 27) {
                //         document.getElementById('q-downshift-input').blur();
                //     }
                // }}
                popularSuggestionsConfig={{
                    size: 3,
                }}
                recentSuggestionsConfig={{
                    size: 3,
                }}
                size={10}
                onFocus={(e) => { this.setState({ blur: false })}}
                onBlur={(e) => { this.setState({ blur: true })}}
                render={({
                    value,
                    categories,
                    data,
                    downshiftProps,
                    loading,
                }) => {
                    return downshiftProps.isOpen &&
                        (
                        <Suggestions
                            blur={blur}
                            themeType={this.themeType}
                            fields={get(this.searchSettings, 'fields', {})}
                            currentValue={value}
                            customMessage={get(
                                this.searchSettings,
                                'customMessages',
                                {},
                            )}
                            getItemProps={downshiftProps.getItemProps}
                            highlightedIndex={downshiftProps.highlightedIndex}
                            themeConfig={this.theme}
                            currency={this.currency}
                            customSuggestions={get(
                                this.searchSettings,
                                'customSuggestions',
                            )}
                            isPreview={isPreview}
                            suggestions={data}
                            popularSuggestions={data.filter(
                                (suggestion) =>
                                    get(suggestion, '_suggestion_type') ===
                                    'popular',
                            )}
                            recentSearches={data.filter(
                                (suggestion) =>
                                    get(suggestion, '_suggestion_type') ===
                                    'recent',
                            )}
                            parsedSuggestions={data.filter(
                                (suggestion) =>
                                    get(suggestion, '_suggestion_type') ===
                                    'index',
                            )}
                            loading={loading}
                            highlight={this.searchSettings.rsConfig.highlight}
                        />
                    ) ;
                }}
                {...this.searchSettings.rsConfig}
                {...categorySearchProps}
                showDistinctSuggestions
                highlight={get(this.resultSettings, 'resultHighlight', false)}
            />
        );
    };

    render() {
        const { toggleFilters, isMobile } = this.state;
        const { isPreview } = this.props;
        let newProps = {};
        if(get(this.resultSettings, 'sortOptionSelector', []).length) {
            newProps = {
                sortOptions: get(this.resultSettings, 'sortOptionSelector')
            }
        }

        const logoSettings = get(this.globalSettings, 'meta.branding', {});
        const mapsAPIkey = get(this.resultSettings, 'mapsAPIkey', '');

        return (
            <ReactiveBase
                app={this.index}
                url={this.url}
                credentials={this.credentials}
                theme={this.theme}
                enableAppbase
                appbaseConfig={{
                    recordAnalytics: true,
                    ...userIdObj
                }}
                mapKey={mapsAPIkey}
                setSearchParams={
                    isPreview
                        ? () => {}
                        : (url) => {
                            window.history.pushState({ path: url }, '', url);
                            return url;
                        }
                }
                getSearchParams={
                    isPreview
                        ? () => {}
                        : () => {
                            const params = new URLSearchParams(
                                window.location.search,
                            );
                            const searchParam = params.get('q');
                            if (searchParam) {
                                try {
                                    JSON.parse(searchParam);
                                } catch (e) {
                                    params.set(
                                        'q',
                                        JSON.stringify(params.get('q')),
                                    );
                                }
                            }
                            return params.toString();
                        }
                }
            >
                <Global
                    styles={css\`
                        \${get(this.themeSettings, 'customCss', '')}
                        \`}
                />
                {isMobile && this.dynamicFacets.length ? (
                    <Affix
                        style={{
                            position: 'fixed',
                            bottom: 0,
                            zIndex: 4,
                            left: 0,
                            width: '100%',
                        }}
                    >
                        <Button
                            block
                            // ===============edit here=============
                            type="primary"
                            css={mobileButtonStyles}
                            size="large"
                            onClick={this.handleToggleFilter}
                        >
                            <Icon type={toggleFilters ? 'list' : 'filter'} />
                            {toggleFilters ? 'Show Results' : 'Show Filters'}
                        </Button>
                    </Affix>
                ) : null}

                <div style={{ maxWidth: '90%', margin: '25px auto' }}>

                {Object.keys(logoSettings).length && logoSettings.logoUrl ? (
                    <div>
                        <img
                            src={\`\${logoSettings.logoUrl}/tr:w-\${logoSettings.logoWidth*2}\`}
                            alt="logo-url"
                            style={{
                                width: \`\${logoSettings.logoWidth}px\`,
                                height: \`50px\`,
                                float: \`\${logoSettings.logoAlignment}\`,
                                margin: '10px 0px',
                            }}
                        />
                    </div>
                ): null}

                    {(this.themeType === 'classic' || this.themeType === 'geo') &&
                        this.renderCategorySearch()}

                    <div
                        css={{
                            display: 'grid',
                            gridTemplateColumns: '300px 1fr',
                            [mediaMax.medium]: {
                                gridTemplateColumns: '1fr',
                            },
                            gridGap: 20,
                        }}
                    >
                        <Filters
                            theme={this.theme}
                            isMobile={this.isMobile}
                            themeType={this.themeType}
                            preferences={this.preferences}
                            dynamicFacets={this.dynamicFacets}
                            getFontFamily={this.getFontFamily()}
                            collectionFilter={this.collectionFilter}
                            exportType={this.exportType}
                            toggleFilters={toggleFilters}
                            currency={this.currency}
                        />

                        <div>
                            {this.themeType === 'minimal' &&
                                this.renderCategorySearch({
                                    css: minimalSearchStyles(
                                        get(this.theme, 'colors', {}),
                                    ),
                                })}

                            {get(this.globalSettings, 'showSelectedFilters') &&
                            !toggleFilters &&
                            this.themeType !== 'minimal' ? (
                                <div css={viewSwitcherStyles}>
                                    <SelectedFilters showClearAll="default" />
                                </div>
                            ) : null}
                            <ReactiveComponent
                                componentId="filter_by_product"
                                customQuery={() =>
                                    this.exportType === 'shopify'
                                        ? {
                                            query: {
                                                term: {
                                                    type: 'products',
                                                },
                                            },
                                        }
                                        : null
                                }
                            />
                            {this.themeType === 'geo' ? (
                                <GeoResultsLayout
                                    isPreview={isPreview}
                                />

                            ) : (
                                <ReactiveList
                                    componentId="results"
                                    dataField="title"
                                    ref={resultRef}
                                    defaultQuery={() => ({
                                        track_total_hits: true,
                                    })}
                                    renderNoResults={() => (
                                        <div
                                            style={{ textAlign: 'right' }}
                                            // eslint-disable-next-line
                                            dangerouslySetInnerHTML={{
                                                __html: get(
                                                    this.resultSettings,
                                                    'customMessages.noResults',
                                                    'No Results Found',
                                                ),
                                            }}
                                        />
                                    )}
                                    renderResultStats={({
                                        numberOfResults,
                                        time,
                                    }) => (
                                        <div
                                            // eslint-disable-next-line
                                            dangerouslySetInnerHTML={{
                                                __html: get(
                                                    this.resultSettings,
                                                    'customMessages.resultStats',
                                                    '[count] products found in [time] ms',
                                                )
                                                    .replace(
                                                        '[count]',
                                                        numberOfResults,
                                                    )
                                                    .replace('[time]', time),
                                            }}
                                        />
                                    )}
                                    size={9}
                                    infiniteScroll
                                    render={({ data, triggerClickAnalytics }) => {
                                        return !toggleFilters ? (
                                            <ResultsLayout
                                                data={data}
                                                theme={this.theme}
                                                triggerClickAnalytics={
                                                    triggerClickAnalytics
                                                }
                                                isPreview={isPreview}
                                                getFontFamily={this.getFontFamily()}
                                            />
                                        ) : null;
                                    }}
                                    innerClass={{
                                        list: 'custom-result-list',
                                        resultsInfo: 'custom-result-info',
                                        poweredBy: 'custom-powered-by',
                                        noResults: 'custom-no-results',
                                        pagination: 'custom-pagination',
                                    }}
                                    {...this.resultSettings.rsConfig}
                                    css={reactiveListCls(toggleFilters, this.theme)}
                                    react={{
                                        and: [
                                            'filter_by_product',
                                            ...getReactDependenciesFromPreferences(
                                                this.preferences,
                                                'result',
                                            ),
                                            'ToggleResults',
                                            ...getReactDependenciesFromPreferences(
                                                this.preferences,
                                                'result',
                                            ),
                                        ],
                                    }}
                                    {...newProps}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </ReactiveBase>
        );
    }
}

Search.defaultProps = {
    isPreview: false,
};

Search.propTypes = {
    appname: string.isRequired,
    credentials: string.isRequired,
    isPreview: bool,
};

export default Search;

`;
};
