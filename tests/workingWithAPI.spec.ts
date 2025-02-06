import { test, expect } from '@playwright/test';
import tags from '../test-data/tags.json'; // import json file just put a name, NO {}

test.beforeEach(async ({page}) => {
  //Mock API - PW intercepts a pattern of API URL -provide our own response
  await page.route('*/**/api/tags', async route => { // provide a wildcard to replace base URL (https://conduit-api.bondaracademy.com)
    await route.fulfill({
      body: JSON.stringify(tags)
    })
  })

  // intercept article API endpoint
  await page.route('*/**/api/articles*', async route => {
    const response = await route.fetch() // to complete the API call and get the response
    //modify the response
    const reponseBody = await response.json() // return an array of article in the response
    reponseBody.articles[0].title = "This is a test title" // modify the first article title
    reponseBody.articles[0].description = "This is a test description" // modify the first article description

    await route.fulfill({
      body: JSON.stringify(reponseBody)
    })
  })

  await page.goto('https://conduit.bondaracademy.com/');
})

test('has text', async ({ page }) => {
  await expect(page.locator('.navbar-brand')).toHaveText("conduit");
  // await page.waitForTimeout(500)
  await expect(page.locator('.tag-list')).toContainText("automation")

  await expect(page.locator('app-article-list h1').first()).toContainText('This is a test title')
  await expect(page.locator('app-article-list p').first()).toContainText('This is a test description')
  
});


