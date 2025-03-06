#!/bin/bash
#
# Upload documentation to the website
#
# (usually ran from CI)

VERSION="$1"
if [ -z "$VERSION" ]; then
  echo "Usage: $0 <version>, where version is the version major.minor or 'latest'"
  exit 1
fi

rsync -avz --delete build/jsdoc/ markdownmaster@markdownmaster.com:/home/markdownmaster/public_html/jsdocs/$VERSION

if [ "$VERSION" == "latest" ]; then
	rsync -avz --delete docs/ markdownmaster@markdownmaster.com:/home/markdownmaster/public_html/docs

	find dist/extras -name "README.md" | while read README; do
		EXTRA=$(basename $(dirname $README))
		rsync --mkpath "$README" markdownmaster@markdownmaster.com:/home/markdownmaster/public_html/docs/extras/$EXTRA.md
	done
fi
