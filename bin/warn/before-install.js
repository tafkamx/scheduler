var execSync = require('child_process').execSync;

/* Function referenced from npm command-exists. Copied to prevent another dependency install for one function */
var commandExists = function(command) {
  var exists;

  try {
    return !!execSync('command -v ' + command +  ' 2>/dev/null && { echo >&1 \'' + command + ' found\'; exit 0; }').toString();
  } catch(err) { return false; }
};

// === NOTE: This file will stop installation from continuing if either of these packages is not found (by ending process with error code 1).
console.log('PatOS requires redis and postgres (not installable through npm).');

// === Checks for postgres
if(!commandExists('psql') || !commandExists('createdb') || !commandExists('psql')) {
  console.error('Unable to detect postgres server install. Make sure package is installed before continuing installation.');
  process.exit(1);
} else {
  console.log('Postgres found with commands `postgres`, `createdb` and `psql`.');
}

// === Checks for redis-server
if(!commandExists('redis-server --help')) { // Using --help here to stop the possibility of redis-server actually starting
  console.error('Unable to detect redis-server. Make sure the package is installed before continuing installation.');
  process.exit(1);
} else {
  console.log('Redis Server found with command `redis-server`.');
}

console.log('\n' + 'Server environment ready for PatOS installation.');
