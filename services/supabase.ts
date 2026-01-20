
import { createClient } from '@supabase/supabase-js';

// No ambiente de execução, process.env mapeia as variáveis do .env
// Fallback para valores hardcoded caso o process.env não esteja populado
const supabaseUrl = process.env.SUPABASE_URL || 'https://nzmkmmeencnhlumegman.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56bWttbWVlbmNuaGx1bWVnbWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NzQxNDAsImV4cCI6MjA4NDM1MDE0MH0.YSWCzHxlYafcYoCj4R-PNrVfoIE_8T6JHctu6fzKECM';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase environment variables are missing. Check your .env file.");
}

// Inicializa a instância oficial do Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Cloud Fetcher: Busca dados em tempo real da nuvem
 */
export const fetchFromCloud = async (tableName: string) => {
    const { data, error } = await supabase
        .from(tableName)
        .select('*');
    
    if (error) {
        console.error(`Error fetching ${tableName}:`, error.message, error.details);
        return [];
    }
    return data || [];
};

/**
 * Generic Upsert: Sincroniza mudanças locais com a nuvem
 */
export const upsertToCloud = async (tableName: string, record: any) => {
    const { data, error } = await supabase
        .from(tableName)
        .upsert(record)
        .select();

    if (error) {
        console.error(`Error upserting to ${tableName}:`, error.message);
        return { success: false, error };
    }
    return { success: true, data };
};

// Atalhos de compatibilidade para o DataContext
export const upsertWorkOrder = async (order: any) => upsertToCloud('work_orders', order);
export const upsertEquipment = async (eq: any) => upsertToCloud('equipment', eq);
export const upsertSparePart = async (part: any) => upsertToCloud('spare_parts', part);
