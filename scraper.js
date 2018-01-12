const fs = require('fs');


function checkForFolder(folder) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder)
  }
}

checkForFolder('./data/');
