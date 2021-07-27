# Authentication Server

This is a token based Authentication Server that uses a simple token with an expiration date to validate a user's identity. There are 3 endpoints: Register, Login, and Validate. Register and Login are self-explanatory. Validate is used to check if a token is valid, and is used when a user is executing an operation on the front-end.

## Installation

Use the [Node Package Manager](https://nodejs.org/en/download/) to install this server. Using `npm install` will install all dependencies. 

```bash
npm install
```

## Usage

### /login

Request Body:



```
{"username": "8BallAhmed", "password": "password"}
```

Sample Response:

```
{"status":200,"message":"Token expired. New token generated for existing account.","token":"26gA0P/v1qJuwMMUy06lF77LRTB9PasrQeiRX8o98dd58ULt4LpxVyOgh6WgB6fGkUuE/UgBz0fqfH1PadOtlg==","expiryDate":"2021-07-27T15:19:01.245Z","success":true}
``` 





### /register

Request Body:

```
{"username": "AhmedOsaimi", "password": "password", "email": "ahmed.fcit88@gmail.com"}
```

Sample response:
```
{"status":200,"message":"Registration Successful","success":true}
```

## /validate

In this endpoint, the token is attached as basic authorization: "basic [token]"

Sample response: 

```
{"status":200,"message":"Token still valid!","success":true}
```
