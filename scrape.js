const puppeteer = require('puppeteer');
const converter = require('json-2-csv');
const script = require('./questions');
const script3 = require('./answers');
const { writeFileSync } = require("fs");

const URL = 'https://www.quora.com/search?q=sellenium';

const waitFor = (ms) => new Promise(r => setTimeout(r, ms));

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

(async () => {
  // fetch questions
  console.log("Scraper started. \n Scraping questions...");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  //page.on('console', msg => console.log(msg.text()));
  await page.goto(URL);
  const questions = await page.evaluate(script);
  await browser.close();
  
  // apply answers to questions
  module.exports = asyncForEach(questions, async (num, index) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await waitFor(50);
    //page.on('console', msg => console.log(msg.text()));
    await page.goto(questions[index].url);
    // await page.click('.ui_qtext_more_link');
    //let answers = await page.evaluate(script3);
    
    
    //let answers = await page.evaluate((script3) => { document.querySelector('.ui_qtext_more_link')[1].click(); });

    // let answers = await page.evaluate((script3) => {
    //   for(let el of [...document.querySelectorAll('.ui_qtext_more_link')]){
    //     el.click()
    //   }
    // })

    

    let answers = await page.evaluate((script3));
    questions[index].answers = answers;
    console.log("Applied answers to " + questions[index].title);
    await browser.close();
  }).then(function (error) {
    console.log(questions);
    writeFileSync('results.json', JSON.stringify(questions));
    converter.json2csv(questions, json2csvCallback)
  });

  
})();

let json2csvCallback = function (err, csv) {
  if (err) throw err;
  writeFileSync('output2.csv', csv);
};
 