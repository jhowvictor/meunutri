
CREATE TABLE IF NOT EXISTS public.glucose_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  value_mg_dl NUMERIC NOT NULL,
  reading_type TEXT NOT NULL CHECK (reading_type IN ('jejum','pos_refeicao','antes_dormir','aleatorio')),
  notes TEXT,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.glucose_readings TO authenticated;
GRANT ALL ON public.glucose_readings TO service_role;
ALTER TABLE public.glucose_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User manages own readings" ON public.glucose_readings FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Professional views patient readings" ON public.glucose_readings FOR SELECT
  USING (
    patient_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = glucose_readings.patient_id AND p.professional_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_glucose_user_time ON public.glucose_readings(user_id, measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_glucose_patient_time ON public.glucose_readings(patient_id, measured_at DESC);

CREATE TABLE IF NOT EXISTS public.glucose_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reading_type TEXT NOT NULL CHECK (reading_type IN ('jejum','pos_refeicao','antes_dormir','aleatorio')),
  min_value NUMERIC NOT NULL,
  max_value NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (patient_id, reading_type)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.glucose_goals TO authenticated;
GRANT ALL ON public.glucose_goals TO service_role;
ALTER TABLE public.glucose_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pro manages goals" ON public.glucose_goals FOR ALL
  USING (auth.uid() = professional_id) WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Patient views own goals" ON public.glucose_goals FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = glucose_goals.patient_id AND p.patient_user_id = auth.uid()));

CREATE TRIGGER trg_goals_updated BEFORE UPDATE ON public.glucose_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
