var http = require('http');
var sys = require('util');
var fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface(process.stdin, process.stdout);
rl.setPrompt('Test> ');

const PORT = 8000;
http.createServer(function (req, res) {
  //debugHeaders(req);

  if (req.headers.accept && req.headers.accept == 'text/event-stream') {
    if (req.url == '/events') {
      sendSSE(req, res);
    } else {
      res.writeHead(404);
      res.end();
    }
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(fs.readFileSync(__dirname + '/sse-node.html'));
    res.end();
  }
}).listen(PORT);
console.log(`The server is listening on ${PORT}.`)

function sendSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  var id = (new Date()).toLocaleTimeString();

  rl.on('line', line => {
    let msg = '';
    if ( line === 'red' ) {
      msg = `<script>document.body.innerHTML = '<div style="background: red;width: 300px;height: 200px"></div>'</script>`;
    } else {
      msg = line;
    }
    constructSSE(res, id, msg);
    console.log(`The message is sent to ${id}`)
    rl.prompt();
  })

  const connectMsg = `User ${id} is connected.`;
  constructSSE(res, id, connectMsg);
  console.log(connectMsg);
  rl.prompt();

  // Sends a SSE every 5 seconds on a single connection.
  // setInterval(function() {
  //   constructSSE(res, id, (new Date()).toLocaleTimeString());
  // }, 5000);

  // constructSSE(res, id, (new Date()).toLocaleTimeString());
}

function constructSSE(res, id, data) {
  res.write('id: ' + id + '\n');
  res.write("data: " + data + '\n\n');
}

function debugHeaders(req) {
  sys.puts('URL: ' + req.url);
  for (var key in req.headers) {
    sys.puts(key + ': ' + req.headers[key]);
  }
  sys.puts('\n\n');
}