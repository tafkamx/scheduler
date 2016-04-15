module.exports = function(req, res) {
  if (req.knex) {
    req.knex.destroy(function () {});
  }

  res.status(404);
  res.render('shared/404.html', {layout : false})
};
