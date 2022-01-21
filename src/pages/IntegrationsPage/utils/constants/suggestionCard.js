export const SuggestionCard = () => {
	return `
    /** @jsxRuntime classic */
    /** @jsx jsx */
    import { useEffect, useState } from 'react';
    import { jsx } from '@emotion/core';
    import strip from 'striptags';
    import Truncate from 'react-truncate';
    import { Card, Button, Icon } from 'antd';
    import get from 'lodash.get';
    import { cardStyles, cardTitleStyles } from './Search';
    import { CtaActions, getSearchPreferences } from '../utils';

    const { Meta } = Card;

    const SuggestionCard = ({
        isPreview,
        index,
        triggerAnalytics,
        clickId,
        handle,
        image,
        title,
        body_html,
        currency,
        variants,
        price,
        themeType,
        theme,
        className,
        ctaAction,
        ctaTitle,
        cardStyle,
        ...props
    }) => {
        const [isFontLoaded, setFontLoad] = useState(false);
        useEffect(() => {
            document.fonts.ready.then(() => {
                setFontLoad(true);
            });
        }, []);

        const shouldShowCtaAction = ctaAction !== CtaActions.NO_BUTTON;
        const preferences = getSearchPreferences();
        const redirectUrlText = get(preferences, 'searchSettings.redirectUrlText.text', 'View Product');

        return (
            <div {...props}>
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a
                    onClick={() => {
                        triggerAnalytics(clickId);
                    }}
                    href={
                        shouldShowCtaAction && handle && !isPreview
                            ? \`/products/\${handle}\`
                            : undefined
                    }
                >
                    <Card
                        hoverable
                        bordered={false}
                        css={cardStyles({
                            ...theme.colors,
                        })}
                        className={className || 'card'}
                        cover={
                            <div className="card-image-container">
                                {
                                    image && (
                                        <img
                                            src={image}
                                            width="100%"
                                            alt={title}
                                            onError={(event) => {
                                                event.target.src = "https://www.houseoftara.com/shop/wp-content/uploads/2019/05/placeholder.jpg"; // eslint-disable-line
                                            }}
                                        />
                                    )
                                }
                            </div>
                        }
                        style={{
                            padding: themeType === 'minimal' ? '10px' : 0,
                            ...cardStyle,
                        }}
                        bodyStyle={
                            themeType === 'minimal'
                                ? {
                                    padding: '15px 10px 10px',
                                }
                                : {}
                        }
                    >
                        <Meta
                            title={
                                <h3
                                    css={cardTitleStyles(theme.colors)}
                                    style={
                                        themeType === 'minimal'
                                            ? {
                                                fontWeight: 600,
                                            }
                                            : {}
                                    }
                                >
                                    <Truncate
                                        lines={
                                            1
                                        }
                                        ellipsis={
                                            <span>
                                                ...
                                            </span>
                                        }
                                    >
                                        {strip(
                                            title,
                                        )}
                                    </Truncate>
                                </h3>
                            }
                            description={
                                <div style={{height: 45}}>
                                    {
                                        body_html
                                        ? isFontLoaded && themeType === 'classic' && (
                                            <Truncate
                                                lines={2}
                                                ellipsis={<span>...</span>}
                                            >
                                                {strip(body_html)}
                                            </Truncate>
                                        )
                                        : undefined
                                    }
                                </div>
                            }
                        />
                        <div style={{height: 25}}>
                            {((variants && variants[0]) || price) && (
                                <div>
                                    <h3
                                        style={{
                                            fontWeight: 500,
                                            fontSize: '1rem',
                                            marginTop: 6,
                                            color:
                                                themeType === 'minimal'
                                                    ? theme.colors.textColor
                                                    : theme.colors.titleColor,
                                        }}
                                    >
                                        {currency}{' '}
                                        {variants && variants[0]
                                            ? variants[0].price
                                            : price}
                                    </h3>
                                </div>
                            )}
                        </div>
                        {shouldShowCtaAction ? (
                            <Button
                                type="primary"
                                size="large"
                                className="product-button"
                            >
                                <Icon type="eye" />
                                {redirectUrlText || ctaTitle}
                            </Button>
                        ) : null}
                    </Card>
                </a>
            </div>
        );
    };

    export default SuggestionCard;

    `;
};
