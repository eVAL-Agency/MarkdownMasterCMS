---
title: Database Layer
seotitle: Using the database layer in MarkdownMaster CMS
tags: [Development, Backend, Models]
---

MarkdownMaster CMS provides a core database facility based on SQLite with Write-Ahead Logging (WAL) enabled.
The database is only created when needed and is accessible via the `Model` class.

## Database Path

The path to the database file is determined by:
1. The `database.path` setting in config.php
2. If not set, falls back to the default `data/cms.sqlite` relative to the site root

## API Reference

### Autoloading and Registration

All Models must be registered in the `Model::RegisterModel()` method,
this is typically done in the `autoload.php` file.

```php
// autoload.php
Model::RegisterModel('Popularity\Models\PopularityViewsModel');
```

Registering a model only registers the class in the Model handler,
it **does not** instantiate or auto-install the database.

### Model::Db()

Returns a shared PDO connection to the database for the current request.
The same PDO instance is returned on subsequent calls in the same request.
Returns null if the database path cannot be created or accessed.

```php
// SomeModule/Models/MyModel.php
class MyModel extends Model {
    ...
    
    public static function GetSomething(): array {
        $db = self::Db();
        if ($db === null) return [];
        
        $stmt = $db->prepare("SELECT some_key1, some_key2
		    FROM my_model
		    WHERE some_param = :some_key;
		");
		$stmt->execute(['some_key' => 'some value']);
		return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
```

### Property Mapping

Each column in the mapped table must be defined as a public property in the model class.
The types must match, including type, is nullable, and default value.

Each Model should **only** have properties which refer to the database table.

Each Model should only relate to one specific table and only perform operations against that table.

### Get All Records

The `Model::GetAll()` method returns an array of all records in the table.

Each row in the array is an instance of the associated model.

### Get Single Record

@todo / unsupported

### Find Records

@todo / unsupported

### Saving Records

The Model system supports `upsert` and `insert` operations.

`MyModel->upsert()` will perform an INSERT OR REPLACE to ensure the record exists.
For upserts, all keys, including primary keys, are expected to be set.

`MyModel->insert()` will perform an INSERT to insert a new record.
For inserts, the primary key may be omitted, notably for auto-incrementing keys.

### Schema Upgrades

Models can upgrade their database schema by adding columns conditionally in `SyncTable()`.

The `Model::HasColumn($column)` method checks if a column exists in the table's schema.
Use this to add new columns only when they don't already exist:

```php
public static function SyncTable(): void {
    $db = self::Db();

    // Create table if it doesn't exist
    $db->exec("
        CREATE TABLE IF NOT EXISTS my_table (
            id INTEGER PRIMARY KEY,
            email TEXT,
            name TEXT
        );
    ");

    // Add new column only if it doesn't exist (schema upgrade)
    if (!self::HasColumn('email')) {
        $db->exec("ALTER TABLE my_table ADD COLUMN email TEXT;");
    }
}
```

This pattern ensures that:
1. New installations get the full schema including all columns
2. Existing installations are upgraded when new code is deployed
3. No errors occur if a column already exists

### Removing Records

`MyModel->delete()` will perform a DELETE operation based on the primary key(s)
associated with the Model.

## Model Logic

Each Model is responsible for its own database logic and ONLY database logic.

All raw SQL queries must be performed within the associated Model
and no business logic should be performed in the Model.

Raw SQL queries should **only** be defined within Models.

Any business logic should be performed within the Controller or Service layer.
See the [Services Layer documentation](services.md) for more information about service classes.

### Exception Handling

All database exceptions should be handled internally within the Model
and gracefully return the necessary response back to the calling application.

This is because databases are **optional** in MarkdownMaster CMS and
corresponding functionality should gracefully degrade when not available.
