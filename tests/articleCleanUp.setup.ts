import { test as setup, expect } from '@playwright/test';

setup('delete article', async({request}) => {
    const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${process.env['SLUGID']}`)
    // get process.env['SLUGID'] from newArticle.setup.ts
    
    expect(deleteArticleResponse.status()).toEqual(204)


})