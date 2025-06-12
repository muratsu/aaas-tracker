import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import dotenv from 'dotenv';
dotenv.config();

const GITHUB_USERNAME = process.env.GH_USERNAME;
const GITHUB_PASSWORD = process.env.GH_PASSWORD;

if (!GITHUB_USERNAME || !GITHUB_PASSWORD) {
  throw new Error('GITHUB_USERNAME and GITHUB_PASSWORD environment variables are required');
}

interface Service {
  name: string;
  searchQuery: string;
  dataFile: string;
}

const services: Service[] = [
  {
    name: 'fal',
    searchQuery: 'FAL_KEY+AND+path:.env+AND+NOT+(org:fal-ai+OR+org:fal-ai-community)',
    dataFile: 'data/fal-code-search.json'
  },
  {
    name: 'replicate',
    searchQuery: 'REPLICATE_API_TOKEN+AND+path:.env+AND+NOT+(org:replicate)',
    dataFile: 'data/replicate-code-search.json'
  },
  {
    name: "huggingface",
    searchQuery: "HF_TOKEN+AND+path:.env+AND+NOT+(org:huggingface)",
    dataFile: "data/huggingface-code-search.json"
  }
];

async function saveResult(service: Service, count: number) {
  const row = {
    date: new Date().toISOString().slice(0, 10),
    count
  };

  const prev = JSON.parse(await fs.readFile(service.dataFile, "utf8").catch(() => "[]"));
  await fs.writeFile(service.dataFile, JSON.stringify([...prev, row], null, 2));
}

async function parseResultCount(resultText: string | null): Promise<number> {
  if (!resultText || resultText.trim() === '') {
    return 0;
  }

  const multiplier = resultText.match(/(\d+(?:\.\d+)?)([kKmM])/);
  if (!multiplier) {
    return parseInt(resultText);
  }

  const [, number, unit] = multiplier;
  const value = parseFloat(number);
  return unit.toLowerCase() === 'k' ? value * 1000 : value * 1000000;
}

async function scrapeGitHubSearch(service: Service) {
  const browser = await chromium.launch({
    headless: false
  });

  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 },
    });

    const page = await context.newPage();

    // Navigate to GitHub login
    await page.goto('https://github.com/login');
    
    // Fill in login form
    await page.fill('#login_field', GITHUB_USERNAME);
    await page.fill('#password', GITHUB_PASSWORD);
    
    // Click login button and wait for navigation
    await Promise.all([
      page.waitForNavigation(),
      page.click('[name="commit"]')
    ]);

    // Navigate to search page
    await page.goto(`https://github.com/search?q=${service.searchQuery}&type=code`);

    // Wait for the results to load
    await page.waitForSelector('[data-testid="resolved-count-label"]');

    // Get the search results count
    const resultText = await page.$eval('[data-testid="resolved-count-label"]', el => el.textContent);
    const count = await parseResultCount(resultText);
    await saveResult(service, count);

  } catch (error) {
    console.error(`Error during scraping for ${service.name}:`, error);
  } finally {
    await browser.close();
  }
}

// Run the script for all services
async function runAllServices() {
  for (const service of services) {
    console.log(`Scraping data for ${service.name}...`);
    await scrapeGitHubSearch(service);
  }
}

// Run the script
runAllServices().catch(console.error); 