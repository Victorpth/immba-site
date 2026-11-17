-- Marketplace tables for the imMBA C2C book exchange.
-- Run this once in the Supabase SQL editor. It does not change faculty, profiles,
-- alumni, or audit_logs.
-- The Next.js server writes with the secret key, which bypasses row level security.
-- anon and authenticated have no policies, so the browser cannot read or write these tables.
-- Listing photos are files in the marketplace-photos bucket. This file stores only the object name.
-- The site shows its existing placeholder when a listing has no photo.

create table public.marketplace_profiles (
  -- Same id as the Supabase Auth user.
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 200),
  -- buyer, seller, or both. This is not profiles.role.
  role text not null check (role in ('buyer', 'seller', 'both')),
  phone text check (phone is null or char_length(phone) <= 40),
  created_at timestamptz not null default now()
);

comment on table public.marketplace_profiles is
  'One marketplace profile per auth user. Separate from staff roles in profiles.';

comment on column public.marketplace_profiles.role is
  'buyer, seller, or both.';

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.marketplace_profiles (user_id) on delete cascade,
  title_en text not null check (char_length(btrim(title_en)) between 1 and 200),
  title_zh text not null check (char_length(btrim(title_zh)) between 1 and 200),
  description_en text not null default '',
  description_zh text not null default '',
  -- Whole new Taiwan dollars.
  price_twd integer not null check (price_twd >= 0),
  -- Remaining stock. An order decreases it. 0 is sold out. 1 is low stock.
  quantity integer not null check (quantity >= 0),
  condition text not null check (condition in ('new', 'like_new', 'good', 'fair')),
  category text not null check (category in ('book', 'course_material', 'other')),
  course_name text,
  -- removed listings stay in the database but cannot be ordered.
  status text not null default 'active' check (status in ('active', 'removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(description_en) <= 4000),
  check (char_length(description_zh) <= 4000),
  check (course_name is null or char_length(course_name) <= 200)
);

comment on table public.listings is
  'Items for sale. quantity is the stock still available.';

comment on column public.listings.quantity is
  'Remaining stock. 0 means sold out. 1 means low stock.';

create index listings_seller_id_idx on public.listings (seller_id);
create index listings_status_idx on public.listings (status);

create table public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  -- Object name inside the marketplace-photos bucket. Not a full URL.
  object_name text not null check (
    object_name ~ '^[A-Za-z0-9._/-]+$'
    and position('..' in object_name) = 0
  ),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (listing_id, sort_order)
);

comment on table public.listing_images is
  'Photo object names stored in the marketplace-photos bucket.';

create index listing_images_listing_id_idx on public.listing_images (listing_id);

-- One row. platform_fee_twd starts at 4. The server allows only a super_admin to change it.
create table public.marketplace_settings (
  id integer primary key default 1 check (id = 1),
  platform_fee_twd integer not null default 4 check (platform_fee_twd >= 0),
  updated_at timestamptz not null default now()
);

comment on table public.marketplace_settings is
  'Single settings row. platform_fee_twd defaults to 4 and is copied onto each order.';

insert into public.marketplace_settings (id, platform_fee_twd)
values (1, 4);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  -- Null if that marketplace profile is later removed. The name snapshot stays.
  buyer_id uuid references public.marketplace_profiles (user_id) on delete set null,
  seller_id uuid references public.marketplace_profiles (user_id) on delete set null,
  buyer_name text not null,
  seller_name text not null,
  items_subtotal_twd integer not null check (items_subtotal_twd >= 0),
  -- pickup is 0 TWD. home is 80 TWD. The buyer pays subtotal plus this fee.
  delivery_mode text not null check (delivery_mode in ('pickup', 'home')),
  delivery_fee_twd integer not null check (delivery_fee_twd >= 0),
  total_twd integer not null check (total_twd >= 0),
  -- Copied from marketplace_settings at purchase. Not added to total_twd.
  platform_fee_twd integer not null check (platform_fee_twd >= 0),
  -- Forward only: placed, awaiting_payment, payment_confirmed, ready_to_ship, shipped, completed.
  status text not null default 'placed' check (
    status in (
      'placed',
      'awaiting_payment',
      'payment_confirmed',
      'ready_to_ship',
      'shipped',
      'completed'
    )
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (delivery_mode = 'pickup' and delivery_fee_twd = 0)
    or (delivery_mode = 'home' and delivery_fee_twd = 80)
  ),
  check (total_twd = items_subtotal_twd + delivery_fee_twd),
  check (buyer_id is null or seller_id is null or buyer_id <> seller_id)
);

comment on table public.orders is
  'One order belongs to one seller. Rows are never deleted. Completed orders stay after a listing or account is removed.';

comment on column public.orders.total_twd is
  'Amount the buyer pays: item subtotal plus delivery. The platform fee is not included.';

comment on column public.orders.platform_fee_twd is
  'Platform fee frozen from marketplace_settings when the order was created.';

create index orders_buyer_id_idx on public.orders (buyer_id);
create index orders_seller_id_idx on public.orders (seller_id);
create index orders_status_idx on public.orders (status);
create index orders_created_at_idx on public.orders (created_at);
create index orders_total_twd_idx on public.orders (total_twd);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id),
  -- Null after the listing row is removed. Title and price below stay.
  listing_id uuid references public.listings (id) on delete set null,
  quantity integer not null check (quantity > 0),
  unit_price_twd integer not null check (unit_price_twd >= 0),
  title_en text not null,
  title_zh text not null,
  unique (order_id, listing_id)
);

comment on table public.order_items is
  'Lines purchased. Title and unit price are the values at checkout.';

create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_listing_id_idx on public.order_items (listing_id);

create table public.order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id),
  status text not null check (
    status in (
      'placed',
      'awaiting_payment',
      'payment_confirmed',
      'ready_to_ship',
      'shipped',
      'completed'
    )
  ),
  actor_id uuid references auth.users (id) on delete set null,
  actor_label text,
  created_at timestamptz not null default now()
);

comment on table public.order_status_events is
  'One row each time an order status changes. A payment still awaiting_payment after 7 days is late.';

create index order_status_events_order_id_idx on public.order_status_events (order_id, created_at);

-- Public storage bucket. Reads use the public object URL. Writes have no policy:
-- the server uploads with the secret key.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'marketplace-photos',
  'marketplace-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "marketplace_photos_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'marketplace-photos');

alter table public.marketplace_profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.marketplace_settings enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_events enable row level security;

revoke all on table public.marketplace_profiles from anon, authenticated;
revoke all on table public.listings from anon, authenticated;
revoke all on table public.listing_images from anon, authenticated;
revoke all on table public.marketplace_settings from anon, authenticated;
revoke all on table public.orders from anon, authenticated;
revoke all on table public.order_items from anon, authenticated;
revoke all on table public.order_status_events from anon, authenticated;

-- Status may move only one step forward. Money, names, and delivery are frozen.
-- buyer_id and seller_id may become null when a profile is removed.
create or replace function public.marketplace_guard_order()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  sequence text[] := array[
    'placed',
    'awaiting_payment',
    'payment_confirmed',
    'ready_to_ship',
    'shipped',
    'completed'
  ];
  previous_step integer;
  next_step integer;
begin
  if tg_op = 'INSERT' then
    if new.status <> 'placed' then
      raise exception 'invalid_status_step';
    end if;
    return new;
  end if;

  if new.status is distinct from old.status then
    previous_step := array_position(sequence, old.status);
    next_step := array_position(sequence, new.status);
    if previous_step is null or next_step is null or next_step <> previous_step + 1 then
      raise exception 'invalid_status_step';
    end if;
  end if;

  if new.items_subtotal_twd is distinct from old.items_subtotal_twd
    or new.delivery_mode is distinct from old.delivery_mode
    or new.delivery_fee_twd is distinct from old.delivery_fee_twd
    or new.total_twd is distinct from old.total_twd
    or new.platform_fee_twd is distinct from old.platform_fee_twd
    or new.buyer_name is distinct from old.buyer_name
    or new.seller_name is distinct from old.seller_name
    or new.created_at is distinct from old.created_at
    or (new.buyer_id is distinct from old.buyer_id and new.buyer_id is not null)
    or (new.seller_id is distinct from old.seller_id and new.seller_id is not null)
  then
    raise exception 'order_snapshot_locked';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create trigger marketplace_orders_guard
  before insert or update on public.orders
  for each row
  execute function public.marketplace_guard_order();

create or replace function public.marketplace_record_order_status()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  actor uuid;
begin
  begin
    actor := nullif(current_setting('marketplace.actor_id', true), '')::uuid;
  exception
    when invalid_text_representation then
      actor := null;
  end;

  insert into public.order_status_events (order_id, status, actor_id, actor_label)
  values (
    new.id,
    new.status,
    actor,
    nullif(current_setting('marketplace.actor_label', true), '')
  );
  return new;
end;
$$;

create trigger marketplace_orders_record_status
  after insert or update of status on public.orders
  for each row
  execute function public.marketplace_record_order_status();

create or replace function public.marketplace_lock_order_item()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.order_id is distinct from old.order_id
    or new.quantity is distinct from old.quantity
    or new.unit_price_twd is distinct from old.unit_price_twd
    or new.title_en is distinct from old.title_en
    or new.title_zh is distinct from old.title_zh
    or (new.listing_id is distinct from old.listing_id and new.listing_id is not null)
  then
    raise exception 'order_item_snapshot_locked';
  end if;
  return new;
end;
$$;

create trigger marketplace_order_items_lock
  before update on public.order_items
  for each row
  execute function public.marketplace_lock_order_item();

create or replace function public.marketplace_prevent_order_delete()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'orders_cannot_be_deleted';
end;
$$;

create trigger marketplace_orders_no_delete
  before delete on public.orders
  for each row
  execute function public.marketplace_prevent_order_delete();

create trigger marketplace_order_items_no_delete
  before delete on public.order_items
  for each row
  execute function public.marketplace_prevent_order_delete();

create trigger marketplace_order_events_no_delete
  before delete on public.order_status_events
  for each row
  execute function public.marketplace_prevent_order_delete();

create or replace function public.marketplace_protect_settings()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'settings_cannot_be_deleted';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger marketplace_settings_protect
  before update or delete on public.marketplace_settings
  for each row
  execute function public.marketplace_protect_settings();

-- Creates one order for one seller and decreases stock in the same transaction.
-- p_items is a JSON array of objects: {"listing_id":"<uuid>","quantity":1}.
-- Raises cannot_buy_own_listing, buyer_not_allowed, seller_not_allowed,
-- invalid_delivery, empty_order, invalid_item, duplicate_listing,
-- listing_not_available, insufficient_stock, or settings_missing.
-- The buyer pays items plus 0 TWD (pickup) or 80 TWD (home). The platform fee is stored apart.
create or replace function public.create_marketplace_order(
  p_buyer_id uuid,
  p_seller_id uuid,
  p_delivery_mode text,
  p_items jsonb
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  buyer_role text;
  buyer_name text;
  seller_role text;
  seller_name text;
  delivery_fee integer;
  platform_fee integer;
  subtotal integer := 0;
  order_id uuid := gen_random_uuid();
  item jsonb;
  listing_id uuid;
  item_quantity integer;
  listing public.listings%rowtype;
  seen uuid[] := array[]::uuid[];
  lines jsonb := '[]'::jsonb;
  line jsonb;
  updated_rows integer;
begin
  if p_buyer_id = p_seller_id then
    raise exception 'cannot_buy_own_listing';
  end if;

  if p_delivery_mode = 'pickup' then
    delivery_fee := 0;
  elsif p_delivery_mode = 'home' then
    delivery_fee := 80;
  else
    raise exception 'invalid_delivery';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'empty_order';
  end if;

  select role, display_name into buyer_role, buyer_name
  from public.marketplace_profiles
  where user_id = p_buyer_id;
  if not found or buyer_role not in ('buyer', 'both') then
    raise exception 'buyer_not_allowed';
  end if;

  select role, display_name into seller_role, seller_name
  from public.marketplace_profiles
  where user_id = p_seller_id;
  if not found or seller_role not in ('seller', 'both') then
    raise exception 'seller_not_allowed';
  end if;

  select platform_fee_twd into platform_fee
  from public.marketplace_settings
  where id = 1
  for update;
  if not found then
    raise exception 'settings_missing';
  end if;

  for item in select value from jsonb_array_elements(p_items)
  loop
    begin
      listing_id := (item->>'listing_id')::uuid;
      item_quantity := (item->>'quantity')::integer;
    exception
      when invalid_text_representation or numeric_value_out_of_range then
        raise exception 'invalid_item';
    end;

    if listing_id is null or item_quantity is null or item_quantity < 1 then
      raise exception 'invalid_item';
    end if;
    if listing_id = any (seen) then
      raise exception 'duplicate_listing';
    end if;
    seen := seen || listing_id;
  end loop;

  -- Lock the requested rows in a stable order before decreasing stock.
  perform 1
  from public.listings
  where id = any (seen)
  order by id
  for update;

  foreach listing_id in array seen
  loop
    item_quantity := null;
    for item in select value from jsonb_array_elements(p_items)
    loop
      if (item->>'listing_id')::uuid = listing_id then
        item_quantity := (item->>'quantity')::integer;
      end if;
    end loop;

    select * into listing
    from public.listings
    where id = listing_id;

    if not found
      or listing.seller_id <> p_seller_id
      or listing.seller_id = p_buyer_id
      or listing.status <> 'active'
    then
      raise exception 'listing_not_available';
    end if;

    if listing.quantity < item_quantity then
      raise exception 'insufficient_stock';
    end if;

    update public.listings
    set quantity = quantity - item_quantity,
        updated_at = now()
    where id = listing_id
      and seller_id = p_seller_id
      and status = 'active'
      and quantity >= item_quantity;

    get diagnostics updated_rows = row_count;
    if updated_rows <> 1 then
      raise exception 'insufficient_stock';
    end if;

    subtotal := subtotal + (listing.price_twd * item_quantity);
    lines := lines || jsonb_build_array(
      jsonb_build_object(
        'listing_id', listing_id,
        'quantity', item_quantity,
        'unit_price_twd', listing.price_twd,
        'title_en', listing.title_en,
        'title_zh', listing.title_zh
      )
    );
  end loop;

  perform set_config('marketplace.actor_id', p_buyer_id::text, true);
  perform set_config('marketplace.actor_label', buyer_name, true);

  insert into public.orders (
    id,
    buyer_id,
    seller_id,
    buyer_name,
    seller_name,
    items_subtotal_twd,
    delivery_mode,
    delivery_fee_twd,
    total_twd,
    platform_fee_twd,
    status
  )
  values (
    order_id,
    p_buyer_id,
    p_seller_id,
    buyer_name,
    seller_name,
    subtotal,
    p_delivery_mode,
    delivery_fee,
    subtotal + delivery_fee,
    platform_fee,
    'placed'
  );

  for line in select value from jsonb_array_elements(lines)
  loop
    insert into public.order_items (
      order_id,
      listing_id,
      quantity,
      unit_price_twd,
      title_en,
      title_zh
    )
    values (
      order_id,
      (line->>'listing_id')::uuid,
      (line->>'quantity')::integer,
      (line->>'unit_price_twd')::integer,
      line->>'title_en',
      line->>'title_zh'
    );
  end loop;

  return order_id;
end;
$$;

comment on function public.create_marketplace_order(uuid, uuid, text, jsonb) is
  'Creates one seller order and decreases listing stock atomically.';

revoke all on function public.marketplace_guard_order() from public, anon, authenticated;
revoke all on function public.marketplace_record_order_status() from public, anon, authenticated;
revoke all on function public.marketplace_lock_order_item() from public, anon, authenticated;
revoke all on function public.marketplace_prevent_order_delete() from public, anon, authenticated;
revoke all on function public.marketplace_protect_settings() from public, anon, authenticated;
revoke all on function public.create_marketplace_order(uuid, uuid, text, jsonb) from public, anon, authenticated;
grant execute on function public.create_marketplace_order(uuid, uuid, text, jsonb) to service_role;

-- The server client uses service_role. Orders still cannot be deleted: the delete trigger rejects it.
grant select, insert, update, delete on table public.marketplace_profiles to service_role;
grant select, insert, update, delete on table public.listings to service_role;
grant select, insert, update, delete on table public.listing_images to service_role;
grant select, insert, update, delete on table public.marketplace_settings to service_role;
grant select, insert, update, delete on table public.orders to service_role;
grant select, insert, update, delete on table public.order_items to service_role;
grant select, insert, update, delete on table public.order_status_events to service_role;
