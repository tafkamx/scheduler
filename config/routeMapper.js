var routeMapper = new RouteMapper();

routeMapper
  .root('Home#index')
  .get('/login', { to: 'Sessions#new', as: 'login' })
  .get('/logout', { to: 'Sessions#destroy', as: 'logout' })
  .post('/login', { to: 'Sessions#create', as: 'login' })

  .resources([
    'Users',
    'Branches'
  ])

  .namespace('InstallationManager', function() {
    routeMapper
      .root('Home#index')
      .get('/login', { to: 'Sessions#new' })
      .get('/logout', { to: 'Sessions#destroy' })
      .post('/login', { to: 'Sessions#create' })

      .resources([
        'Users',
        'Installations'
      ])

      .resources('Users', function () {
        routeMapper
          .post('/checkPassword', { to: 'Users#checkPassword' })
      })
  });

module.exports = routeMapper;
