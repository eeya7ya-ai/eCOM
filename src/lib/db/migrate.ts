import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log('Creating database tables...');

  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(100) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS category_translations (
      id SERIAL PRIMARY KEY,
      category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
      language VARCHAR(5) NOT NULL,
      name VARCHAR(200) NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(200) NOT NULL UNIQUE,
      price DECIMAL(10,3) NOT NULL,
      category_id INTEGER REFERENCES categories(id),
      is_active BOOLEAN DEFAULT TRUE NOT NULL,
      is_featured BOOLEAN DEFAULT FALSE NOT NULL,
      is_new_arrival BOOLEAN DEFAULT FALSE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS product_translations (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL,
      language VARCHAR(5) NOT NULL,
      title VARCHAR(500) NOT NULL,
      description TEXT
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS product_images (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL,
      image_url TEXT NOT NULL,
      display_order INTEGER DEFAULT 0 NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS product_variants (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL,
      size VARCHAR(10) NOT NULL,
      color VARCHAR(50) NOT NULL,
      color_code VARCHAR(10),
      stock_quantity INTEGER DEFAULT 0 NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS shipping_zones (
      id SERIAL PRIMARY KEY,
      zone_name VARCHAR(200) NOT NULL,
      zone_name_ar VARCHAR(200),
      price DECIMAL(10,3) NOT NULL,
      free_threshold DECIMAL(10,3),
      estimated_days INTEGER DEFAULT 3 NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      order_number VARCHAR(50) NOT NULL UNIQUE,
      customer_name VARCHAR(200) NOT NULL,
      customer_email VARCHAR(300) NOT NULL,
      customer_phone VARCHAR(50),
      total_price DECIMAL(10,3) NOT NULL,
      shipping_cost DECIMAL(10,3) DEFAULT 0 NOT NULL,
      status VARCHAR(50) DEFAULT 'pending' NOT NULL,
      tracking_number VARCHAR(100),
      stripe_payment_intent_id VARCHAR(200),
      shipping_zone_id INTEGER REFERENCES shipping_zones(id),
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
      product_id INTEGER REFERENCES products(id) NOT NULL,
      variant_id INTEGER REFERENCES product_variants(id),
      quantity INTEGER NOT NULL,
      price_at_purchase DECIMAL(10,3) NOT NULL,
      product_title VARCHAR(500),
      size VARCHAR(10),
      color VARCHAR(50),
      image_url TEXT
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS addresses (
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
      street TEXT NOT NULL,
      city VARCHAR(200) NOT NULL,
      governorate VARCHAR(200) NOT NULL,
      postal_code VARCHAR(20)
    )
  `;

  // Seed default shipping zones
  await sql`
    INSERT INTO shipping_zones (zone_name, zone_name_ar, price, free_threshold, estimated_days)
    VALUES
      ('Amman', 'عمان', 2.000, 50.000, 1),
      ('Other Governorates', 'باقي المحافظات', 4.000, 75.000, 3)
    ON CONFLICT DO NOTHING
  `;

  // Seed default categories
  await sql`
    INSERT INTO categories (slug) VALUES ('dresses'), ('clothes'), ('accessories')
    ON CONFLICT DO NOTHING
  `;

  await sql`
    INSERT INTO category_translations (category_id, language, name)
    SELECT c.id, 'en',
      CASE c.slug
        WHEN 'dresses' THEN 'Dresses'
        WHEN 'clothes' THEN 'Clothes'
        WHEN 'accessories' THEN 'Accessories'
      END
    FROM categories c
    WHERE NOT EXISTS (
      SELECT 1 FROM category_translations ct WHERE ct.category_id = c.id AND ct.language = 'en'
    )
  `;

  await sql`
    INSERT INTO category_translations (category_id, language, name)
    SELECT c.id, 'ar',
      CASE c.slug
        WHEN 'dresses' THEN 'فساتين'
        WHEN 'clothes' THEN 'ملابس'
        WHEN 'accessories' THEN 'إكسسوارات'
      END
    FROM categories c
    WHERE NOT EXISTS (
      SELECT 1 FROM category_translations ct WHERE ct.category_id = c.id AND ct.language = 'ar'
    )
  `;

  console.log('Database migration completed!');
}

migrate().catch(console.error);
