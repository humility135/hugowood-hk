-- Enable read access for everyone to orders (for admin dashboard demo)
create policy "Enable read access for all users" on "public"."orders"
as permissive for select
to public
using (true);

-- Enable insert access for everyone to orders (for guest checkout)
create policy "Enable insert access for all users" on "public"."orders"
as permissive for insert
to public
with check (true);

-- Enable update access for everyone to orders (for admin updating status)
create policy "Enable update access for all users" on "public"."orders"
as permissive for update
to public
using (true);

-- Enable read access for everyone to order_items
create policy "Enable read access for all users" on "public"."order_items"
as permissive for select
to public
using (true);

-- Enable insert access for everyone to order_items
create policy "Enable insert access for all users" on "public"."order_items"
as permissive for insert
to public
with check (true);
