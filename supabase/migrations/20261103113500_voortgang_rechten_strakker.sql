-- Alleen lezen, toevoegen, wijzigen en verwijderen (met row level security); geen truncate.
revoke truncate, references, trigger on public.voortgang from authenticated;
