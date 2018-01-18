const fs = require('fs');
const scrapeIt = require('scrape-it');
const json2csv = require('json2csv');
var shirtData = [];

function checkForFolder(folder) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder)
  }
}

checkForFolder('./data/');

/* First scrape to get shirt page URLS. Uses the scrape-it package to gather
 * the urls for each individual shirt page. Logs those urls into an array then
 * uses a for loop to call the scrapeForShirtDetails function on each url.
 */
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

/* Second scrape to get info for individual shirts. Takes a url as parameter
 * to scrape that page gathering details about the shirt including: title,
 * price, image url, page url, and logs the time. Pushes all data as an object
 * to an array called shirtData
 */
function scrapeForShirtDetails(url) {
  scrapeIt(url, {
    title: "title",
    price: "div.shirt-details h1 span.price",
    imageurl: {
      selector: "div.shirt-picture span img",
      attr: "src"
    }
  }, (err, page) => {
      const shirtObject = {};
      shirtObject.title = page.title;
      shirtObject.price = page.price;
      shirtObject.imageurl = `http://www.shirts4mike.com/${page.imageUrl}`;
      shirtObject.url = url;
      shirtObject.time = new Date().toJSON();
      shirtData.push(shirtObject);
  });
}


//create a CSV file
function createCSVFile(data) {
  var today = new Date();
  var month = today.getMonth() + 1;
  var day = today.getDate();
  var year = today.getFullYear();
  var fileName = './data/' + year + '-' + month + '-' + day + '.csv';

  const fields = ['title', 'price', 'imageurl', 'url', 'time'];
  const csv = json2csv({data: data, fields: fields});
  fs.writeFile(fileName, csv);
};


scrapeForShirtUrls();

setTimeout(function() {
  console.log(shirtData);
  createCSVFile(shirtData);
}, 10000);
