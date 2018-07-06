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
    aws s3 cp --recursive "$BUILD_DIR" "$S3_FULL_PATH/"
}

invalidateCache() {
    printMsg "invalidating website cache"
    aws cloudfront create-invalidation --distribution-id $CDN_DISTRIBUTION_ID --paths "/*"
}

s3UploadDeployment
invalidateCache