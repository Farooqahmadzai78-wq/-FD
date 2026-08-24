-- ==========================================================
-- SQL Migration pour Supabase: Table bug_reports & RLS
-- À exécuter dans le Supabase SQL Editor s'il n'existe pas encore.
-- ==========================================================

-- 1. Création de la table bug_reports
CREATE TABLE IF NOT EXISTS public.bug_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT,
    category TEXT NOT NULL DEFAULT 'autre',
    description TEXT NOT NULL,
    app_version TEXT DEFAULT '1.0.0',
    technical_info JSONB,
    attachment_url TEXT,
    status TEXT NOT NULL DEFAULT 'nouveau' CHECK (status IN ('nouveau', 'en_cours', 'resolu'))
);

-- Index pour recherche rapide par date et statut
CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON public.bug_reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON public.bug_reports (status);

-- 2. Activation de la sécurité au niveau des lignes (RLS)
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité (RLS) :

-- a) INSERT: Permettre à TOUT LE MONDE (connecté ou invité anonyme) d'envoyer un signalement
DROP POLICY IF EXISTS "Anyone can submit bug reports" ON public.bug_reports;
CREATE POLICY "Anyone can submit bug reports" ON public.bug_reports
    FOR INSERT
    WITH CHECK (true);

-- b) SELECT: Un utilisateur normal ne peut lire que ses PROPRES signalements.
-- Les administrateurs peuvent consulter tous les signalements.
DROP POLICY IF EXISTS "Users can view own bug reports" ON public.bug_reports;
DROP POLICY IF EXISTS "Admin view all bug reports" ON public.bug_reports;
DROP POLICY IF EXISTS "Admin full access bug reports" ON public.bug_reports;

CREATE POLICY "Users can view own bug reports or admin views all" ON public.bug_reports
    FOR SELECT
    USING (
        (auth.uid() IS NOT NULL AND auth.uid() = user_id)
        OR (auth.jwt() ->> 'email' IN ('aroxasef@gmail.com'))
        OR (auth.jwt() -> 'user_metadata' ->> 'is_admin' = 'true')
        OR (auth.jwt() ->> 'role' = 'service_role')
    );

-- c) UPDATE & DELETE: Seuls les administrateurs peuvent modifier ou supprimer des signalements
DROP POLICY IF EXISTS "Admin update bug reports" ON public.bug_reports;
CREATE POLICY "Admin update bug reports" ON public.bug_reports
    FOR UPDATE
    USING (
        (auth.jwt() ->> 'email' IN ('aroxasef@gmail.com'))
        OR (auth.jwt() -> 'user_metadata' ->> 'is_admin' = 'true')
        OR (auth.jwt() ->> 'role' = 'service_role')
    );

-- 3. Bucket de stockage Supabase Storage pour les pièces jointes / captures
INSERT INTO storage.buckets (id, name, public) 
VALUES ('bug_attachments', 'bug_attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Politiques de stockage
DROP POLICY IF EXISTS "Anyone can upload bug attachments" ON storage.objects;
CREATE POLICY "Anyone can upload bug attachments" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'bug_attachments');

DROP POLICY IF EXISTS "Anyone can view bug attachments" ON storage.objects;
CREATE POLICY "Anyone can view bug attachments" ON storage.objects
    FOR SELECT USING (bucket_id = 'bug_attachments');
