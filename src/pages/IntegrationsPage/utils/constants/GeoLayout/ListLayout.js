export const GeoListLayout = () => {
	return `
    /** @jsxRuntime classic */
    /** @jsx jsx */
    import { List, Button, Icon } from 'antd';
    import { css, jsx } from '@emotion/core';
    import { func, array } from "prop-types";
    import get from 'lodash.get';
    import strip from 'striptags';
    import Truncate from 'react-truncate';
    import { mediaMax } from '../../utils/media';
    import { getSearchPreferences, defaultPreferences } from '../../utils';

    export const NoDataStyles = css\`
        .ant-list-empty-text {
            display: none;
        }
    \`;

    export const listStyles = ({ titleColor, primaryColor }) => css\`
        position: relative;
        overflow: hidden;
        padding: 5px 20px;
        width: 100%;
        height: auto;
        .list-image-container {
            width: 150px;
            height: 150px;
            \${mediaMax.medium} {
                width: 100px;
                height: 100px;
            }
        }

        .product-image {
            object-fit: cover;
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


    export default function ListLayout({ data, triggerClickAnalytics, isPreview, renderPagination }) {

        const preferences = getSearchPreferences();

        const theme = get(
            preferences,
            'themeSettings.rsConfig',
            defaultPreferences.themeSettings.rsConfig,
        );

        const currency = get(
            preferences,
            'globalSettings.currency',
            defaultPreferences.globalSettings.currency,
        );

        const resultSettings = get(preferences, 'resultSettings');

        const redirectUrlText = get(preferences, 'searchSettings.redirectUrlText.text', 'View Product');

        return (
            <div style={{ padding: '20px 0px' }}>
                <List
                    css={NoDataStyles}
                    itemLayout="vertical"
                    size="large"
                    dataSource={data}
                    renderItem={(item) => {
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

                        const redirectToProduct = !isPreview || handle;

                        const { variants } = item;

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
                                <List.Item
                                    id={item._id}
                                    onClick={() => triggerClickAnalytics(item._click_id)}
                                    css={listStyles({
                                        ...get(theme, 'colors'),
                                    })}
                                >
                                    <List.Item.Meta
                                        avatar={
                                            <div className="list-image-container">
                                                {image && (
                                                    <img
                                                        className="product-image"
                                                        src={image}
                                                        height="100%"
                                                        width="100%"
                                                        alt={title}
                                                        onError={(event) => {
                                                            event.target.src = 'https://www.houseoftara.com/shop/wp-content/uploads/2019/05/placeholder.jpg'; // eslint-disable-line
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        }
                                        title={
                                            <div>
                                                {title && (
                                                    <Truncate
                                                        lines={1}
                                                        ellipsis={
                                                            <span>...</span>
                                                        }
                                                    >
                                                        {strip(title.toString())}
                                                    </Truncate>
                                                )}
                                            </div>
                                        }
                                        description={
                                            <div>
                                                <div style={{ height: 45 }}>
                                                    {description &&
                                                        <Truncate
                                                            lines={2}
                                                            ellipsis={
                                                                <span>...</span>
                                                            }
                                                        >
                                                            {get(resultSettings, 'resultHighlight', false) ? (
                                                                <p
                                                                    dangerouslySetInnerHTML={{ __html: description }}
                                                                />
                                                            ) : (
                                                                strip(description.toString())
                                                            )}
                                                        </Truncate>
                                                    }
                                                </div>
                                                <div>
                                                    <h3
                                                        style={{
                                                            height: 25,
                                                            fontWeight: 500,
                                                            fontSize: '1rem',
                                                            marginTop: 6,
                                                            color:
                                                                get(
                                                                    theme,
                                                                    'colors.titleColor',
                                                                ),
                                                        }}
                                                    >
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
                                                    </h3>
                                                </div>
                                            </div>
                                        }
                                    />
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
                                </List.Item>
                            </a>
                        );
                    }}
                />
                {renderPagination()}
            </div>
        )
    }

    ListLayout.propTypes = {
        data: array,
        triggerClickAnalytics: func,
    }

    `;
};
