create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price numeric(10,2) not null check (price >= 0),
  old_price numeric(10,2) null check (old_price is null or old_price >= 0),
  destination text not null check (destination in ('discount', 'regular')),
  category text not null,
  image_url text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_destination_category_check check (
    (destination = 'discount' and category in ('duschen', 'wasserfilter', 'smart-home'))
    or
    (destination = 'regular' and category in ('badzubehoer', 'haushalt-wohnen'))
  )
);

create index if not exists products_active_destination_idx
  on public.products (active, destination, category);

alter table public.products enable row level security;

drop policy if exists "Public can read active Heinze products" on public.products;
create policy "Public can read active Heinze products"
  on public.products for select
  using (active = true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('heinze-products', 'heinze-products', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
set public = true, file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "Public can view Heinze product images" on storage.objects;
create policy "Public can view Heinze product images"
  on storage.objects for select
  using (bucket_id = 'heinze-products');
