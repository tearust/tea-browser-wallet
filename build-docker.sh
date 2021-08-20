tag=0.1.5
name=tea-browser-wallet

echo building browser-wallet...
npm run build
echo building browser-wallet docker image...
docker build . -t tearust/$name:$tag

echo docker push...
docker push tearust/$name:$tag

echo Done.