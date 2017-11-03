#!/bin/bash -exu

# Handy little script to compile elm

cd `dirname $0`
exec "$(npm bin)/elm-make" --yes --warn Main.elm --output /dev/null
