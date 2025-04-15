import { Hono } from 'hono'
import { renderer } from './renderer'
import { usersTable } from './db/schema'
import { getDb, DbType } from './db'; // Import the factory function and type

// --- Environment Type Definition ---
// Define the expected Cloudflare Bindings and the variable we'll add to context
type Env = {
  Bindings: {
    // *** IMPORTANT: Replace 'DB' with your actual D1 binding name in wrangler.toml ***
    alquilando_db: D1Database;
    // Add other environment variables or bindings if needed
    // MY_VAR: string;
  };
  Variables: {
    // This defines the type of 'c.var.db'/'c.get('db')'
    db: DbType;
  }
};

// --- Hono App Initialization ---
const app = new Hono<Env>();

// --- Middleware ---
// This middleware runs for all routes ('*').
// It gets the DB instance using the binding from 'c.env'
// and attaches it to the context using 'c.set'.
app.use('*', async (c, next) => {
  const dbInstance = getDb(c.env.alquilando_db);
  c.set('db', dbInstance); // Make 'db' available in context
  await next(); // Continue to the route handler
});

app.use(renderer)

app.get('/', async (c) => {

  return c.render(
  
    <div>
      <button class="btn">Button</button>
    </div>

  )
})

app.get('/users', async (c) => {
  // Get the database instance directly from the context
  const db = c.get('db');

  try {
    // Now you can use the db instance
    // *** Make sure 'users' table is defined in your './schema' ***
    const allUsers = await db.select().from(usersTable)
    return c.json(allUsers);
  } catch (e) {
    console.error("Failed to fetch users:", e);
    return c.json({ error: 'Database query failed' }, 500);
  }
});

export default app
