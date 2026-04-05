
-- Create collection table
CREATE TABLE public.collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country TEXT NOT NULL,
  coins INTEGER NOT NULL DEFAULT 0,
  notes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(country)
);

-- Enable RLS
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- Anyone can view the collection (public read)
CREATE POLICY "Collections are viewable by everyone"
  ON public.collections FOR SELECT USING (true);

-- Seed initial data
INSERT INTO public.collections (country, coins, notes) VALUES
  ('Japan', 12, 5),
  ('France', 8, 2),
  ('Germany', 6, 3),
  ('United States of America', 10, 4),
  ('Canada', 4, 1),
  ('Mexico', 3, 2),
  ('Brazil', 7, 3),
  ('Argentina', 2, 1),
  ('United Kingdom', 9, 3),
  ('Spain', 5, 2),
  ('Italy', 7, 2),
  ('India', 11, 6),
  ('China', 6, 4),
  ('Australia', 4, 2),
  ('South Africa', 3, 2),
  ('Russian Federation', 5, 3);
