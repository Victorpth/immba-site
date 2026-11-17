-- Marketplace functions only. Tables, the settings row, and the marketplace-photos bucket already exist.
-- Safe to run again: functions are replaced. No tables and no seed inserts.

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

create or replace function public.marketplace_prevent_order_delete()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'orders_cannot_be_deleted';
end;
$$;

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
