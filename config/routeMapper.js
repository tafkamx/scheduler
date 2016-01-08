var routeMapper = new RouteMapper();

routeMapper
  .root('Home#index')
  .get('/login', { to : 'Sessions#new', as : 'login'})
  .get('/logout', { to : 'Sessions#destroy', as : 'logout'})
  .post('/login', { to : 'Sessions#create', as : 'login'})

  .resources(['Users'])

  .namespace('InstallationAdmin', function() {
    routeMapper
      .get('/login', { to : 'Sessions#new'})
      .get('/logout', { to : 'Sessions#destroy'})
      .post('/login', { to : 'Sessions#create'})

      .resources([
        'AdminUsers',
        'Installations'
      ])
  });

module.exports = routeMapper;
