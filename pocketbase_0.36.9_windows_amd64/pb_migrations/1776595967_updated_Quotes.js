/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2433413309")

  // add field
  collection.fields.addAt(31, new Field({
    "hidden": false,
    "id": "number643087560",
    "max": null,
    "min": null,
    "name": "client_budget",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(32, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text452875155",
    "max": 0,
    "min": 0,
    "name": "payment_schedule",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(33, new Field({
    "hidden": false,
    "id": "number3278057665",
    "max": null,
    "min": null,
    "name": "tax_rate",
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
  collection.fields.removeById("number643087560")

  // remove field
  collection.fields.removeById("text452875155")

  // remove field
  collection.fields.removeById("number3278057665")

  return app.save(collection)
})
