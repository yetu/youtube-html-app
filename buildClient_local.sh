#!/bin/sh
cd clients

echo 'npm install'
npm install

#COMMENT IN WHICH CLIENT YOU WANT TO WATCH LOCALLY

#youtube producer
#echo 'test youtube_producer client'
#npm run test-youtube-producer-local &

#echo 'watch youtube_producer client'
#npm run watch-youtube-producer &

#-----

#youtube_viewer_level2_TV
#TODO: add tests
echo 'watch youtube_viewer_level2_TV client'
npm run watch-youtube-viewer-level2-tv


