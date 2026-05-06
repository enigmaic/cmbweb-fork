# Introduction

<div style="text-align: center;">
  <img src="https://tr.rbxcdn.com/180DAY-6360a2efe9933207faea6bc4651326ed/150/150/Image/Webp/noFilter" alt="CMBWeb Logo" width="200">
  <h2>Universal Union | JURY Warrant Monitor</h2>
</div>


This is documentation for a web-server (extension of Warrant Monitor) which handles all user records for JURY. CMBWeb is responsible for keeping track of players in game, verifying their records and then acting appropriately, for instance; sending a notification to JURY members that there is a person with an active warrant currently in game.

This web server utilizes a local PostgreSQL cluster as a persistent cache to store references to notifications regarding individuals with active warrants that are currently in game.

Below are all the endpoints, each request gets verified and authentication will fail if the incorrent Bearer token is provided.



# Documentation

#### Base URL
``
https://cmb.enigma-systems.xyz
``

#### Authorization
As mentioned above, the server requires a Bearer token with each request for authentication.

```json
headers: {
    "Authorization": "Bearer <token>",
    "Content-Type": "application/json"
}
```


# Endpoints
Below is a list of all endpoints with the appropriate information.

#### ``[GET] /records/:userid``

The ``<userid>`` parameter must be a valid user id of a roblox account.

This endpoint can be used for retrieving user history, such as warrants or arrests. It returns an ``Object`` which contains two keys:
- "Warrants"
- "Arrests"

both of type ``Array<Object>``.


Example request:

```js
fetch(`${baseURL}/records/1234567890`, 
    {
        method: "GET",
        headers: {
            "Authorization": "Bearer <token>",
            "Content-Type": "application/json" 
        }
    }
)
```

Example response (200OK):

```json
{
    "Warrants": [
        "ABC": {},
        "DEF": {}
    ],
    "Arrests": [
        "ABC": {},
        "DEF": {}
    ]
}
```

#### ``[POST] /update-cache/:type ``

This is the main endpoint that's directly connected to the game. The game sends a request to this endpoint with the respective data whenever a player leaves or joins, then the server interprets and analyzes the provided user for any active warrants or similar flags. The ``usersArray`` key is a supplementary value, the server uses this array to verify the integrity of the current server cache, which is a regular object instance which will be cleared if the server restarts for any given reason. This value allows the server to resynchronize the server cache if it at any point gets desynchronized.

The ``<type>`` parameter must be one of the following:

|type|Explanation|
|-|-|
|joined|performs record checks & adds user to table|
|left|indicates that the player has left the game, drops the user from the table|



<h4>This endpoints excepts three (3) keys with their respective values:</h4>

| Key | Value|
|-|-|
|serverId|a server unique identifier|
|userId|the user id of the person you are updating the status of|
|usersArray|an ``Array<number>`` containing the user id of every single player currently in game|

Example payload:
```json
{
    "serverId": "SERVER123",
    "userId": 1,
    "usersArray": [1, 2, 3, 4, 5]
}
```



#### ``[POST] /update-records/``

This endpoint is used by the Warrant Monitor to replicate any changes made to warrant information to the server. This solution was employed to keep the server synchronized with the Firebase instance without requiring to perform a read operation whenever the Warrant Monitor manipulated the data.

The server excepts the following keys in the payload:

| Key | Value|
|-|-|
|userId|the user id of the person you are updating the information for|
|buffer|an ``Object`` containing the warrant ``id`` and ``data``|

Example payload:

```json
{
    "userId": 123456789,
    "buffer": {
        "id": "ABCD1234",
        "data": {
                "Active": true,
                "Evidence": "",
                "Notes": "notes",
                "IssueTime": "",
                "Prosecutor": "",
                "Type": "Arrest/Warning",
                "MessageId": "",
                "Articles": ["A1", "A2"]
        }
    }
}
```
<br><br>
# Data Structures

This section covers the way that the data is structured and the expected types of any keys. Any payload must be structured in the following ways or the system will fail to interpret them properly.

### Warrant

```ts
{
    "Active": boolean,
    "Evidence": String,
    "Notes": String,
    "IssueTime": String,
    "Prosecutor": String|Number,
    "Type": String,
    "MessageId": String,
    "Articles": Array<String>
}
```
> Note: "Prosecutor" can be either a ``String`` or ``Number``, both are interpreted properly.

### Arrest
```ts
{
    "IssueTime": String,
    "Prosecutor": String|Number,
    "Reason": String,
    "AddCharges": String,
    "Comments": Array<String>
}
```
> Note: field "AddCharges" is an abbreviation of "Additional Charges".