import { test as setup } from '@playwright/test';
import user from '../.auth/user.json';
import fs from 'fs'; //fs is a built in JS to work with the files (write, update...)

const authFile = '.auth/user.json'
setup('authentication', async({page, request}) => { // need configure in playwright.config.ts
  //Authen using UI
//   await page.goto('https://conduit.bondaracademy.com/');
//   await page.getByText('Sign in').click()
//   await page.getByRole('textbox', {name: "Email"}).fill("hang@test.com")
//   await page.getByRole('textbox', {name:"Password"}).fill("123")
//   await page.getByRole('button').click()
//   await page.waitForResponse('https://conduit-api.bondaracademy.com/api/tags')

//   await page.context().storageState({path: authFile})

    //authen using API
    const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
        data: {
          "user":{"email":"hang@test.com","password":"123"}
          }
      })
    const responseBody = await response.json()
    const accessToken = responseBody.user.token   //user object in the response 
    
    // Saving token to user.json
    // update user object (imported above) with the new token value
    user.origins[0].localStorage[0].value = accessToken 
    fs.writeFileSync(authFile, JSON.stringify(user)) //write the updated user to the user.json file

    //save the value of accessToken to process environment variable to reuse in API calls in tests - need configure in playwright.config.ts
    process.env['ACCESS_TOKEN'] = accessToken


})