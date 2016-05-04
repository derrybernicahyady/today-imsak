var fs = require('fs');
var http = require('http');
var path = require('path');
var url = require('url');
var axios = require('axios');
var cheerio = require('cheerio');
var inquirer = require('inquirer');
var Table = require('cli-table');

var baseUrl = 'https://sholat.gq/adzan/default.php'
var dailyUrl = 'https://sholat.gq/adzan/daily.php'
var cities = []
var citiesModel = []
var headers = []
var bodies = []
var currentCity = null;

console.log('Assalamualaikum, please wait for a few seconds. We currently collecting cities...');

axios.get(baseUrl).then(function(response) {
    var $ = cheerio.load(response.data)
    $('option').each(function (i, elm) {
        var city = $(elm).first().text()
        cities.push(city)
        citiesModel.push({
            name: $(elm).first().text(),
            id: $(elm).first().attr('value')
        })
    })

    return cities
}).then(function(cities) {
    return inquirer.prompt([{
        type      : 'list',
        name      : 'city',
        message   : 'Please choose your city',
        choices   : cities
    }])
}).then(function (answers) {
    currentCity = cities[cities.indexOf(answers.city)];

    var cityId = citiesModel.find(function(item) {
        return item.name === currentCity;
    })['id']

    return axios.get(dailyUrl + '?id=' + cityId)
}).then(function(response) {
    var $ = cheerio.load(response.data)

    $('.table_header > td').each(function(i, elm) {
        headers.push($(elm).first().children().text())
    })

    $('.table_light > td').each(function(i, elm) {
        bodies.push($(elm).first().text())
    })

    var table = new Table({
        head: headers
    });
    table.push(bodies);
    console.log('\nJadwal imsakiyah untuk kota ' + currentCity + ', ' + bodies[0] + ' ' + $('.h2_edit').text());
    console.log(table.toString());
})
