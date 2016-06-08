module.exports = RouteMapper()
  .get('/', 'Home#index')
  .get('/login', { to: 'Sessions#new', as: 'login' })
  .get('/logout', { to: 'Sessions#destroy', as: 'logout' })
  .post('/login', { to: 'Sessions#create', as: 'login' })
  .get('/resetPassword', {
    to: 'Sessions#resetShow',
    as: 'reset'
  })
  .post('/resetPassword', {
    to: 'Sessions#resetCreate',
    as: 'reset'
  })
  .put('/resetPassword', {
    to: 'Sessions#resetUpdate',
    as: 'reset'
  })

  .resources([
    '/Users',
    '/Branches',
    '/Accounts'
  ])

  .get('/TeacherAvailability/getTeacher', { to: 'TeacherAvailability#getTeacher' })
  .get('/TeacherAvailability/getAllAvailableOn', { to: 'TeacherAvailability#getAllAvailableOn' })
  .get('/TeacherAvailability/isTeacherAvailable', { to: 'TeacherAvailability#isTeacherAvailable' })
  .resources('/TeacherAvailability')

  .namespace('/InstallationManager', function() {
    return RouteMapper()
      .get('/', 'Home#index')
      .get('/login', { to: 'Sessions#new' })
      .get('/logout', { to: 'Sessions#destroy' })
      .post('/login', { to: 'Sessions#create' })
      .get('/resetPassword', {
        to: 'Sessions#resetShow',
        as: 'reset'
      })
      .post('/resetPassword', {
        to: 'Sessions#resetCreate',
        as: 'reset'
      })
      .put('/resetPassword', {
        to: 'Sessions#resetUpdate',
        as: 'reset'
      })

      .resources([
        '/Users',
        '/Installations'
      ])
  });
