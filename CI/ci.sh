set -e
docker-compose run ci-build bash "./CI/docker-ci.sh"
docker build -t soluto/tweek-api:candidate ./../Tweek.ApiService.NetCore
echo running image;
docker run -d -p 5000:80 --name tweek-latest soluto/tweek-api:candidate;
set +e
curl --retry-delay 5 --retry 20 -v http://localhost:5000/status
set -e
echo running smoke tests;
docker-compose run ci-build bash -c "dotnet restore Tweek.ApiService.SmokeTests/Tweek.ApiService.SmokeTests.csproj && dotnet test Tweek.ApiService.SmokeTests/Tweek.ApiService.SmokeTests.csproj -c Release --no-build";
echo getting version number
TWEEK_VERSION=$(curl http://localhost:5000/status | jq '.EnvironmentDetails .Version' | grep -Po [0-9]+.[0-9]+.[0-9]+)
echo tweek version: $TWEEK_VERSION
docker rm -f tweek-latest
function docker_tag_exists() {
    TOKEN=$(curl -s -H "Content-Type: application/json" -X POST -d '{"username": "'${DOCKER_USERNAME}'", "password": "'${DOCKER_PASSWORD}'"}' https://hub.docker.com/v2/users/login/ | jq -r .token)
    EXISTS=$(curl -s -H "Authorization: JWT ${TOKEN}" https://hub.docker.com/v2/repositories/$1/tags/?page_size=10000 | jq -r "[.results | .[] | .name == \"$2\"]" | grep -c true)
    test $EXISTS = 1
}



if [ $TRAVIS_BRANCH != master ]; then
	echo "no publish for non-master branches"
	exit 0
fi

if docker_tag_exists soluto/tweek-api $TWEEK_VERSION; then
	echo no tagged release
else 
	echo new tagged release
	docker tag soluto/tweek-api:candidate soluto/tweek-api:$TWEEK_VERSION
	docker push soluto/tweek-api:$TWEEK_VERSION
fi

docker tag soluto/tweek-api:candidate soluto/tweek-api:latest
docker push soluto/tweek-api:latest