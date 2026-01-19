import { createClient } from '@supabase/supabase-js';

// No ambiente de execução, process.env mapeia as variáveis do .env
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

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
        console.error(`Error fetching ${tableName}:`, error);
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
        console.error(`Error upserting to ${tableName}:`, error);
        return { success: false, error };
    }
    return { success: true, data };
};

// Atalhos de compatibilidade para o DataContext
export const upsertWorkOrder = async (order: any) => upsertToCloud('work_orders', order);
export const upsertEquipment = async (eq: any) => upsertToCloud('equipment', eq);
export const upsertSparePart = async (part: any) => upsertToCloud('spare_parts', part);
