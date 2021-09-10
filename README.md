# Datapower-status

Datapower-status is a combined frontend and backend application.
The application show a table with information

|Name |Version |Standby |Reload |Reboot |MachineType |Domains

# Getting started

## Build and setup for local development

- yarn install
- yarn dev-start

# API

There is just one api with get and post feature
GET /status gets the data and is the same one frontend uses
POST /status is where you post a complete json file with the information

example of post message

```
[
    {
        "dpInstance": <<name>>,
        "State": "active",
        "Version": "IDG.10.0.1.4",
        "MachineType": "5725",
        "Domains": [
            <<list of domains>>
        ],
        "uptime": "29 days 00:54:21",
        "bootuptime2": "29 days 00:54:40"
    }
]
```
