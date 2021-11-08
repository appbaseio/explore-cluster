import { css } from 'emotion';

const seachAppStyles = css`
    display: flex;
    padding: 10px;
    border-bottom: 1px solid rgb(239, 239, 239);

    .img-container {
        height: 160px;
        width: 160px;
        object-fit: contain;
    }

    .description-container {
        margin: 8px 0px;
        color: #888;
        font-size: 13px;
        line-height: 18px;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
    }
`;

export { seachAppStyles };
