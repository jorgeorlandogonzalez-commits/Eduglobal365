mkdir -p /tmp/runner/dist
cp -r package*.json /tmp/runner/
cp -r dist/* /tmp/runner/dist/
cp -r node_modules /tmp/runner/
cd /tmp/runner
NODE_ENV=production PORT=8080 node dist/server.cjs > /tmp/runner.log 2>&1 &
PID=$!
sleep 3
ps -p $PID || echo "Process exited"
cat /tmp/runner.log
kill $PID
