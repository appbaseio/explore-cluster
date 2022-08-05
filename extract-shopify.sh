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
    organization=`echo ${i} | jq -r '.organization'`
    repository=`echo ${i} | jq -r '.repository'`
    repositoryType=`echo ${i} | jq -r '.repositoryType'`

    if [ $repositoryType == "private" ]
    then
        url="https://codeload.github.com/$organization/$repository/legacy.zip/refs/heads/$branch"
        fileName="$repository@$branch"
    elif [ ! -z "$version" ]
    then
        url="https://codeload.github.com/$organization/$repository/legacy.zip/refs/tags/$version"
        fileName="$repository@$version"
    elif [ ! -z "$commit" ]
    then
        url="https://codeload.github.com/$organization/$repository/legacy.zip/$commit"
        fileName="$repository@$commit"
    elif [ ! -z "$branch" ]
    then
        url="https://codeload.github.com/$organization/$repository/legacy.zip/refs/heads/$branch"
        fileName="$repository@$branch"
    else
        url="https://api.github.com/repos/$organization/$repository/zipball/"
        fileName="$repository"
    fi

    if [[ -d ./templates ]]; then
        cd templates
        if [[ ! -d $fileName ]]; then
            mkdir -p $fileName
            cd $fileName
            if [ $repositoryType == "private" ]; then
                curl \
                -H "Accept: application/vnd.github+json" \
                -H "Authorization: token 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" \
                $url > file.zip      && \
                unzip file.zip                                   && \
                rm file.zip
                cd ..
            else
                curl -sS $url > file.zip            && \
                unzip file.zip                      && \
                rm file.zip                         && \
                cd ..
            fi
        fi
        cd ..
    else
        mkdir -p ./templates
        cd templates
        mkdir -p $fileName                  && \
        cd $fileName
        if [ $repositoryType == "private" ]; then
            curl \
            -H "Accept: application/vnd.github+json" \
            -H "Authorization: token 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" \
            $url > file.zip      && \
            unzip file.zip                                   && \
            rm file.zip
            cd ..
            cd ..
        else
            curl -sS $url > file.zip            && \
            unzip file.zip                      && \
            rm file.zip                         && \
            cd ..
            cd ..
        fi
    fi
done

# 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
