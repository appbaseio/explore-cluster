#!/bin/bash
if [[ -d ./templates ]]
then
    rm -rf templates
fi

jq -c '.[]' template-sources.json | while read i; do
    # do stuff with $i
    version=`echo ${i} | jq -r '.version'`
    commit=`echo ${i} | jq -r '.commit'`
    branch=`echo ${i} | jq -r '.branch'`

    if [ ! -z "$version" ]
    then
        url="https://codeload.github.com/appbaseio/reactivesearch-shopify-plugin/legacy.zip/refs/tags/$version"
        fileName="reactivesearch-shopify-plugin@$version"
    elif [ ! -z "$commit" ]
    then
        url="https://codeload.github.com/appbaseio/reactivesearch-shopify-plugin/legacy.zip/$commit"
        fileName="reactivesearch-shopify-plugin@$commit"
    elif [ ! -z "$branch" ]
    then
        url="https://codeload.github.com/appbaseio/reactivesearch-shopify-plugin/legacy.zip/refs/heads/$branch"
        fileName="reactivesearch-shopify-plugin@$branch"
    else
        url="https://api.github.com/repos/appbaseio/reactivesearch-shopify-plugin/zipball/"
        fileName="reactivesearch-shopify-plugin@master"
    fi

    if [[ -d ./templates ]]; then
        cd templates
        if [[ ! -d $fileName ]]; then
            mkdir -p $fileName
            cd $fileName
            curl -sS $url > file.zip  && \
            unzip file.zip                                   && \
            rm file.zip
            cd ..
        fi
        cd ..
    else
        mkdir -p ./templates
        cd templates
        mkdir -p $fileName                  && \
        cd $fileName                        && \
        curl -sS $url > file.zip            && \
        unzip file.zip                      && \
        rm file.zip                         && \
        cd ..
        cd ..
    fi
done
