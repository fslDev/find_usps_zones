const express = require("express");

const app = express();
const axios = require("axios");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const dateString = "10/12/2021";
const csvWriter3digit = createCsvWriter({
  path: "three_digit_zones.csv",
  header: [
    { id: "origin", title: "Origin" },
    { id: "destination", title: "Destination" },
    { id: "zone", title: "Zone" },
  ],
});

const csvWriter5digit = createCsvWriter({
  path: "five_digit_exceptions.csv",
  header: [
    { id: "origin", title: "Origin" },
    { id: "destination", title: "Destination" },
    { id: "zone", title: "Zone" },
  ],
});

const zeroPad = function (num, size, flag = true) {
  let s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
};

const threeDigitZones = [];

app.listen(3000, async () => {
  console.log("Server running on port 3000");
  for (var code = 0; code <= 999; code++) {
    console.log("-------index------", code);
    const response = await axios.get(
      "https://postcalc.usps.com/DomesticZoneChart/GetZoneChart?zipCode3Digit=" +
        zeroPad(code, 3, false) +
        `&shippingDate=${dateString}`
    );
    const data = response.data;
    if (data.PageError) {
      console.log(data.PageError);
      continue;
    }
    for (var c = 0; c < 4; c++)
      for (var i = 0; i < data["Column" + c].length; i++) {
        var Zipcodes = data["Column" + c][i]["ZipCodes"].split("---");
        var Zone = data["Column" + c][i]["Zone"];
        if (Zipcodes.length > 1) {
          for (var k = parseInt(Zipcodes[0]); k <= parseInt(Zipcodes[1]); k++) {
            threeDigitZones.push({
              origin: zeroPad(code, 3),
              destination: zeroPad(k, 3),
              zone: Zone.replace(/[^0-9\.]/g, ""),
            });
          }
        } else {
          threeDigitZones.push({
            origin: zeroPad(code, 3),
            destination: zeroPad(Zipcodes[0], 3),
            zone: Zone.replace(/[^0-9\.]/g, ""),
          });
        }
      }
  }

  csvWriter3digit
    .writeRecords(threeDigitZones)
    .then(() =>
      console.log("Three Digit Zones CSV file was written successfully")
    );
});
