var Joi = require('joi'),
    Hapi = require('hapi'),
    exec = require('child_process').exec,
    path = require('path'),
    fs = require('fs');


var GITHUB_TOKEN = process.env.GITHUB_TOKEN;
var DOCKER_USER = process.env.DOCKER_USER;

// Create a server with a host and port
var server = new Hapi.Server('0.0.0.0', process.env.port || 8080);



// Add the route
server.route({
  method: 'POST',
  path: '/docker-build',
  handler: function (request, reply) {
    // console.log(body);

    var body = request.payload,
        repository_url = body.repository.ssh_url,
        repository_name = body.repository.name.toLowerCase(),
        cwd = process.cwd();

    // if (body.hook.config.secret != GITHUB_TOKEN)
    var key = body.hook_id;

    var workDir = path.join(cwd, 'tmp', ''+timecode);

    var cleanup = function (cb) {
      exec('rm -Rf '+workDir, cb);
    }
    var cmd = './builder '+key+' '+repository_url+' "'+DOCKER_USER+'/'+repository_name+'" ';
    exec(cmd, function (error,stdout,stderr)  {
      if (error) {
        console.error('Failed to publish docker image');
        console.error(error);
      }
      cleanup();
    });
    reply('Build Away');
  },
  config: {}
});


// server.route({
//   method: '*',
//   path: '/*',
//   handler: function(request, reply) {
//      reply('The page was not found').code(404);
//   }
// });

// Start the server
server.start();