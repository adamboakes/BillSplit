-- Function to get all users involved in a bill (payer + participants)
create or replace function public.get_bill_users(bill_uuid uuid)
returns table (
  user_id uuid,
  email text,
  display_name text,
  is_payer boolean
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    p.id as user_id,
    p.email,
    p.display_name,
    (b.paid_by = p.id) as is_payer
  from public.profiles p
  inner join public.bills b on b.id = bill_uuid
  where p.id = b.paid_by
  union
  select 
    p.id as user_id,
    p.email,
    p.display_name,
    false as is_payer
  from public.profiles p
  inner join public.bill_participants bp on bp.user_id = p.id
  where bp.bill_id = bill_uuid;
end;
$$;
