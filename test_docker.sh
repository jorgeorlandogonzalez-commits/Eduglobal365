docker build -t test-app .
docker run --rm test-app node dist/server.cjs || echo "FAILED"
