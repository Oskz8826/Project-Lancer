/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2433413309")

  // add field
  collection.fields.addAt(4, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1975447103",
    "max": 0,
    "min": 0,
    "name": "discipline",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1757057761",
    "max": 0,
    "min": 0,
    "name": "asset_type",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1358988637",
    "max": 0,
    "min": 0,
    "name": "complexity_tier",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text4189630469",
    "max": 0,
    "min": 0,
    "name": "experience_level",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text258142582",
    "max": 0,
    "min": 0,
    "name": "region",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(9, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1400097126",
    "max": 0,
    "min": 0,
    "name": "country",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "number3521989564",
    "max": null,
    "min": null,
    "name": "hourly_rate",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(11, new Field({
    "hidden": false,
    "id": "number2212861802",
    "max": null,
    "min": null,
    "name": "hours_min",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(12, new Field({
    "hidden": false,
    "id": "number3219695667",
    "max": null,
    "min": null,
    "name": "hours_max",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(13, new Field({
    "hidden": false,
    "id": "number2352248387",
    "max": null,
    "min": null,
    "name": "revision_rounds",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(14, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1828310",
    "max": 0,
    "min": 0,
    "name": "revision_type",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(15, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1542439035",
    "max": 0,
    "min": 0,
    "name": "usage_rights",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(16, new Field({
    "hidden": false,
    "id": "bool2248463349",
    "name": "rush_job",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(17, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text18589324",
    "max": 0,
    "min": 0,
    "name": "notes",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(18, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3168177328",
    "max": 0,
    "min": 0,
    "name": "client_brief",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(19, new Field({
    "hidden": false,
    "id": "number2494172188",
    "max": null,
    "min": null,
    "name": "quote_min",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(20, new Field({
    "hidden": false,
    "id": "number2829529925",
    "max": null,
    "min": null,
    "name": "quote_max",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(21, new Field({
    "hidden": false,
    "id": "number1954538754",
    "max": null,
    "min": null,
    "name": "quote_mid",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(22, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text525646093",
    "max": 0,
    "min": 0,
    "name": "working_currency",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(23, new Field({
    "hidden": false,
    "id": "bool3669404820",
    "name": "ai_assisted",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2433413309")

  // remove field
  collection.fields.removeById("text1975447103")

  // remove field
  collection.fields.removeById("text1757057761")

  // remove field
  collection.fields.removeById("text1358988637")

  // remove field
  collection.fields.removeById("text4189630469")

  // remove field
  collection.fields.removeById("text258142582")

  // remove field
  collection.fields.removeById("text1400097126")

  // remove field
  collection.fields.removeById("number3521989564")

  // remove field
  collection.fields.removeById("number2212861802")

  // remove field
  collection.fields.removeById("number3219695667")

  // remove field
  collection.fields.removeById("number2352248387")

  // remove field
  collection.fields.removeById("text1828310")

  // remove field
  collection.fields.removeById("text1542439035")

  // remove field
  collection.fields.removeById("bool2248463349")

  // remove field
  collection.fields.removeById("text18589324")

  // remove field
  collection.fields.removeById("text3168177328")

  // remove field
  collection.fields.removeById("number2494172188")

  // remove field
  collection.fields.removeById("number2829529925")

  // remove field
  collection.fields.removeById("number1954538754")

  // remove field
  collection.fields.removeById("text525646093")

  // remove field
  collection.fields.removeById("bool3669404820")

  return app.save(collection)
})
