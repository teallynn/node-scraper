const fs = require('fs');
const scrapeIt = require('scrape-it');
const json2csv = require('json2csv');


function checkForFolder(folder) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder)
  }
}

checkForFolder('./data/');

scrapeIt("http://shirts4mike.com/shirts.php", {
    // Fetch the shirt pages
    shirts: {
        listItem: "ul.products li",
        name: "shirts",
        data: {
            title: {
              selector: "img",
              attr: "alt"
            },
            url: {
                selector: "a",
                attr: "href"
            }
        }
    }

}, (err, page) => {

    const shirtUrls = [];


    if (page) {
      const shirtPages = page.shirts;

      for (var i = 0; i < shirtPages.length; i += 1) {
        var shirt = shirtPages[i];
        var url = `http://www.shirts4mike.com/${shirt.url}`;
        var id = shirt.url.slice(-3);
        shirtUrls.push(url, id);
      }

      console.log(shirtUrls);

      //create a CSV file
      function createCSVFile(data) {
        var today = new Date(Date.now());
        var month = today.getMonth() + 1;
        var day = today.getDate();
        var year = today.getFullYear();
        var fileName = './data/' + year + '-' + month + '-' + day + '.csv';


        fs.writeFile(fileName, csv, data)
      };

      createCSVFile('and again');

    }
});
