
-- Allow authenticated users to insert
CREATE POLICY "Authenticated users can insert collections"
  ON public.collections FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update collections"
  ON public.collections FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete collections"
  ON public.collections FOR DELETE TO authenticated
  USING (true);
