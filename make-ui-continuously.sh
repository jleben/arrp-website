mkdir -p public
cp -r ui/css ui/js public/
docker run --rm -it -v $(pwd):/opt/build pug pug /opt/build/ui/pages \
--basedir /opt/build/ui \
-O "{base_url: ''}" \
--out /opt/build/public \
--watch
