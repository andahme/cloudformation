#!/bin/bash


export RELEASE_VERSION=$(cat version.txt | cut -d- -f1)
export MAJOR_VERSION=$(echo ${RELEASE_VERSION} | cut -d. -f1)
export MINOR_VERSION=$(echo ${RELEASE_VERSION} | cut -d. -f2)
export PATCH_VERSION=$(echo ${RELEASE_VERSION} | cut -d. -f3)

export POST_RELEASE_VERSION=${MAJOR_VERSION}.${MINOR_VERSION}.$((${PATCH_VERSION} + 1))-SNAPSHOT


# STATUS
echo RELEASE_VERSION: ${RELEASE_VERSION}
echo POST_RELEASE_VERSION: ${POST_RELEASE_VERSION}


###
# PRE RELEASE
###

# UPDATE VERSION
echo ${RELEASE_VERSION} > version.txt
git add version.txt
git commit -m "Release (v${RELEASE_VERSION})."

# TAG VERSION
git tag v${RELEASE_VERSION}



###
# CREATE RELEASE ARTIFACT
###

# BUILD
find cloudformation -name "*.template" -exec sed -i '' s/SNAPSHOT/v${RELEASE_VERSION}/g {} \;

# PACKAGE
tar -czf aws-stacker-${FULL_VERSION}.tar.gz cloudformation

# CLEANUP
git checkout -- cloudformation/.



###
# POST RELEASE
###

# UPDATE VERSION
echo ${POST_RELEASE_VERSION} > version.txt
git add version.txt
git commit -m "Post release version.txt update."


