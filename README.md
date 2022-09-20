# Back-End Web Service Assignment for Senior Software Developer

##### Author - Xavier Remacle

## Description

Language: Node.js
Framework: Express
Storage: In-Memory

Simple Booking Application

Considerations:

- No leap year.
- names, email, and identifiers are hashed and stored properly

> POST /api/v1/reservations  
> GET /api/v1/reservations
> GET /api/v1/reservations/all
> DELETE /api/v1/reservations

## Installation

Use [npm] to install

> `npm i`

## Commands

> How to run: `npm run start`
>
> - runs on localhost, port 3000
> - 127.0.0.1:3000

> Coverage testing: `npm run coverage`  
>  Unit testing: `npm run test`

## Usage

## Create reservation

### POST - /api/v1/reservation

> ```
> body
> {
>   "firstName": "Xavier",
>   "lastName": "Remacle",
>   "guestNumber": 5,
>   "email": "test@test.com",
>   "checkIn": "01-01-2020",
>   "checkOut": "01-31-2021"
> }
> ```

## Delete reservation

### DELETE - /api/v1/reservation/:bookingId

> no body

## GET reservation

### GET - /api/v1/reservation/:bookingId

> no body

## Postman

> attached is the postman collection you can use to test this api
