#!/bin/bash


export RELEASE_VERSION=${RELEASE_VERSION:=$(cat version.txt | cut -d- -f1)}
export MAJOR_VERSION=$(echo ${RELEASE_VERSION} | cut -d. -f1)
export MINOR_VERSION=$(echo ${RELEASE_VERSION} | cut -d. -f2)
export PATCH_VERSION=$(echo ${RELEASE_VERSION} | cut -d. -f3)

export NEXT_VERSION=${MAJOR_VERSION}.${MINOR_VERSION}.$((${PATCH_VERSION} + 1))


# STATUS
echo RELEASE_VERSION: ${RELEASE_VERSION}
echo NEXT_VERSION: ${NEXT_VERSION}


###
# RELEASE PROCESS
###

# UPDATE VERSION
echo ${RELEASE_VERSION} > version.txt
find cloudformation -name "*.template" -exec sed -i '' "s/(v.*-SNAPSHOT)/(v${RELEASE_VERSION})/g" {} \;

# COMMIT AND TAG
git add version.txt $(find cloudformation -name "*.template")
git commit -m "Release (v${RELEASE_VERSION})."
git tag v${RELEASE_VERSION}

# CREATE RELEASE ARTIFACT
tar -zcf andahme-cloudformation-v${RELEASE_VERSION}.tar.gz cloudformation

# CLEANUP
git reset HEAD~1
git checkout -- .


###
# POST RELEASE PROCESS
###

# UPDATE VERSION
echo ${NEXT_VERSION}-SNAPSHOT > version.txt
find cloudformation -name "*.template" -exec sed -i '' "s/(v.*-SNAPSHOT)/(v${NEXT_VERSION}-SNAPSHOT)/g" {} \;

# COMMIT
git add version.txt $(find cloudformation -name "*.template")
git commit -m "Post release version.txt update (${NEXT_VERSION}-SNAPSHOT)."


