/**************************************
 * Requirements and initial variables.
 **************************************
 */
const fs = require('fs');
const scrapeIt = require('scrape-it');
const json2csv = require('json2csv');
var shirtData = [];
var dataReady = false;

/******************************************************************************
 * Look for a specific folder in the current folder, if it does not exist,
 * create it. If it already exists, do nothing.
 ******************************************************************************
 */
function checkForFolder(folder) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder)
  }
}

checkForFolder('./data/');

/******************************************************************************
 * First scrape to get shirt page URLS. Uses the scrape-it package to gather
 * the urls for each individual shirt page. Logs those urls into an array then
 * uses a for loop to call the scrapeForShirtDetails function on each url.
 ******************************************************************************
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
        }
        if (err) {
          var error = 'There’s been an error. Cannot connect to the to the site';
          error += err;
          console.log(error);
          var time = new Date();
          var logError = '[' + time + ']' + error + '\n';
          fs.appendFile('scraper-error.log', logError);
          process.exit(1);
        }
      });
}

/******************************************************************************
 * Second scrape to get info for individual shirts. Takes a url as parameter
 * to scrape that page gathering details about the shirt including: title,
 * price, image url, page url, and logs the time. Pushes all data as an object
 * to an array called shirtData. Up dates the dataReady variable to true when
 * all of the data has been retrieved.
 ******************************************************************************
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
      shirtObject.imageurl = `http://www.shirts4mike.com/${page.imageurl}`;
      shirtObject.url = url;
      shirtObject.time = new Date().toJSON();
      shirtData.push(shirtObject);
      if (shirtData.length == 8){
        dataReady = true;
      }
  });
}


/******************************************************************************
 * Creates a new csv file named with the current date. Uses the jsontocsv npm
 * package to convert data given in the parameter to csv format and writes it
 * to the new file. If a file already exists it will overwrite it with new data.
 ******************************************************************************
 */
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


/******************************************************************************
 * Here we need to check the dataReady variable set by the scrapeForShirtDetails
 * function, when it is true that means that data has been retrieved for all 8
 * shirts and we can run the createCSVFile function.
 ******************************************************************************
 */
var intervalCheck = setInterval(function() {
  if (dataReady){
    createCSVFile(shirtData);
    clearInterval(intervalCheck);
  }
}, 1000);
