Xav's NC Knews.

This is an API I built to (eventually) use during the Front End block of the course. It serves data from a PSQL database, the user interacts with endpoints which connect to controllers built on knex.

1. A good place to start is by checking the main page of the API (https://xavs-nc-knews.herokuapp.com/api/), this lists all endpoints and methods for each endpoint.

The comments are not a sub-set of the articles endpoint when you're using delete and patch methods. This is because I missed a change that was made to the original readme for this project when I was setting it up. I'll make that change on Xav's NC Knews 2.0.

2. You'll need to install everything listed in the package.json dependencies (you can do this in one step by running 'npm i' in your terminal).

As a user, you just need to fire one of the methods listed on the main page to check it's working (postman is a good application to use for this).

3. To see my test-suite, run 'npm t'. The tests check that each endpoint/method does what it says it does, and that you get the right error messages when you make an error.

Built With: PSQL, knex, JS.
