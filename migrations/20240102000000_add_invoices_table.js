/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("invoices", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table
      .uuid("tenant_id")
      .notNullable()
      .references("id")
      .inTable("tenants")
      .onDelete("CASCADE");
    table.decimal("amount", 10, 2).notNullable();
    table.date("due_date").notNullable();
    table.string("status").notNullable().defaultTo("DRAFT"); // DRAFT, SENT, PAID
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("invoices");
};
