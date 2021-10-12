var express = require("express");

var app = express();
const axios = require('axios');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter3digit = createCsvWriter({
  path: 'canada_zones.csv',
  header: [
    {id: 'origin', title: 'Origin'},
    {id: 'destination', title: 'Destination'},
    {id: 'zone', title: 'Zone'}
  ]
});

const csvWriter5digit = createCsvWriter({
    path: 'five_digit_exceptions.csv',
    header: [
      {id: 'origin', title: 'Origin'},
      {id: 'destination', title: 'Destination'},
      {id: 'zone', title: 'Zone'}
    ]
  });

const zeroPad = function(num, size, flag = true) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

var threeDigitZones = [];

app.listen(3000, async () => {
    console.log("Server running on port 3000");
    for(var code = 0; code <= 999; code++) {   
        console.log('-------index------', code);        
        const response = await axios.get('https://postcalc.usps.com/InternationalZoneChart/GetZoneChart?zipCode3Digit=' + zeroPad(code, 3, false) + '&shippingDate=01/21/2021')
        var data = response.data;
        if (data.PageError) { console.log(data.PageError); continue; }

        var cells = data['Countries'][0]['Services'][0]['Cells'];        
        for(var i = 0; i < cells.length; i++) {
            var Zipcodes = cells[i]['ZipCodes'];
            var Zone = cells[i]['Zone'];
            threeDigitZones.push({
                origin: zeroPad(code, 3),
                destination: Zipcodes,
                zone: Zone.replace(/[^0-9\.]/g, '')
            })            
        }
    }
    csvWriter3digit
                .writeRecords(threeDigitZones)
                .then(()=> console.log('Three Digit Zones CSV file was written successfully'));

});