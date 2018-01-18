const fs = require('fs');
const scrapeIt = require('scrape-it');
const json2csv = require('json2csv');
const shirtData = [];

/* Second scrape to get info for individual shirts*/
function scrapeForShirtDetails(url) {
  scrapeIt(url, {
    title: "title",
    price: "div.shirt-details h1 span.price",
    imageUrl: {
      selector: "div.shirt-picture span img",
      attr: "src"
    }
  }, (err, page) => {
      const shirtObject = {};
      shirtObject.title = page.title;
      shirtObject.price = page.price;
      shirtObject.imageUrl = `http://www.shirts4mike.com/${page.imageUrl}`;
      shirtObject.url = url;
      shirtObject.time = new Date().toJSON();
      shirtData.push(shirtObject);
  });
}


/* First Scrape to get shirt page URLS*/
function scrapeForShirtUrls() {
  scrapeIt("http://shirts4mike.com/shirts.php", {
        // Fetch the shirt page urls
        shirts: {
            listItem: "ul.products li",
            name: "shirts",
            data: {
                url: { selector: "a", attr: "href" }
            }
        }
      }, (err, page) => {
        const shirtUrls = [];
        if (page) {
          const shirtPages = page.shirts;
          for (var i = 0; i < shirtPages.length; i += 1) {
            var shirt = shirtPages[i];
            var url = `http://www.shirts4mike.com/${shirt.url}`;
            shirtUrls.push(url);
          };

          for (var i = 0; i < shirtUrls.length; i += 1) {
            scrapeForShirtDetails(shirtUrls[i]);
          };
        };
      });

}

//create a CSV file
function createCSVFile(data) {
  var today = new Date();
  var month = today.getMonth() + 1;
  var day = today.getDate();
  var year = today.getFullYear();
  var fileName = './data/' + year + '-' + month + '-' + day + '.csv';

  const fields = ['title', 'price', 'imageURL', 'URL', 'time'];
  const csv = json2csv({data: data, fields: fields});
  fs.writeFile(fileName, csv)
};

var myCars = [
  {
    "title": "Audi",
    "price": 40000,
    "imageURL": "blue",
    "URL": "a",
    "time": 2
  }, {
    "title": "BMW",
    "price": 35000,
    "imageURL": "black",
    "URL": "b",
    "time": 2
  }, {
    "title": "Porsche",
    "price": 60000,
    "imageURL": "green",
    "URL": "c",
    "time": 2
  }
];

createCSVFile(myCars);
