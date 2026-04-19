/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "@request.auth.email = 'oskz.gameartist@gmail.com'",
    "deleteRule": null,
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "number2099620747",
        "max": null,
        "min": null,
        "name": "session_end",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      }
    ],
    "id": "pbc_2925081073",
    "indexes": [],
    "listRule": "@request.auth.id != ''",
    "name": "alpha_session",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.email = 'oskz.gameartist@gmail.com'",
    "viewRule": "@request.auth.id != ''"
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2925081073");

  return app.delete(collection);
})
