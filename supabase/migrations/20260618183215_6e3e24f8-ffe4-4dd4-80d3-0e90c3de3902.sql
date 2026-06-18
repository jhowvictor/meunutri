
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_type TEXT NOT NULL DEFAULT 'pessoa' CHECK (account_type IN ('pessoa','profissional'));

CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  city TEXT,
  goal TEXT,
  notes TEXT,
  invite_token TEXT UNIQUE,
  invite_status TEXT NOT NULL DEFAULT 'pending' CHECK (invite_status IN ('pending','accepted','revoked')),
  last_activity_at TIMESTAMPTZ,
  adherence_status TEXT DEFAULT 'green' CHECK (adherence_status IN ('green','yellow','red')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO authenticated;
GRANT ALL ON public.patients TO service_role;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pros manage their patients" ON public.patients FOR ALL USING (auth.uid() = professional_id) WITH CHECK (auth.uid() = professional_id);
CREATE POLICY "Patient sees own record" ON public.patients FOR SELECT USING (auth.uid() = patient_user_id);
CREATE INDEX IF NOT EXISTS idx_patients_pro ON public.patients(professional_id);
CREATE INDEX IF NOT EXISTS idx_patients_user ON public.patients(patient_user_id);
CREATE TRIGGER trg_patients_updated BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.professional_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  registration_number TEXT,
  specialty TEXT,
  logo_url TEXT,
  brand_color TEXT,
  bio TEXT,
  whatsapp TEXT,
  email_contact TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.professional_profiles TO authenticated;
GRANT ALL ON public.professional_profiles TO service_role;
ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pros can manage own pro profile" ON public.professional_profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Patients can view their pros" ON public.professional_profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.patients p WHERE p.professional_id = professional_profiles.id AND p.patient_user_id = auth.uid())
);
CREATE TRIGGER trg_pp_updated BEFORE UPDATE ON public.professional_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.patient_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  assignment_type TEXT NOT NULL CHECK (assignment_type IN ('receita','dieta','treino','lista','ebook','outro')),
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent','viewed','completed','ignored')),
  sent_via TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_assignments TO authenticated;
GRANT ALL ON public.patient_assignments TO service_role;
ALTER TABLE public.patient_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pros manage assignments" ON public.patient_assignments FOR ALL USING (auth.uid() = professional_id) WITH CHECK (auth.uid() = professional_id);
CREATE POLICY "Patient views own assignments" ON public.patient_assignments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_assignments.patient_id AND p.patient_user_id = auth.uid())
);
CREATE INDEX IF NOT EXISTS idx_assign_patient ON public.patient_assignments(patient_id);
CREATE INDEX IF NOT EXISTS idx_assign_pro ON public.patient_assignments(professional_id);
CREATE TRIGGER trg_assign_updated BEFORE UPDATE ON public.patient_assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
