import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Valores do seu projeto Supabase
const supabaseUrl = 'https://xignqqniafhhmgfpvzpa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpZ25xcW5pYWZoaG1nZnB2enBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNjQxMDIsImV4cCI6MjA4NDk0MDEwMn0.liT7HwsA6vTB95V-A2CM5Q8Ims-74gLRps3-AeYHbcE';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("As credenciais do Supabase não foram definidas. A aplicação pode não se conectar ao banco de dados.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);