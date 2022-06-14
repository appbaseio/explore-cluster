export const Filters = () => {
	return `/** @jsxRuntime classic */
/** @jsx jsx */
import React from "react";
import { css, jsx } from '@emotion/core';
import get from 'lodash.get';
import {
    UL,
    Checkbox,
} from '@appbaseio/reactivesearch/lib/styles/FormControlList';
import { Collapse, Tooltip } from "antd";
import { MultiList, RangeInput, DynamicRangeSlider, ReactiveComponent } from "@appbaseio/reactivesearch";
import { getReactDependenciesFromPreferences, shopifyDefaultFields, browserColors } from "../utils";
import { mediaMax } from '../utils/media';

const { Panel } = Collapse;

const loaderStyle = css\`
    margin: 10px 0;
    position: relative;
\`;

const colorContainer = css\`
    display: grid;
    grid-gap: 5px;
    grid-template-columns: repeat(auto-fill, 30px);
    justify-content: center;
\`;

const Filters = ({
    theme,
    isMobile,
    currency,
    themeType,
    exportType,
    sizeFilter,
    colorFilter,
    priceFilter,
    preferences,
    toggleFilters,
    dynamicFacets,
    getFontFamily,
    collectionFilter,
    productTypeFilter,
}) => {

    const renderCollectionFilter = (font) => {
        if (!collectionFilter) {
            return null;
        }

        const type = get(collectionFilter, 'rsConfig.filterType', '');
        if(type === 'list') {
            return (
                <React.Fragment>
                    <ReactiveComponent
                        componentId="filter_by_collection"
                        customQuery={() =>
                            exportType === 'shopify'
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
                        showCheckbox={themeType !== 'minimal'}
                        react={{
                            and: [
                                'filter_by_collection',
                                // TODO: Make it reactive to other filters
                                // ...getReactDependenciesFromPreferences(
                                //     preferences,
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
                                                collectionFilter,
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
                                                    collectionFilter,
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
                        {...get(collectionFilter, 'rsConfig')}
                        title=""
                    />
                </React.Fragment>
            );
        }

        if( get(collectionFilter, 'rsConfig.startValue', '') && get(collectionFilter, 'rsConfig.endValue', '')) {
            return (
                <RangeInput
                    key="filter_by_collection"
                    componentId="filter_by_collection"
                    dataField={get(
                        collectionFilter,
                        'rsConfig.dataField',
                        shopifyDefaultFields.size,
                    )}
                    range={{
                        start: parseInt(get(
                            collectionFilter,
                            'rsConfig.startValue',
                            ''
                        ), 10),
                        end: parseInt(get(
                            collectionFilter,
                            'rsConfig.endValue',
                            ''
                        ), 10),
                    }}
                    rangeLabels={{
                        start: get(
                            collectionFilter,
                            'rsConfig.startLabel',
                            ''
                        ),
                        end: get(
                            collectionFilter,
                            'rsConfig.endLabel',
                            ''
                        ),
                    }}
                    showHistogram={get(
                        collectionFilter,
                        'rsConfig.showHistogram',
                        false
                    )}
                    filterLabel={get(collectionFilter, 'rsConfig.title', 'Collection')}
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
                    collectionFilter,
                    'rsConfig.dataField',
                    shopifyDefaultFields.size,
                )}
                showHistogram={get(
                    collectionFilter,
                    'rsConfig.showHistogram',
                    false
                )}
                filterLabel={get(collectionFilter, 'rsConfig.title', 'Collection')}
                URLParams
                css={font}
            />
        )

    };

    const renderProductTypeFilter = (font) => {
        if (!productTypeFilter) {
            return null;
        }

        const type = get(productTypeFilter, 'rsConfig.filterType', '');
        if(type === 'list') {
            return (
                <MultiList
                    componentId="productType"
                    dataField="product_type.keyword"
                    innerClass={{
                        input: 'list-input'
                    }}
                    css={font}
                    showCheckbox={themeType !== 'minimal'}
                    react={{
                        and: [
                            ...getReactDependenciesFromPreferences(
                                preferences,
                                'productType',
                            ),
                        ],
                    }}
                    filterLabel="Product Type"
                    URLParams
                    {...get(productTypeFilter, 'rsConfig')}
                    title=""
                />
            );
        }

        if( get(productTypeFilter, 'rsConfig.startValue', '') && get(productTypeFilter, 'rsConfig.endValue', '')) {
            return (
                <RangeInput
                    key="productType"
                    componentId="productType"
                    dataField="product_type"
                    range={{
                        start: parseInt(get(
                            productTypeFilter,
                            'rsConfig.startValue',
                            ''
                        ), 10),
                        end: parseInt(get(
                            productTypeFilter,
                            'rsConfig.endValue',
                            ''
                        ), 10),
                    }}
                    rangeLabels={{
                        start: get(
                            productTypeFilter,
                            'rsConfig.startLabel',
                            ''
                        ),
                        end: get(
                            productTypeFilter,
                            'rsConfig.endLabel',
                            ''
                        ),
                    }}
                    showHistogram={get(
                        productTypeFilter,
                        'rsConfig.showHistogram',
                        false
                    )}
                    URLParams
                    filterLabel={get(productTypeFilter, 'rsConfig.title', 'productType')}
                    css={font}
                />
            );
        }
        return (
            <DynamicRangeSlider
                key="productType"
                componentId="productType"
                dataField={get(
                    productTypeFilter,
                    'rsConfig.dataField',
                    shopifyDefaultFields.size,
                )}
                showHistogram={get(
                    productTypeFilter,
                    'rsConfig.showHistogram',
                    false
                )}
                URLParams
                css={font}
                filterLabel={get(productTypeFilter, 'rsConfig.title', 'productType')}
            />
        )
    };

    const renderColorFilter = (font) => {
        const type = get(colorFilter, 'rsConfig.filterType', '');
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
                                preferences,
                                'color',
                            ),
                        ],
                    }}
                    showSearch={false}
                    css={font}
                    showCheckbox={themeType !== 'minimal'}
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
                                            colorFilter,
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
                                            colorFilter,
                                            'customMessages.noResults',
                                            'Fetching Colors',
                                        ),
                                    }}
                                />
                            );
                        }
                        const primaryColor =
                            get(theme, 'colors.primaryColor', '') || '#0B6AFF';
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
                                    colorFilter,
                                    'customMessages.loading',
                                    'Loading colors',
                                ),
                            }}
                        />
                    }
                    URLParams
                    {...get(colorFilter, 'rsConfig')}
                    dataField={get(
                        colorFilter,
                        'rsConfig.dataField',
                        shopifyDefaultFields.color,
                    )}
                    title=""
                />
            );
        }

        if( get(colorFilter, 'rsConfig.startValue', '') && get(colorFilter, 'rsConfig.endValue', '')) {
            return (
                <RangeInput
                    key="color"
                    componentId="color"
                    dataField={get(
                        colorFilter,
                        'rsConfig.dataField',
                        shopifyDefaultFields.size,
                    )}
                    range={{
                        start: parseInt(get(
                            colorFilter,
                            'rsConfig.startValue',
                            ''
                        ), 10),
                        end: parseInt(get(
                            colorFilter,
                            'rsConfig.endValue',
                            ''
                        ), 10),
                    }}
                    rangeLabels={{
                        start: get(
                            colorFilter,
                            'rsConfig.startLabel',
                            ''
                        ),
                        end: get(
                            colorFilter,
                            'rsConfig.endLabel',
                            ''
                        ),
                    }}
                    showHistogram={get(
                        colorFilter,
                        'rsConfig.showHistogram',
                        false
                    )}
                    URLParams
                    css={font}
                    filterLabel={get(colorFilter, 'rsConfig.title', 'color')}
                />
            )
        }
        return (
            <DynamicRangeSlider
                key="color"
                componentId="color"
                dataField={get(
                    colorFilter,
                    'rsConfig.dataField',
                    shopifyDefaultFields.size,
                )}
                showHistogram={get(
                    colorFilter,
                    'rsConfig.showHistogram',
                    false
                )}
                URLParams
                filterLabel={get(colorFilter, 'rsConfig.title', 'color')}
                css={font}
            />
        )

    }

    const renderSizeFilter = (font) => {
        const type = get(sizeFilter, 'rsConfig.filterType', '');

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
                                    preferences,
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
                                        sizeFilter,
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
                                        sizeFilter,
                                        'customMessages.noResults',
                                        'No sizes Found',
                                    ),
                                }}
                            />
                        )}
                        showCheckbox={themeType !== 'minimal'}
                        URLParams
                        {...get(sizeFilter, 'rsConfig')}
                        dataField={get(
                            sizeFilter,
                            'rsConfig.dataField',
                            shopifyDefaultFields.size,
                        )}
                        title=""
                    />
                </React.Fragment>
            );
        }
        let dateProps = {};
        if(type === 'date') {
            dateProps = {
                queryFormat: 'date',
            }
        }
        if( get(sizeFilter, 'rsConfig.startValue', '') && get(sizeFilter, 'rsConfig.endValue', '')) {
            return (
                <RangeInput
                    key="size"
                    componentId="size"
                    dataField={get(
                        sizeFilter,
                        'rsConfig.dataField',
                        shopifyDefaultFields.size,
                    )}
                    range={{
                        start: type === 'date' ?
                            new Date(get(
                                sizeFilter,
                                'rsConfig.startValue',
                                ''
                            )) :
                            parseInt(get(
                                sizeFilter,
                                'rsConfig.startValue',
                                ''
                            ), 10),
                        end: type === 'date' ?
                            new Date(get(
                                sizeFilter,
                                'rsConfig.endValue',
                                ''
                            )) :
                            parseInt(get(
                                sizeFilter,
                                'rsConfig.endValue',
                                ''
                            ), 10),
                    }}
                    rangeLabels={{
                        start: get(
                            sizeFilter,
                            'rsConfig.startLabel',
                            ''
                        ),
                        end: get(
                            sizeFilter,
                            'rsConfig.endLabel',
                            ''
                        ),
                    }}
                    showHistogram={get(
                        sizeFilter,
                        'rsConfig.showHistogram',
                        false
                    )}
                    URLParams
                    css={font}
                    filterLabel={get(sizeFilter, 'rsConfig.title', 'size')}
                    {...dateProps}
                />
            );
        }
        return (
            <DynamicRangeSlider
                key="size"
                componentId="size"
                dataField={get(
                    sizeFilter,
                    'rsConfig.dataField',
                    shopifyDefaultFields.size,
                )}
                showHistogram={get(
                    sizeFilter,
                    'rsConfig.showHistogram',
                    false
                )}
                URLParams
                css={font}
                filterLabel={get(sizeFilter, 'rsConfig.title', 'size')}
                {...dateProps}
            />
        )

    }

    const renderPriceFilter = (font) => {
        if( get(priceFilter, 'rsConfig.startValue', '') && get(priceFilter, 'rsConfig.endValue', '')) {
            return (
                <RangeInput
                    componentId="price"
                    dataField={get(
                        priceFilter,
                        'rsConfig.dataField',
                        'variants.price',
                    )}
                    range={{
                        start: parseInt(get(
                            priceFilter,
                            'rsConfig.startValue',
                            ''
                        ), 10),
                        end: parseInt(get(
                            priceFilter,
                            'rsConfig.endValue',
                            ''
                        ), 10),
                    }}
                    rangeLabels={{
                        start: get(
                            priceFilter,
                            'rsConfig.startLabel',
                            ''
                        ),
                        end: get(
                            priceFilter,
                            'rsConfig.endLabel',
                            ''
                        ),
                    }}
                    showHistogram={get(
                        priceFilter,
                        'rsConfig.showHistogram',
                        false
                    )}
                    URLParams
                    css={font}
                    filterLabel={get(priceFilter, 'rsConfig.title', 'size')}
                />
            )
        }

        return (
            <DynamicRangeSlider
                componentId="price"
                dataField={get(
                    priceFilter,
                    'rsConfig.dataField',
                    'variants.price',
                )}
                showHistogram={get(
                    priceFilter,
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
                                priceFilter,
                                'customMessages.loading',
                                '',
                            ),
                        }}
                    />
                }
                rangeLabels={(min, max) => ({
                    start: \`\${
                        currency
                    } \${min.toFixed(2)}\`,
                    end: \`\${
                        currency
                    } \${max.toFixed(2)}\`,
                })}
                {...priceFilter.rsConfig}
                title=""
            />
        )
    }

    const queryFormatMillisecondsMap = {
        // the below are arranged in asscending order
        // please maintain the order if adding/ removing property(s)
        minute: 60000,
        hour: 3600000,
        day: 86400000,
        week: 604800000,
        month: 2629746000,
        quarter: 7889238000,
        year: 31556952000,
    }

    const getCalendarIntervalErrorMessage = (totalRange, calendarInterval = 'minute') => {
        const queryFormatMillisecondsMapKeys = Object.keys(queryFormatMillisecondsMap);
        const indexOfCurrentCalendarInterval = queryFormatMillisecondsMapKeys.indexOf(calendarInterval);
        if (indexOfCurrentCalendarInterval === -1) {
            console.error('Invalid calendarInterval Passed');
        }

        if (calendarInterval === 'year') {
            return 'Try using a shorter range of values.';
        }

        for (
            let index = indexOfCurrentCalendarInterval + 1;
            index < queryFormatMillisecondsMapKeys.length;
            index += 1
        ) {
            if (totalRange / Object.values(queryFormatMillisecondsMap)[index] <= 100) {
                const calendarIntervalKey = queryFormatMillisecondsMapKeys[index];
                return {
                    errorMessage: \`Please pass calendarInterval prop with value greater than or equal to a \${calendarIntervalKey} for a meaningful resolution of histogram.\`,
                    calculatedCalendarInterval: calendarIntervalKey,
                };
            }
        }

        return {
            errorMessage: 'Try using a shorter range of values.',
            calculatedCalendarInterval: 'year',
        }; // we return the highest possible interval to shorten then interval value
    };

    return (
        <div
            css={{
                display: 'grid',
                gridTemplateColumns:
                    'repeat(auto-fit, minmax (250px, 1fr))',
                gridGap: 0,
                alignSelf: 'start',
                border:
                    themeType === 'classic'
                        ? '1px solid #eee'
                        : 0,
                [mediaMax.medium]: {
                    display: toggleFilters ? 'grid' : 'none',
                    gridTemplateColumns: '1fr',
                },
                boxShadow:
                    themeType === 'minimal'
                        ? \`0 0 4px \${get(
                            theme,
                            'colors.titleColor',
                        )}1a\`
                        : 0,
                [mediaMax.medium]: {
                    display: toggleFilters ? 'grid' : 'none',
                },
            }}
        >
            <Collapse
                bordered={false}
                defaultActiveKey={getReactDependenciesFromPreferences(
                    preferences,
                )}
            >
                {productTypeFilter ? (
                    <Panel
                        header={
                            <span
                                style={{
                                    color: get(
                                        theme,
                                        'colors.titleColor',
                                    ),
                                    fontWeight: 'bold',
                                    fontSize: '15px',
                                }}
                            >
                                {get(
                                    productTypeFilter,
                                    'rsConfig.title',
                                    'Product Type',
                                )}
                            </span>
                        }
                        showArrow={themeType !== 'minimal'}
                        key="productType"
                        css={getFontFamily}
                        className="filter"
                    >
                        {renderProductTypeFilter(
                            getFontFamily,
                        )}
                    </Panel>
                ) : null}
                {collectionFilter ? (
                    <Panel
                        header={
                            <span
                                style={{
                                    color: get(
                                        theme,
                                        'colors.titleColor',
                                    ),
                                    fontWeight: 'bold',
                                    fontSize: '15px',
                                }}
                            >
                                {get(
                                    collectionFilter,
                                    'rsConfig.title',
                                    'Collections',
                                )}
                            </span>
                        }
                        showArrow={themeType !== 'minimal'}
                        key="collection"
                        css={getFontFamily}
                        className="filter"
                    >
                        {renderCollectionFilter(
                            getFontFamily,
                        )}
                    </Panel>
                ) : null}
                {colorFilter ? (
                    <Panel
                        className="filter"
                        header={
                            <span
                                style={{
                                    color: get(
                                        theme,
                                        'colors.titleColor',
                                    ),
                                    fontWeight: 'bold',
                                    fontSize: '15px',
                                }}
                            >
                                {get(
                                    colorFilter,
                                    'rsConfig.title',
                                    'Color',
                                )}
                            </span>
                        }
                        showArrow={themeType !== 'minimal'}
                        key="color"
                        css={getFontFamily}
                    >
                        {renderColorFilter(
                            getFontFamily,
                        )}
                    </Panel>
                ) : null}
                {sizeFilter ? (
                    <Panel
                        className="filter"
                        header={
                            <span
                                style={{
                                    color: get(
                                        theme,
                                        'colors.titleColor',
                                    ),
                                    fontWeight: 'bold',
                                    fontSize: '15px',
                                }}
                            >
                                {get(
                                    sizeFilter,
                                    'rsConfig.title',
                                    'Size',
                                )}
                            </span>
                        }
                        showArrow={themeType !== 'minimal'}
                        key="size"
                        css={getFontFamily}
                    >
                        {renderSizeFilter(
                            getFontFamily,
                        )}
                    </Panel>
                ) : null}
                {priceFilter ? (
                    <Panel
                        header={
                            <span
                                style={{
                                    color: get(
                                        theme,
                                        'colors.titleColor',
                                    ),
                                    fontWeight: 'bold',
                                    fontSize: '15px',
                                }}
                            >
                                {get(
                                    priceFilter,
                                    'rsConfig.title',
                                    'Price',
                                )}
                            </span>
                        }
                        showArrow={themeType !== 'minimal'}
                        key="price"
                        css={getFontFamily}
                        className="filter"
                    >
                        {renderPriceFilter(
                            getFontFamily,
                        )}
                    </Panel>
                ) : null}
                {dynamicFacets.map((listComponent) => {
                    const type = listComponent?.rsConfig?.filterType;
                    let dateProps = {};
                    const calendarInterval = get(
                        listComponent,
                        'rsConfig.calendarInterval',
                        'year'
                    )
                    if(type === 'date') {
                        dateProps = {
                            queryFormat: 'date',
                            // eslint-disable-next-line
                            calendarInterval: calendarInterval ? calendarInterval : getCalendarIntervalErrorMessage(
                                new Date(get(
                                    listComponent,
                                    'rsConfig.startValue',
                                    ''
                                ))
                                -
                                new Date(get(
                                    listComponent,
                                    'rsConfig.endValue',
                                    ''
                                ))
                            ).calculatedCalendarInterval
                        }
                        console.log(calendarInterval);
                    }
                    return (
                        <Panel
                            header={
                                <span
                                    style={{
                                        color: get(
                                            theme,
                                            'colors.titleColor',
                                        ),
                                        fontWeight: 'bold',
                                        fontSize: '15px',
                                    }}
                                >
                                    {get(
                                        listComponent,
                                        'rsConfig.title',
                                    )}
                                </span>
                            }
                            showArrow={themeType !== 'minimal'}
                            key={get(
                                listComponent,
                                'rsConfig.componentId',
                            )}
                            css={{
                                ...getFontFamily,
                                maxWidth: isMobile
                                    ? 'none'
                                    : '298px',
                            }}
                            className="filter"
                        >
                            {
                                // eslint-disable-next-line no-nested-ternary
                                type === 'list' ? (
                                    <MultiList
                                        key={get(
                                            listComponent,
                                            'rsConfig.componentId',
                                        )}
                                        innerClass={{
                                            input: 'list-input'
                                        }}
                                        componentId={get(
                                            listComponent,
                                            'rsConfig.componentId',
                                        )}
                                        URLParams
                                        loader={
                                            <div
                                                css={loaderStyle}
                                                // eslint-disable-next-line
                                                dangerouslySetInnerHTML={{
                                                    __html: get(
                                                        listComponent,
                                                        'customMessages.loading',
                                                        'Loading options',
                                                    ),
                                                }}
                                            />
                                        }
                                        renderNoResults={() => (
                                            <div
                                                // eslint-disable-next-line
                                                dangerouslySetInnerHTML={{
                                                    __html: get(
                                                        listComponent,
                                                        'customMessages.noResults',
                                                        'No items Found',
                                                    ),
                                                }}
                                            />
                                        )}
                                        showCount={
                                            themeType !== 'minimal'
                                        }
                                        showCheckbox={
                                            themeType !== 'minimal'
                                        }
                                        {...listComponent.rsConfig}
                                        dataField={get(
                                            listComponent,
                                            'rsConfig.dataField',
                                        )}
                                        css={getFontFamily}
                                        react={{
                                            and: getReactDependenciesFromPreferences(
                                                preferences,
                                                get(
                                                    listComponent,
                                                    'rsConfig.componentId',
                                                ),
                                            ),
                                        }}
                                        filterLabel={get(
                                            listComponent,
                                            'rsConfig.filterLabel',
                                            ''
                                            ) || get(
                                                listComponent,
                                                'rsConfig.title',
                                                ''
                                            )
                                        }
                                        title=""
                                    />
                                ) : (
                                    (listComponent?.rsConfig?.startValue && listComponent?.rsConfig?.endValue) ? (
                                        <RangeInput
                                            key={get(
                                                listComponent,
                                                'rsConfig.componentId',
                                                ''
                                            )}
                                            componentId={get(
                                                listComponent,
                                                'rsConfig.componentId',
                                                ''
                                            )}
                                            dataField={get(
                                                listComponent,
                                                'rsConfig.dataField',
                                                ''
                                            )}
                                            range={{
                                                start: type === 'date' ?
                                                new Date(get(
                                                    listComponent,
                                                    'rsConfig.startValue',
                                                    ''
                                                )) : parseInt(get(
                                                    listComponent,
                                                    'rsConfig.startValue',
                                                    ''
                                                ), 10),
                                                end: type === 'date' ?
                                                new Date(get(
                                                    listComponent,
                                                    'rsConfig.endValue',
                                                    ''
                                                )) : parseInt(get(
                                                    listComponent,
                                                    'rsConfig.endValue',
                                                    ''
                                                ), 10),
                                            }}
                                            rangeLabels={{
                                                start: get(
                                                    listComponent,
                                                    'rsConfig.startLabel',
                                                    ''
                                                ),
                                                end: get(
                                                    listComponent,
                                                    'rsConfig.endLabel',
                                                    ''
                                                ),
                                            }}
                                            showHistogram={get(
                                                listComponent,
                                                'rsConfig.showHistogram',
                                                false
                                            )}
                                            URLParams
                                            css={getFontFamily}
                                            filterLabel={get(
                                                    listComponent,
                                                    'rsConfig.filterLabel',
                                                    ''
                                                ) || get(
                                                    listComponent,
                                                    'rsConfig.title',
                                                    ''
                                                )
                                            }
                                            {...dateProps}
                                        />
                                    ) : (
                                        <DynamicRangeSlider
                                            key={get(
                                                listComponent,
                                                'rsConfig.componentId',
                                                ''
                                            )}
                                            componentId={get(
                                                listComponent,
                                                'rsConfig.componentId',
                                                ''
                                            )}
                                            dataField={get(
                                                listComponent,
                                                'rsConfig.dataField',
                                                ''
                                            )}
                                            showHistogram={get(
                                                listComponent,
                                                'rsConfig.showHistogram',
                                                false
                                            )}
                                            URLParams
                                            css={getFontFamily}
                                            filterLabel={get(
                                                listComponent,
                                                'rsConfig.filterLabel',
                                                ''
                                                ) || get(
                                                    listComponent,
                                                    'rsConfig.title',
                                                    ''
                                                )
                                            }
                                            {...dateProps}
                                        />
                                    )
                                )
                            }
                        </Panel>
                    )}
                )}
            </Collapse>
        </div>
    )
}

export default Filters;

`;
};
