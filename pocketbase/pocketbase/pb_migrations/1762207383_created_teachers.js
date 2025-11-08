/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "3l8csnt67sq3vha",
    "created": "2025-11-03 22:03:03.298Z",
    "updated": "2025-11-03 22:03:03.298Z",
    "name": "teachers",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "ejzemiyr",
        "name": "user",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "gkmaf7pl648i7go",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "kvujitiz",
        "name": "employee_id",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "oydtiaeo",
        "name": "bio",
        "type": "editor",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "convertUrls": false
        }
      },
      {
        "system": false,
        "id": "1xsowsop",
        "name": "qualifications",
        "type": "file",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "mimeTypes": [],
          "thumbs": [],
          "maxSelect": 10,
          "maxSize": 5242880,
          "protected": false
        }
      },
      {
        "system": false,
        "id": "czfljd1p",
        "name": "subjects",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 2000000
        }
      },
      {
        "system": false,
        "id": "wrqt2ngv",
        "name": "contact_info",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 2000000
        }
      },
      {
        "system": false,
        "id": "vxde2nnt",
        "name": "hire_date",
        "type": "date",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      },
      {
        "system": false,
        "id": "fhvezo3z",
        "name": "profile_public",
        "type": "bool",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {}
      }
    ],
    "indexes": [
      "CREATE UNIQUE INDEX `idx_Rnc4Qlw` ON `teachers` (`employee_id`)"
    ],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("3l8csnt67sq3vha");

  return dao.deleteCollection(collection);
})
