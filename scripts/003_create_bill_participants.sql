-- Create bill_participants table to track who is splitting each bill
create table if not exists public.bill_participants (
  id uuid primary key default gen_random_uuid(),
  bill_id uuid not null references public.bills(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(bill_id, user_id)
);

-- Enable RLS
alter table public.bill_participants enable row level security;

-- RLS Policies for bill_participants
-- Users can view participants of bills they are part of
create policy "Users can view participants of their bills"
  on public.bill_participants for select
  using (
    exists (
      select 1 from public.bills
      where bills.id = bill_participants.bill_id
      and (
        bills.paid_by = auth.uid()
        or exists (
          select 1 from public.bill_participants bp
          where bp.bill_id = bills.id
          and bp.user_id = auth.uid()
        )
      )
    )
  );

-- Users can add participants to bills they paid for
create policy "Users can add participants to their bills"
  on public.bill_participants for insert
  with check (
    exists (
      select 1 from public.bills
      where bills.id = bill_participants.bill_id
      and bills.paid_by = auth.uid()
    )
  );

-- Users can remove participants from bills they paid for
create policy "Users can remove participants from their bills"
  on public.bill_participants for delete
  using (
    exists (
      select 1 from public.bills
      where bills.id = bill_participants.bill_id
      and bills.paid_by = auth.uid()
    )
  );

-- Create index for faster lookups
create index if not exists bill_participants_bill_id_idx on public.bill_participants(bill_id);
create index if not exists bill_participants_user_id_idx on public.bill_participants(user_id);
