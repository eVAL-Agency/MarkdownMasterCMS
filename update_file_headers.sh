#!/bin/bash

# Manually set fields
PROJECT_START="2025"
COPYRIGHT_OWNER="eVAL Agency"

# Fields retrieved from package.json
VERSION="$(grep "version" package.json | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')"
LICENSE="$(grep "license" package.json | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')"
LINK="$(grep "homepage" package.json | sed 's/^.*: //' | sed 's/[",]//g' | tr -d '[[:space:]]')"
PACKAGE="$(grep "title" package.json | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')"

# Calculated fields
YEAR_NOW=$(date +"%Y")
if [ "$YEAR_NOW" != "$PROJECT_START" ]; then
	COPYRIGHT="$PROJECT_START-$YEAR_NOW $COPYRIGHT_OWNER"
else
	COPYRIGHT="$PROJECT_START $COPYRIGHT_OWNER"
fi

if [ -n "$GITHUB_OUTPUT" ]; then
	# If running in a git workflow environment, update file headers
	# Skip this when in development, so as to not overwrite local changes
	find dist -type f -name '*.php' | grep -v 'vendor/' | while read FILE; do
		if ! egrep -q '^ \* @version' "$FILE"; then
			echo "$FILE missing required attribute: @version"
		else
			sed -i "s/^ \* @version.*/ \* @version $VERSION/" "$FILE"
		fi

		if ! egrep -q '^ \* @copyright' "$FILE"; then
			echo "$FILE missing required attribute: @copyright"
		else
			sed -i "s/^ \* @copyright.*/ \* @copyright $COPYRIGHT/" "$FILE"
		fi

		if ! egrep -q '^ \* @license' "$FILE"; then
			echo "$FILE missing required attribute: @license"
		else
			sed -i "s/^ \* @license.*/ \* @license $LICENSE/" "$FILE"
		fi

		if ! egrep -q '^ \* @link' "$FILE"; then
			echo "$FILE missing required attribute: @link"
		else
			sed -i "s#^ \* @link.*# \* @link $LINK#" "$FILE"
		fi

		if ! egrep -q '^ \* @package' "$FILE"; then
			echo "$FILE missing required attribute: @package"
		else
			sed -i "s/^ \* @package.*/ \* @package $PACKAGE/" "$FILE"
		fi
	done
fi
