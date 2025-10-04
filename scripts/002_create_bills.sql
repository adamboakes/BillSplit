-- Create bills table
create table if not exists public.bills (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  amount numeric(10, 2) not null,
  category text default 'General',
  paid_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.bills enable row level security;

-- RLS Policies for bills
-- Users can view bills they are part of (either paid by them or split with them)
create policy "Users can view bills they are part of"
  on public.bills for select
  using (
    auth.uid() = paid_by
    or exists (
      select 1 from public.bill_participants
      where bill_participants.bill_id = bills.id
      and bill_participants.user_id = auth.uid()
    )
  );

-- Users can insert their own bills
create policy "Users can insert their own bills"
  on public.bills for insert
  with check (auth.uid() = paid_by);

-- Users can update bills they paid for
create policy "Users can update their own bills"
  on public.bills for update
  using (auth.uid() = paid_by);

-- Users can delete bills they paid for
create policy "Users can delete their own bills"
  on public.bills for delete
  using (auth.uid() = paid_by);
