/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2433413309")

  // add field
  collection.fields.addAt(26, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2411707748",
    "max": 0,
    "min": 0,
    "name": "client_name",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(27, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3948230428",
    "max": 0,
    "min": 0,
    "name": "freelancer_name",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(28, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1739765278",
    "max": 0,
    "min": 0,
    "name": "project_name",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2433413309")

  // remove field
  collection.fields.removeById("text2411707748")

  // remove field
  collection.fields.removeById("text3948230428")

  // remove field
  collection.fields.removeById("text1739765278")

  return app.save(collection)
})
