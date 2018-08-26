var http = require('http');
var fs = require('fs');

function createFilename() {
  let now = Date.now();
  return `${now.getYear()}_${now.getMonth}_${now.getDate}__${now.getHours}_${now.getMinutes}_${now.getSeconds()}.json`;
}

http.createServer(function (req, res) {
  console.log("Received Request: ")
  console.log(JSON.stringify(req.headers))
  let sum = 0;
  req.on('data', (chunk) => {
    sum += chunk.length;
    console.log(`Received ${chunk.length} bytes (${sum}/${req.headers["content-length"]}).`);
  });
  const w = fs.createWriteStream(createFilename());
  req.pipe(w);
  req.on('end', () => console.log("Finished receiving data"));
}).listen(8082);

console.log("created http-server");
