
-- Plan versions for the Adaptation Engine
CREATE TABLE public.plan_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.patient_assignments(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL,
  version_number integer NOT NULL DEFAULT 1,
  content text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plan_versions TO authenticated;
GRANT ALL ON public.plan_versions TO service_role;
ALTER TABLE public.plan_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pro manages own plan versions" ON public.plan_versions
  FOR ALL USING (auth.uid() = professional_id) WITH CHECK (auth.uid() = professional_id);

-- Message templates for the Content/Communication Engines
CREATE TABLE public.engine_message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.engine_message_templates TO authenticated;
GRANT ALL ON public.engine_message_templates TO service_role;
ALTER TABLE public.engine_message_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pro manages own templates" ON public.engine_message_templates
  FOR ALL USING (auth.uid() = professional_id) WITH CHECK (auth.uid() = professional_id);

CREATE TRIGGER engine_templates_updated
  BEFORE UPDATE ON public.engine_message_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
