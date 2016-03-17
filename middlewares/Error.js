module.exports = function(err, req, res, next) {
  logger.error(err.stack);

  if (err.name && err.name === 'NotFoundError') {
    return res.status(404).render('shared/404.html', {message : err.message, layout : false});
  }

  res.status(500);
  res.format({
    html : function() {
      res.render('shared/500.html', {layout : false, error : err.stack})
    },
    json : function() {
      res.json(err)
    }
  })

}
