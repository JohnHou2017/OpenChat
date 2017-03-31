import express = require('express');

export function index(req, res) {
    res.render('index');
};

export function partials(req, res) {
    var name = req.params.name;
    res.render('partials/' + name);
};