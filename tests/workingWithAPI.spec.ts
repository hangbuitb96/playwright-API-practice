import { test, expect, request } from '@playwright/test';
import tags from '../test-data/tags.json'; // import json file just put a name, NO {}

test.beforeEach(async ({page}) => {
  //Mock API - PW intercepts a pattern of API URL -provide our own response
  await page.route('*/**/api/tags', async route => { // provide a wildcard to replace base URL (https://conduit-api.bondaracademy.com)
    await route.fulfill({
      body: JSON.stringify(tags)
    })
  })

  await page.goto('https://conduit.bondaracademy.com/');
})

test('has text', async ({ page }) => {
  // intercept article API endpoint
  await page.route('*/**/api/articles*', async route => {
    const response = await route.fetch() // to complete the API call and get the response
    //modify the response
    const reponseBody = await response.json() // return an array of article in the response
    reponseBody.articles[0].title = "This is a MOCK test title" // modify the first article title
    reponseBody.articles[0].description = "This is a MOCK test description" // modify the first article description

    await route.fulfill({
      body: JSON.stringify(reponseBody)
    })
  })

  // refresh the articles
  await page.getByText('Global Feed').click()

  await expect(page.locator('.navbar-brand')).toHaveText("conduit");
  // await page.waitForTimeout(500)
  await expect(page.locator('.tag-list')).toContainText("automation")

  await expect(page.locator('app-article-list h1').first()).toContainText('This is a MOCK test title')
  await expect(page.locator('app-article-list p').first()).toContainText('This is a MOCK test description')
  
});

test('delete article', async ({ page, request }) => {

  //create new article
  const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
    data: {
      "article":{"title":"Test article","description":"Test description","body":"Test body","tagList":[]}
    },
  })
  expect(articleResponse.status()).toEqual(201)

  //delete article
  await page.getByText('Global Feed').click()
  await page.getByText('Test article').click()
  await page.getByRole('button', {name: "Delete Article"}).first().click() 
  await page.getByText('Global Feed').click()
  //assert the article is deleted sucessfully
  await expect(page.locator('app-article-list h1').first()).not.toContainText('Test article')
})

test('create article', async ({page, request}) => {
  await page.getByText('New Article').click()
  await page.getByRole('textbox', {name: "Article Title"}).fill('API Playwright Practice')
  await page.getByRole('textbox', {name: "What's this article about?"}).fill('Playwright automation')
  await page.getByRole('textbox', {name: "Write your article (in markdown)"}).fill('Learn playwroght')
  await page.getByRole('button', {name: " Publish Article "}).click()
  //intercept browser API response:
  const articleResponse = await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles/')
  const articleResponseBody = await articleResponse.json()
  const articleSlugID = articleResponseBody.article.slug

  //assert in article page
  await expect(page.locator('.article-page h1')).toContainText('API Playwright Practice')
  //assert in Home page
  await page.getByText('Home').click()
  await page.getByText('Global Feed').click()
  await expect(page.locator('app-article-list h1').first()).toContainText('API Playwright Practice')

  //delete the article using API call - need access token
  const deleteArticleRespinse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${articleSlugID}`)
  expect(deleteArticleRespinse.status()).toEqual(204)
})

