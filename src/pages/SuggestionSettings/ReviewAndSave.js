import React, { useState, useEffect, useContext } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'react-emotion';
import { PreferenceFormContext } from './IndexSuggestions';
import { Button, Modal } from 'antd';
import get from 'lodash/get';
import { diff } from 'jsondiffpatch';
import DiffList from '../../components/ReviewAndSave/DiffList';

const Badge = styled.span`
     background: #f5222d;
     color: #fff;
     display: flex;
     justify-content: center;
     align-items: center;
     position: absolute;
     top: -10px;
     right: 0px;
     height: 25px;
     width: 25px;
     border-radius: 50%;
     z-index: 100;
 `;

const ReviewAndSave = ({oldData, newData, isLoading }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const { saveTemplate } = useContext(PreferenceFormContext);

    useEffect(() => {
        setIsOpen(isResetting);
    }, [isResetting]);

    useEffect(() => {
        if(!isLoading) {
            setIsOpen(false)
        }
    },[isLoading])

    const showModal = () => {
        setIsOpen(true);
    };

    const handleCancel = () => {
        setIsOpen(false);
        setIsResetting(false);
    };

    const getDiffData = (oldObj, newObj) => {
        let diffData = diff({ ...oldObj }, { ...newObj });
        if (!diffData) {
            return [0, {}];
        }

        if (get(diffData, 'indexSuggestions.customStopwords', null)) {
            const newVal = get(newObj, 'indexSuggestions.customStopwords', []);
            const oldVal = get(oldObj, 'indexSuggestions.customStopwords', []);

            diffData = {
                ...diffData,
                indexSuggestions: {
                    ...diffData.indexSuggestions,
                    customStopwords: [oldVal.join(', '), newVal.join(', ')],
                },
            };
        }

        if (get(diffData, 'popularSuggestions.indices', null)) {
            const newVal = get(newObj, 'popularSuggestions.indices', []);
            const oldVal = get(oldObj, 'popularSuggestions.indices', []);
            diffData = {
                ...diffData,
                popularSuggestions: {
                    ...diffData.popularSuggestions,
                    indices: [oldVal.join(', '), newVal.join(', ')],
                },
            };
        }

        if (get(diffData, 'recentSuggestions.indices', null)) {
            const newVal = get(newObj, 'recentSuggestions.indices', []);
            const oldVal = get(oldObj, 'recentSuggestions.indices', []);
            diffData = {
                ...diffData,
                recentSuggestions: {
                    ...diffData.recentSuggestions,
                    indices: [oldVal.join(', '), newVal.join(', ')],
                },
            };
        }

        if (get(diffData, 'indexSuggestions.indices', null)) {
            const newVal = get(newObj, 'indexSuggestions.indices', []);
            const oldVal = get(oldObj, 'indexSuggestions.indices', []);
            diffData = {
                ...diffData,
                indexSuggestions: {
                    ...diffData.indexSuggestions,
                    indices: [oldVal.join(', '), newVal.join(', ')],
                },
            };
        }

        if (get(diffData, 'indexSuggestions.customQuery', null)) {
            const newVal = get(newObj, 'indexSuggestions.customQuery', '');
            const oldVal = get(oldObj, 'indexSuggestions.customQuery', '');
            diffData = {
                ...diffData,
                indexSuggestions: {
                    ...diffData.indexSuggestions,
                    customQuery: [oldVal, newVal],
                },
            };
        }

        if (get(diffData, 'indexSuggestions.includeFields', null)) {
            const newVal = get(newObj, 'indexSuggestions.includeFields', []);
            const oldVal = get(oldObj, 'indexSuggestions.includeFields', []);
            diffData = {
                ...diffData,
                indexSuggestions: {
                    ...diffData.indexSuggestions,
                    includeFields: [oldVal.join(', '), newVal.join(', ')],
                },
            };
        }

        if (get(diffData, 'indexSuggestions.excludeFields', null)) {
            const newVal = get(newObj, 'indexSuggestions.excludeFields', []);
            const oldVal = get(oldObj, 'indexSuggestions.excludeFields', []);

            diffData = {
                ...diffData,
                indexSuggestions: {
                    ...diffData.indexSuggestions,
                    excludeFields: [oldVal.join(', '), newVal.join(', ')],
                },
            };
        }

        if (get(diffData, 'popularSuggestions.blacklist', null)) {
           const newVal = get(newObj, 'popularSuggestions.blacklist', []);
           const oldVal = get(oldObj, 'popularSuggestions.blacklist', []);

           diffData = {
               ...diffData,
               popularSuggestions: {
                   ...diffData.popularSuggestions,
                   blacklist: [oldVal.join(', '), newVal.join(', ')],
               },
           };
       }

       diffData = {
            popularSuggestions: get(diffData, 'popularSuggestions', {}),
            recentSuggestions: get(diffData, 'recentSuggestions', {}),
            indexSuggestions: get(diffData, 'indexSuggestions', {}),
        };

        // filter empty fields
        diffData = Object.keys(diffData).reduce((agg, item) => {
            if (Object.keys(diffData[item]).length) {
                return {
                    ...agg,
                    [item]: {
                        ...diffData[item],
                    },
                };
            }
            return agg;
        }, {});

        const topLevelFields = Object.keys(diffData);
        const diffCount = topLevelFields.reduce((agg, item) => {
            const data = diffData[item];
            const count =
                agg +
                Object.keys(data || {}).reduce((sum) => {
                    return sum + 1;
                }, 0);

            return count;
        }, 0);

        return [diffCount, diffData];

    }

    const [diffCount, diffData] = getDiffData(oldData, newData);
    return (
        <div>
            <div style={{ position: 'relative' }}>
                {diffCount > 0 && (
                    <Badge>{diffCount}</Badge>
                )}
                <Button
                    style={{ marginRight: 10 }}
                    size="large"
                    type="primary"
                    disabled={!diffCount }
                    onClick={showModal}
                    data-cy="review-deploy-suggestion-settings"
                >
                    Review and Deploy
                </Button>
            </div>
            <Modal
                visible={isOpen}
                title={
                    'Review Settings Before Deploying'
                }
                onOk={() => {
                    saveTemplate();
                }}
                width={1000}
                style={{
                    top: 20,
                }}
                destroyOnClose
                okText="Review and Save"
                onCancel={handleCancel}
                cancelButtonProps={{ 'data-cy': 'cancel-modal-button' }}
                okButtonProps={{
                    'data-cy': 'review-save-button',
                }}
            >
                <>
                    {isOpen && <DiffList diff={diffData} />}
                </>
            </Modal>
        </div>
    )
}

ReviewAndSave.propTypes = {
    oldData: PropTypes.object.isRequired,
    newData: PropTypes.object.isRequired,
    isLoading: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => {
    const isLoading= get(state, '$savePopularSuggestionsPreferences.isFetching', false);
    console.log(isLoading);
    return {
        isLoading,
    }
};

export default connect(mapStateToProps)(ReviewAndSave);
