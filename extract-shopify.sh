#!/bin/bash

releaseId='67366237'

URL="https://api.github.com/repos/appbaseio/reactivesearch-shopify-plugin/releases/$releaseId"
response=$(curl -s -w "%{http_code}" $URL)
content=$(sed '$ d' <<< "$response")
version=`echo ${content} | jq -r '.name'`

mkdir -p ./constants                 && \
cd constants                         && \
curl -sS https://codeload.github.com/appbaseio/reactivesearch-shopify-plugin/legacy.zip/refs/tags/$version > file.zip && \
unzip file.zip                                  && \
rm file.zip
