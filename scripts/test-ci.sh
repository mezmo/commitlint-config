#!/bin/bash
npm run tap -- -R tap

code=$?
npm run tap replay -- -R junit --reporter-file .tap/test.xml
npm run tap replay -- -R jsonstream --reporter-file .tap/tap.json

exit $code
