export const Loader = () => {
    return `
    /** @jsxRuntime classic */
    /** @jsx jsx */
    import { jsx, css } from '@emotion/core';
    import PropTypes from 'prop-types';

    const styles = css\`
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 300px;
        \`

    const Loader = ({ size }) => (
        <div css={styles}>
            <img
                width={size || 50}
                src="https://cdn.jsdelivr.net/gh/appbaseio/reactivesearch-shopify-plugin@9bf06b81f832f7c7613ef008748999f9b7bf0e0b/build/images/loader.svg"
                alt="loading"
            />
        </div>
    );

    Loader.propTypes = {
        size: PropTypes.number,
    };

    export default Loader;
    `;

}
