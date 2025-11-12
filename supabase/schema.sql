-- Table: customers
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  address text,
  created_at timestamp default now()
);

-- Table: orders
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  product text not null,
  quantity int default 1,
  price numeric(10,2) default 0,
  created_at timestamp default now()
);
