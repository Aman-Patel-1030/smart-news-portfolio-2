#!/usr/bin/env node

const { neon } = require("@neondatabase/serverless")
const fs = require("fs")
const path = require("path")

// Database setup script
async function setupDatabase() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    console.error("DATABASE_URL environment variable is required")
    process.exit(1)
  }

  const sql = neon(databaseUrl)

  try {
    console.log("Setting up database schema...")

    // Read and execute the schema SQL file
    const schemaPath = path.join(__dirname, "create_database.sql")
    const schemaSQL = fs.readFileSync(schemaPath, "utf8")

    // Split SQL commands and execute them
    const commands = schemaSQL.split(";").filter((cmd) => cmd.trim())

    for (const command of commands) {
      if (command.trim()) {
        await sql`${command}`
      }
    }

    console.log("Database schema created successfully")

    // Read and execute the seed data SQL file
    const seedPath = path.join(__dirname, "seed_sample_news.sql")
    const seedSQL = fs.readFileSync(seedPath, "utf8")

    const seedCommands = seedSQL.split(";").filter((cmd) => cmd.trim())

    for (const command of seedCommands) {
      if (command.trim()) {
        await sql`${command}`
      }
    }

    console.log("Sample data inserted successfully")
    console.log("Database setup completed!")
  } catch (error) {
    console.error("Error setting up database:", error)
    process.exit(1)
  }
}

// Run the setup
setupDatabase()
