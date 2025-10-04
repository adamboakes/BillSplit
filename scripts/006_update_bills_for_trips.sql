-- Update bills table to reference trips
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE;

-- Create index for trip_id
CREATE INDEX IF NOT EXISTS idx_bills_trip_id ON public.bills(trip_id);

-- Update RLS policies for bills to work with trips
DROP POLICY IF EXISTS "Users can view bills they are part of" ON public.bills;
DROP POLICY IF EXISTS "Users can create bills" ON public.bills;
DROP POLICY IF EXISTS "Bill payers can update their bills" ON public.bills;
DROP POLICY IF EXISTS "Bill payers can delete their bills" ON public.bills;

CREATE POLICY "Users can view bills in their trips"
  ON public.bills FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE id = trip_id AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.trip_participants
          WHERE trip_id = trips.id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Trip participants can create bills"
  ON public.bills FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE id = trip_id AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.trip_participants
          WHERE trip_id = trips.id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Bill payers can update their bills"
  ON public.bills FOR UPDATE
  USING (auth.uid() = paid_by);

CREATE POLICY "Bill payers can delete their bills"
  ON public.bills FOR DELETE
  USING (auth.uid() = paid_by);
