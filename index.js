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
    var timecode = +(new Date());

    var workDir = path.join(cwd, 'tmp', ''+timecode);

    var cleanup = function (cb) {
      exec('rm -Rf '+workDir, cb);
    }

    exec('git clone ' + repository_url + ' '+workDir, function (error, stdout, stderr) {
      if (error) {
        console.error('Failed to clone repository');
        console.error(error);
        cleanup();
      } else {
        exec('cd ' + workDir + ';  docker build -t '+DOCKER_USER+'/'+repository_name+' .', function (error, stdout, stderr) {
          if (error) {
            console.error('Failed to build docker image');
            console.error(error);
            cleanup();
          } else {
            exec('cd ' + workDir + ';  docker push', function (error, stdout, stderr) {
              if (error) {
                console.error('Failed to publish docker image');
                console.error(error);
                cleanup();
              } else {
                exec('cd ' + workDir + ';  docker push', function (err, stdout, stderr) {
                  cleanup();
                });
              }
            });
          }
        });
      }
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