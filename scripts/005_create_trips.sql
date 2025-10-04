-- Create trips table
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trip_participants table
CREATE TABLE IF NOT EXISTS public.trip_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trip_id, user_id)
);

-- Enable RLS
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trips
CREATE POLICY "Users can view trips they created or are part of"
  ON public.trips FOR SELECT
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.trip_participants
      WHERE trip_id = trips.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create trips"
  ON public.trips FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Trip creators can update their trips"
  ON public.trips FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Trip creators can delete their trips"
  ON public.trips FOR DELETE
  USING (auth.uid() = created_by);

-- RLS Policies for trip_participants
CREATE POLICY "Users can view participants of trips they're in"
  ON public.trip_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE id = trip_id AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.trip_participants tp
          WHERE tp.trip_id = trips.id AND tp.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Trip creators can add participants"
  ON public.trip_participants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE id = trip_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Trip creators can remove participants"
  ON public.trip_participants FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE id = trip_id AND created_by = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_trips_created_by ON public.trips(created_by);
CREATE INDEX IF NOT EXISTS idx_trip_participants_trip_id ON public.trip_participants(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_participants_user_id ON public.trip_participants(user_id);
