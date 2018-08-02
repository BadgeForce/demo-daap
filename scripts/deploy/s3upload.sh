#!/usr/bin/env bash

S3_BUCKET=badgeforce-demo-v1
S3_FULL_PATH="s3://$S3_BUCKET"

CDN_DISTRIBUTION_ID="$1"

BUILD_DIR=./build

printMsg() {
    printf "$1\n"
}

s3UploadDeployment() {
    printMsg "uploading to $S3_FULL_PATH"
    aws s3 cp --recursive "$BUILD_DIR" "$S3_FULL_PATH/" --acl public-read
}

invalidateCache() {
    printMsg "invalidating website cache"
    aws cloudfront create-invalidation --distribution-id $CDN_DISTRIBUTION_ID --paths "/*"
}

s3UploadDeployment
invalidateCache

# 178c78185948e36b0e55faa03fba2d2a7b355f4ed8672f2d67339f1541c00ef5