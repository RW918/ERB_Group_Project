/**
 * Demo companies. Idempotent on the unique name.
 */
export const seed = async (knex) => {
    await knex("companies")
        .insert([{ name: "Example Ltd" }, { name: "Northwind Studio" }, { name: "Violet Labs" }])
        .onConflict("name")
        .ignore();
};
//# sourceMappingURL=03_companies.js.map