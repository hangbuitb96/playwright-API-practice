import {request, expect} from "@playwright/test"
import user from '../playwright_API_app/.auth/user.json'
import fs from 'fs'


async function globalSetup(){
    const authFile = '.auth/user.json'

    // create new context
    const context = await request.newContext()
    
    // get the token
    const responseToken = await context.post('https://conduit-api.bondaracademy.com/api/users/login', {
        data: {
          "user":{"email":"hang@test.com","password":"123"}
          }
      })
    const responseBody = await responseToken.json()
    const accessToken = responseBody.user.token   //user object in the response 
    
    user.origins[0].localStorage[0].value = accessToken 
    fs.writeFileSync(authFile, JSON.stringify(user)) //write the updated user to the user.json file

    process.env['ACCESS_TOKEN'] = accessToken
    
    
    const articleResponse = await context.post('https://conduit-api.bondaracademy.com/api/articles/', {
        data: {
            "article":{"title":"Global Like Test article","description":"Test description","body":"Test body","tagList":[]}
        },
        // need to provide an authorization header for this API call
        headers: {
            Authorization: `Token ${process.env.ACCESS_TOKEN}`
        }
    })
    expect(articleResponse.status()).toEqual(201)
    const response = await articleResponse.json()
    const slugId = response.article.slug
    process.env['SLUGID'] = slugId
}
//Export this function to be visible globally
export default globalSetup;