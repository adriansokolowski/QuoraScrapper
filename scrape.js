const puppeteer = require('puppeteer')
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
  console.log("Scraper started...\n Scraping questions...");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  //page.on('console', msg => console.log(msg.text()));
  await page.goto(URL);
  const questions = await page.evaluate(script);
  await browser.close();
  
  // apply answers to questions
  asyncForEach(questions, async (num, index) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await waitFor(50);
    //page.on('console', msg => console.log(msg.text()));
    await page.goto(questions[index].url);
    let answers = await page.evaluate(script3);
    questions[index].answers = answers;
    console.log("Applied answers to " + questions[index].title);
    await browser.close();
  }).then(function (error) {
    console.log(questions);
    writeFileSync('results.json', JSON.stringify(questions));
  });

  
})();

 