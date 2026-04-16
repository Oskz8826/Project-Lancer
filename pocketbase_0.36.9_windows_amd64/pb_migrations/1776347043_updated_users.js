/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // add field
  collection.fields.addAt(7, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1579384326",
    "max": 0,
    "min": 0,
    "name": "name",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "select1466534506",
    "maxSelect": 1,
    "name": "role",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "freelancer",
      "studio"
    ]
  }))

  // add field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "select1259995737",
    "maxSelect": 1,
    "name": "primary_discipline",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "3d_hard_surface",
      "3d_character",
      "2d_concept_art",
      "environment_art",
      "vfx_technical",
      "ui_ux",
      "2d_animation",
      "3d_animation",
      "game_design",
      "development",
      "sound_design"
    ]
  }))

  // add field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "json2224284721",
    "maxSize": 0,
    "name": "additional_skills",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(11, new Field({
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
  collection.fields.addAt(12, new Field({
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
  collection.fields.addAt(13, new Field({
    "hidden": false,
    "id": "select525646093",
    "maxSelect": 1,
    "name": "working_currency",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "EUR",
      "GBP",
      "USD"
    ]
  }))

  // add field
  collection.fields.addAt(14, new Field({
    "hidden": false,
    "id": "select614373258",
    "maxSelect": 1,
    "name": "tier",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "free",
      "basic",
      "pro",
      "max"
    ]
  }))

  // add field
  collection.fields.addAt(15, new Field({
    "hidden": false,
    "id": "bool2368907834",
    "name": "ai_addon",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // remove field
  collection.fields.removeById("text1579384326")

  // remove field
  collection.fields.removeById("select1466534506")

  // remove field
  collection.fields.removeById("select1259995737")

  // remove field
  collection.fields.removeById("json2224284721")

  // remove field
  collection.fields.removeById("text258142582")

  // remove field
  collection.fields.removeById("text1400097126")

  // remove field
  collection.fields.removeById("select525646093")

  // remove field
  collection.fields.removeById("select614373258")

  // remove field
  collection.fields.removeById("bool2368907834")

  return app.save(collection)
})
