-- Function to automatically add trip creator as a participant
CREATE OR REPLACE FUNCTION public.add_creator_as_participant()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert the creator into trip_participants
  INSERT INTO public.trip_participants (trip_id, user_id)
  VALUES (NEW.id, NEW.created_by);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after a trip is created
DROP TRIGGER IF EXISTS trigger_add_creator_as_participant ON public.trips;
CREATE TRIGGER trigger_add_creator_as_participant
  AFTER INSERT ON public.trips
  FOR EACH ROW
  EXECUTE FUNCTION public.add_creator_as_participant();
