/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2433413309")

  // add field
  collection.fields.addAt(24, new Field({
    "hidden": false,
    "id": "select2063623452",
    "maxSelect": 1,
    "name": "status",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "draft",
      "sent",
      "accepted",
      "rejected",
      "completed"
    ]
  }))

  // add field
  collection.fields.addAt(25, new Field({
    "hidden": false,
    "id": "number1509541944",
    "max": null,
    "min": null,
    "name": "draft_step",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2433413309")

  // remove field
  collection.fields.removeById("select2063623452")

  // remove field
  collection.fields.removeById("number1509541944")

  return app.save(collection)
})
