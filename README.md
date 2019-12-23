# FNT command Bulk Type-Changer

Helper script for bulk-changing the device-type of all devices of a certain type.

## Configuration
Change/create .env file with the following variables

WS_BASE_URL=Service-URL, e.g. https://xxx/axis/services/
WS_SESSION_ID=session-id-of-user-who-does-the-change

The user need permissions to perform type changes, and admin-read right, do get valid change-types

#Requirements

* target-device type has to be a change-type of source-device type
* target-device type has be available in all devices/slots where source-device is available, too

## Execution
Look at index.js and change the executeWorkflow(sourceTypeName,targetTypeName) function call. It is possible to call the function multiple times.
The maximum number of devices that can be changed in one run is 500.

## Caveats
If the device is in an arkward planned state, Command is not able to perform the type-change. Move device from planned to real in Command.
