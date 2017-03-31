"use strict";
function index(req, res) {
    res.render('index');
}
exports.index = index;
;
function partials(req, res) {
    var name = req.params.name;
    res.render('partials/' + name);
}
exports.partials = partials;
;
//# sourceMappingURL=index.js.map