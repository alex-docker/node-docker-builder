var Joi = require('joi'),
    Hapi = require('hapi'),
    exec = require('child_process').exec,
    path = require('path');


var GITHUB_TOKEN = process.env.GITHUB_TOKEN;
var DOCKER_USER = process.env.DOCKER_USER;

// Create a server with a host and port
var server = new Hapi.Server('0.0.0.0', process.env.port || 8080);



// Add the route
server.route({
  method: 'POST',
  path: '/docker-build',
  handler: function (request, reply) {
    var body = request.payload,
        repository_url = body.repository.ssh_url,
        repository_name = body.repository.name,
        cwd = process.cwd();
    var timecode = +(new Date());

    var workDir = path.join(cwd, 'tmp', timecode);

    var cleanup = function (cb) {
      fs.rmdir(workDir, cb);
    }
    exec('git clone ' + repository + ' '+workDir, function (error, stdout, stderr) {
      if (err) {
        console.error('Failed to clone repository');
        console.error(err);
        cleanup();
      } else {
        exec('cd ' + workDir + ';  docker build -t '+DOCKER_USER+'/'+repository_name+' .', function (error, stdout, stderr) {
          if (err) {
            console.error('Failed to build docker image');
            console.error(err);
            cleanup();
          } else {
            exec('cd ' + workDir + ';  docker push', function (error, stdout, stderr) {
              if (err) {
                console.error('Failed to publish docker image');
                console.error(err);
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
  config: {
    validate: {
      payload: {
        hook: {
          config: {
            secret: Joi.any().valid(GITHUB_TOKEN)
          }
        }
      }
    }
  }

});
server.route({
    method: '*',
    path: '/*',
    handler: function(request, reply) {
       reply('The page was not found').code(404);
    }
  }
});

// Start the server
server.start();