
CREATE TABLE public.library_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.library_items TO authenticated;
GRANT ALL ON public.library_items TO service_role;

ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own library items"
  ON public.library_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own library items"
  ON public.library_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own library items"
  ON public.library_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own library items"
  ON public.library_items FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_library_items_user_type ON public.library_items(user_id, content_type);
CREATE INDEX idx_library_items_created ON public.library_items(created_at DESC);

CREATE TRIGGER update_library_items_updated_at
  BEFORE UPDATE ON public.library_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
