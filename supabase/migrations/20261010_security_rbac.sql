-- ==============================================================================
-- TONIMALUCO C.I - MIGRATION DE SEGURANÇA E RBAC (FASE 1)
-- ==============================================================================

-- 1. Tipo Enum para Papéis de Acesso (RBAC)
CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'operator', 'viewer');

-- 2. Tabela de Papéis de Usuários (Nunca confiar em user_metadata do cliente)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL DEFAULT 'viewer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Ativar RLS estrita na tabela de papéis
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Funções Helper com SECURITY DEFINER e search_path protegido contra ataques de schema hijacking
CREATE OR REPLACE FUNCTION public.has_role(required_role public.app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
          AND (
            role = required_role
            OR (required_role = 'viewer' AND role IN ('owner', 'admin', 'operator', 'viewer'))
            OR (required_role = 'operator' AND role IN ('owner', 'admin', 'operator'))
            OR (required_role = 'admin' AND role IN ('owner', 'admin'))
            OR (required_role = 'owner' AND role = 'owner')
          )
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_owner()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
          AND role IN ('owner', 'admin')
    );
END;
$$;

-- 4. Policies de Segurança para user_roles
-- Usuário autenticado pode ler APENAS seu próprio papel
CREATE POLICY "Users can read own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Apenas admins e donos podem listar papéis de todos
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.is_admin_or_owner());

-- Apenas donos e admins podem gerenciar papéis de outros usuários
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.is_admin_or_owner())
WITH CHECK (public.is_admin_or_owner());

-- 5. Trigger para atribuir 'owner' ao primeiro usuário cadastrado, e 'viewer' aos demais
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    user_count INTEGER;
BEGIN
    SELECT count(*) INTO user_count FROM public.user_roles;
    
    IF user_count = 0 THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'owner');
    ELSE
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'viewer');
    END IF;
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_role
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- 6. Tabela de Log de Auditoria Imutável (Audit Trail)
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins podem ler os logs de auditoria
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (public.is_admin_or_owner());

-- Usuários autenticados podem apenas registrar logs (INSERT), nunca alterar ou apagar (UPDATE/DELETE)
CREATE POLICY "Users can create audit entries"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Revogar permissões perigosas
REVOKE ALL ON public.audit_logs FROM public, anon;
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
