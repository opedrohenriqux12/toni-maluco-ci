-- ==============================================================================
-- TONIMALUCO C.I - MIGRATION DE MONITORAMENTO DE LIMITES DO BANCO (FASE 2)
-- ==============================================================================

-- 1. Função com SECURITY DEFINER para ler tamanho do banco, contagem de tabelas e conexões ativas
CREATE OR REPLACE FUNCTION public.get_database_health_metrics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    db_size_bytes BIGINT;
    db_size_mb NUMERIC;
    total_users BIGINT;
    active_conns INTEGER;
    audit_count BIGINT;
    threads_count BIGINT;
    messages_count BIGINT;
    roles_count BIGINT;
    result JSONB;
BEGIN
    -- Tamanho do banco de dados atual
    SELECT pg_database_size(current_database()) INTO db_size_bytes;
    db_size_mb := round((db_size_bytes::numeric / (1024 * 1024)), 2);

    -- Contagem de conexões ativas
    SELECT count(*) INTO active_conns FROM pg_stat_activity WHERE datname = current_database();

    -- Contagem de usuários cadastrados no auth
    SELECT count(*) INTO total_users FROM auth.users;

    -- Contagem de registros nas tabelas principais
    SELECT count(*) INTO audit_count FROM public.audit_logs;
    SELECT count(*) INTO threads_count FROM public.council_threads;
    SELECT count(*) INTO messages_count FROM public.council_messages;
    SELECT count(*) INTO roles_count FROM public.user_roles;

    result := jsonb_build_object(
        'database_size_bytes', db_size_bytes,
        'database_size_mb', db_size_mb,
        'database_limit_mb', 500,
        'database_pct_used', round((db_size_mb / 500.0) * 100, 2),
        'active_connections', active_conns,
        'connections_limit', 60,
        'total_auth_users', total_users,
        'auth_users_limit', 50000,
        'table_counts', jsonb_build_object(
            'audit_logs', audit_count,
            'council_threads', threads_count,
            'council_messages', messages_count,
            'user_roles', roles_count
        ),
        'checked_at', now()
    );

    RETURN result;
END;
$$;

-- Revogar permissão pública e conceder apenas a authenticated
REVOKE ALL ON FUNCTION public.get_database_health_metrics() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_database_health_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_database_health_metrics() TO service_role;
