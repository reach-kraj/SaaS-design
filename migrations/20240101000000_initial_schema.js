/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("tenants", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
      table.string("name").notNullable();
      table.timestamps(true, true);
    })
    .createTable("users", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
      table
        .uuid("tenant_id")
        .notNullable()
        .references("id")
        .inTable("tenants")
        .onDelete("CASCADE");
      table.string("name").notNullable();
      table.string("email").notNullable();
      table.string("password_hash").notNullable();
      table.string("role").notNullable().defaultTo("USER"); // ADMIN, USER
      table.timestamps(true, true);

      table.unique(["tenant_id", "email"]); // Email unique per tenant (or globally? prompt says "unique within a tenant")
    })
    .createTable("projects", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
      table
        .uuid("tenant_id")
        .notNullable()
        .references("id")
        .inTable("tenants")
        .onDelete("CASCADE");
      table.string("name").notNullable();
      table.text("description");
      table.timestamps(true, true);
    })
    .createTable("tasks", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
      table
        .uuid("tenant_id")
        .notNullable()
        .references("id")
        .inTable("tenants")
        .onDelete("CASCADE");
      table
        .uuid("project_id")
        .notNullable()
        .references("id")
        .inTable("projects")
        .onDelete("CASCADE");
      table.string("title").notNullable();
      table.string("status").notNullable().defaultTo("TODO");
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("tasks")
    .dropTableIfExists("projects")
    .dropTableIfExists("users")
    .dropTableIfExists("tenants");
};
