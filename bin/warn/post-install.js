var fs = require('fs');
var readline = require('readline'); // For prompts. See: https://nodejs.org/api/readline.html#readline_rl_question_query_callback
var execSync = require('child_process').execSync;

// === These paths possibly subject to change in the future.
var configPath = process.cwd() + '/config/config.js',
  knexPath = process.cwd() + '/knexfile.js',
  knexIMPath = process.cwd() + '/knexinstallationmanager.js';

/**
 * Determines if a file exists, synchronously. `fs.fileExistsSync` no longer supported.
 *
 * @param string path Path to search for file at
 *
 * @return boolean
 */
var fileExists = function(path) {
  try {
    return fs.statSync(path).isFile();
  } catch(err) { return false; }
};

/**
 * Determines if a Postgresql database exists via psql -lqt using grep.
 * This method of database verification could be costly in terms of time, so it is only used in the install routine.
 * See: http://stackoverflow.com/a/16783253
 *
 * @param string db The database name to verify exists.
 *
 * @return boolean
 */
var dbExists = function(db) {
  try {
    return !!execSync('psql -lqt | cut -d \\| -f 1 | grep -qw ' + db);
  } catch(err) { return false; }
};

// === error gets set to TRUE if an error is found.
var error = false;
console.log('PatOS requires that 3 configuration files exist and be properly configured. See README.md for more information.');

// === Check for configuration files existence
if(!fileExists(configPath) || !fileExists(knexPath) || !fileExists(knexIMPath)) {
  error = true;

  console.error('\n' + '=== ERROR ===' + '\n'
    + 'One of the following files is missing from your installation:' + '\n'
    + ' - config/config.js' + '\n'
    + ' - knexfile.js' + '\n'
    + ' - kndexinstallationmanager.js' + '\n\n'
    + 'Please fix this issue before running `npm start`. See README.md for more info' + '\n\n'
  );
} else {
  console.log('All configuration files found successfully.');
}

console.log('--');

// === Retrieve variables from configuration files
var knexConfig = require(knexPath);
var knexIMConfig = require(knexIMPath);
var notFoundDBs = []; // If a database is not found, it's stored here.

/**
 * Searches knex configuration files for database names. Will only work if the client for a single instance is `postgresql`.
 *
 * @param obj config The configuration object as retrieved from the configuration file
 *
 * @return null
 */
var searchForDbs = function(config) {
  for(var env in config) {
    if(config.hasOwnProperty(env)) {
      var dbInfo = config[env];
      if(!dbInfo) continue; // If this is an empty object, we can skip it

      if(dbInfo.client !== 'postgresql' || !dbInfo.connection) {
        console.warn('Unable to check database `' + dbInfo.connection.database + '`.');
      } else if(dbExists(dbInfo.connection.database)) {
        console.log('Found database: `' + dbInfo.connection.database + '`.');
      } else notFoundDBs.push(dbInfo.connection.database);
    }
  }
};

searchForDbs(knexConfig);
searchForDbs(knexIMConfig);

if(notFoundDBs.length) { // TODO, possibly prompt to create databases automatically.
  error = true;
  console.log('WARNING: Could not find databases: ' + notFoundDBs.join(', ') + '. Use command `createdb` to create before using `npm-start`.');
}

if(!error) console.log('\n' + '== Successful post-install check. Server environment is ready to run PatOS ==' + '\n\n');
else console.warn('\n' + '== Errors found with server environment. Check debugging above before continuing. ==' + '\n\n');
