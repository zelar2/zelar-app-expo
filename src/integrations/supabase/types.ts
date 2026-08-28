export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string;
          created_at: string;
          id: string;
          ip: string | null;
          metadata: Json;
          resource: string | null;
          resource_id: string | null;
          user_agent: string | null;
          user_id: string | null;
        };
        Insert: {
          action: string;
          created_at?: string;
          id?: string;
          ip?: string | null;
          metadata?: Json;
          resource?: string | null;
          resource_id?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string;
          id?: string;
          ip?: string | null;
          metadata?: Json;
          resource?: string | null;
          resource_id?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      afastamentos: {
        Row: {
          cid: string | null;
          colaborador_id: string;
          created_at: string;
          data_fim: string;
          data_inicio: string;
          id: string;
          motivo: string | null;
          status: string;
          tipo: string;
          updated_at: string;
        };
        Insert: {
          cid?: string | null;
          colaborador_id: string;
          created_at?: string;
          data_fim: string;
          data_inicio: string;
          id?: string;
          motivo?: string | null;
          status?: string;
          tipo?: string;
          updated_at?: string;
        };
        Update: {
          cid?: string | null;
          colaborador_id?: string;
          created_at?: string;
          data_fim?: string;
          data_inicio?: string;
          id?: string;
          motivo?: string | null;
          status?: string;
          tipo?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "afastamentos_colaborador_id_fkey";
            columns: ["colaborador_id"];
            isOneToOne: false;
            referencedRelation: "colaboradores";
            referencedColumns: ["id"];
          },
        ];
      };
      appointments: {
        Row: {
          address: string | null;
          created_at: string;
          description: string | null;
          duration_minutes: number;
          id: string;
          patient_id: string;
          price_cents: number | null;
          professional_id: string | null;
          scheduled_at: string;
          status: Database["public"]["Enums"]["appointment_status"];
          title: string;
          type: Database["public"]["Enums"]["appointment_type"];
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          created_at?: string;
          description?: string | null;
          duration_minutes?: number;
          id?: string;
          patient_id: string;
          price_cents?: number | null;
          professional_id?: string | null;
          scheduled_at: string;
          status?: Database["public"]["Enums"]["appointment_status"];
          title: string;
          type?: Database["public"]["Enums"]["appointment_type"];
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          created_at?: string;
          description?: string | null;
          duration_minutes?: number;
          id?: string;
          patient_id?: string;
          price_cents?: number | null;
          professional_id?: string | null;
          scheduled_at?: string;
          status?: Database["public"]["Enums"]["appointment_status"];
          title?: string;
          type?: Database["public"]["Enums"]["appointment_type"];
          updated_at?: string;
        };
        Relationships: [];
      };
      attendances: {
        Row: {
          appointment_id: string | null;
          check_in_at: string;
          check_in_lat: number | null;
          check_in_lng: number | null;
          check_out_at: string | null;
          check_out_lat: number | null;
          check_out_lng: number | null;
          cliente_id: string | null;
          created_at: string;
          duration_minutes: number | null;
          id: string;
          patient_id: string | null;
          procedures: Json;
          professional_id: string;
          report: string | null;
          service_call_id: string | null;
          status: string;
          updated_at: string;
          vital_signs: Json;
        };
        Insert: {
          appointment_id?: string | null;
          check_in_at?: string;
          check_in_lat?: number | null;
          check_in_lng?: number | null;
          check_out_at?: string | null;
          check_out_lat?: number | null;
          check_out_lng?: number | null;
          cliente_id?: string | null;
          created_at?: string;
          duration_minutes?: number | null;
          id?: string;
          patient_id?: string | null;
          procedures?: Json;
          professional_id: string;
          report?: string | null;
          service_call_id?: string | null;
          status?: string;
          updated_at?: string;
          vital_signs?: Json;
        };
        Update: {
          appointment_id?: string | null;
          check_in_at?: string;
          check_in_lat?: number | null;
          check_in_lng?: number | null;
          check_out_at?: string | null;
          check_out_lat?: number | null;
          check_out_lng?: number | null;
          cliente_id?: string | null;
          created_at?: string;
          duration_minutes?: number | null;
          id?: string;
          patient_id?: string | null;
          procedures?: Json;
          professional_id?: string;
          report?: string | null;
          service_call_id?: string | null;
          status?: string;
          updated_at?: string;
          vital_signs?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "attendances_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendances_cliente_id_fkey";
            columns: ["cliente_id"];
            isOneToOne: false;
            referencedRelation: "clientes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendances_cliente_id_fkey";
            columns: ["cliente_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendances_service_call_id_fkey";
            columns: ["service_call_id"];
            isOneToOne: false;
            referencedRelation: "service_calls";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          actor_id: string | null;
          after_data: Json | null;
          before_data: Json | null;
          created_at: string;
          id: string;
          operation: string;
          record_id: string | null;
          table_name: string;
        };
        Insert: {
          actor_id?: string | null;
          after_data?: Json | null;
          before_data?: Json | null;
          created_at?: string;
          id?: string;
          operation: string;
          record_id?: string | null;
          table_name: string;
        };
        Update: {
          actor_id?: string | null;
          after_data?: Json | null;
          before_data?: Json | null;
          created_at?: string;
          id?: string;
          operation?: string;
          record_id?: string | null;
          table_name?: string;
        };
        Relationships: [];
      };
      avaliacoes: {
        Row: {
          appointment_id: string | null;
          cliente_id: string;
          comentario: string | null;
          created_at: string;
          id: string;
          nota: number;
          profissional_id: string;
          service_call_id: string | null;
          updated_at: string;
        };
        Insert: {
          appointment_id?: string | null;
          cliente_id: string;
          comentario?: string | null;
          created_at?: string;
          id?: string;
          nota: number;
          profissional_id: string;
          service_call_id?: string | null;
          updated_at?: string;
        };
        Update: {
          appointment_id?: string | null;
          cliente_id?: string;
          comentario?: string | null;
          created_at?: string;
          id?: string;
          nota?: number;
          profissional_id?: string;
          service_call_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "avaliacoes_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "avaliacoes_service_call_id_fkey";
            columns: ["service_call_id"];
            isOneToOne: false;
            referencedRelation: "service_calls";
            referencedColumns: ["id"];
          },
        ];
      };
      avaliacoes_funcionarios: {
        Row: {
          avaliador_id: string;
          colaborador_id: string;
          comentarios: string | null;
          created_at: string;
          id: string;
          nota: number;
          periodo: string;
          pontos_fortes: string | null;
          pontos_melhoria: string | null;
          updated_at: string;
        };
        Insert: {
          avaliador_id: string;
          colaborador_id: string;
          comentarios?: string | null;
          created_at?: string;
          id?: string;
          nota: number;
          periodo: string;
          pontos_fortes?: string | null;
          pontos_melhoria?: string | null;
          updated_at?: string;
        };
        Update: {
          avaliador_id?: string;
          colaborador_id?: string;
          comentarios?: string | null;
          created_at?: string;
          id?: string;
          nota?: number;
          periodo?: string;
          pontos_fortes?: string | null;
          pontos_melhoria?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "avaliacoes_funcionarios_avaliador_id_fkey";
            columns: ["avaliador_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "avaliacoes_funcionarios_colaborador_id_fkey";
            columns: ["colaborador_id"];
            isOneToOne: false;
            referencedRelation: "colaboradores";
            referencedColumns: ["id"];
          },
        ];
      };
      backups: {
        Row: {
          created_at: string;
          created_by: string | null;
          file_path: string | null;
          id: string;
          kind: string;
          label: string;
          size_bytes: number | null;
          status: string;
          tables_included: string[];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          file_path?: string | null;
          id?: string;
          kind?: string;
          label: string;
          size_bytes?: number | null;
          status?: string;
          tables_included?: string[];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          file_path?: string | null;
          id?: string;
          kind?: string;
          label?: string;
          size_bytes?: number | null;
          status?: string;
          tables_included?: string[];
          updated_at?: string;
        };
        Relationships: [];
      };
      banco_horas: {
        Row: {
          colaborador_id: string;
          created_at: string;
          data: string;
          horas: number;
          id: string;
          motivo: string | null;
          saldo_atual: number;
          tipo: string;
          updated_at: string;
        };
        Insert: {
          colaborador_id: string;
          created_at?: string;
          data?: string;
          horas?: number;
          id?: string;
          motivo?: string | null;
          saldo_atual?: number;
          tipo?: string;
          updated_at?: string;
        };
        Update: {
          colaborador_id?: string;
          created_at?: string;
          data?: string;
          horas?: number;
          id?: string;
          motivo?: string | null;
          saldo_atual?: number;
          tipo?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "banco_horas_colaborador_id_fkey";
            columns: ["colaborador_id"];
            isOneToOne: false;
            referencedRelation: "colaboradores";
            referencedColumns: ["id"];
          },
        ];
      };
      call_offers: {
        Row: {
          call_id: string;
          created_at: string;
          id: string;
          professional_id: string;
          responded_at: string | null;
          status: Database["public"]["Enums"]["call_offer_status"];
        };
        Insert: {
          call_id: string;
          created_at?: string;
          id?: string;
          professional_id: string;
          responded_at?: string | null;
          status?: Database["public"]["Enums"]["call_offer_status"];
        };
        Update: {
          call_id?: string;
          created_at?: string;
          id?: string;
          professional_id?: string;
          responded_at?: string | null;
          status?: Database["public"]["Enums"]["call_offer_status"];
        };
        Relationships: [
          {
            foreignKeyName: "call_offers_call_id_fkey";
            columns: ["call_id"];
            isOneToOne: false;
            referencedRelation: "service_calls";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          created_at: string;
          description: string | null;
          icon: string | null;
          id: string;
          is_active: boolean;
          name: string;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      comissoes: {
        Row: {
          appointment_id: string | null;
          created_at: string;
          id: string;
          pago_em: string | null;
          percentual: number;
          profissional_id: string;
          service_call_id: string | null;
          status: string;
          updated_at: string;
          valor_base_cents: number;
          valor_comissao_cents: number;
        };
        Insert: {
          appointment_id?: string | null;
          created_at?: string;
          id?: string;
          pago_em?: string | null;
          percentual?: number;
          profissional_id: string;
          service_call_id?: string | null;
          status?: string;
          updated_at?: string;
          valor_base_cents?: number;
          valor_comissao_cents?: number;
        };
        Update: {
          appointment_id?: string | null;
          created_at?: string;
          id?: string;
          pago_em?: string | null;
          percentual?: number;
          profissional_id?: string;
          service_call_id?: string | null;
          status?: string;
          updated_at?: string;
          valor_base_cents?: number;
          valor_comissao_cents?: number;
        };
        Relationships: [];
      };
      convenios: {
        Row: {
          created_at: string;
          desconto_percentual: number;
          email: string | null;
          id: string;
          is_active: boolean;
          nome: string;
          observacoes: string | null;
          registro_ans: string | null;
          telefone: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          desconto_percentual?: number;
          email?: string | null;
          id?: string;
          is_active?: boolean;
          nome: string;
          observacoes?: string | null;
          registro_ans?: string | null;
          telefone?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          desconto_percentual?: number;
          email?: string | null;
          id?: string;
          is_active?: boolean;
          nome?: string;
          observacoes?: string | null;
          registro_ans?: string | null;
          telefone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      cupons: {
        Row: {
          codigo: string;
          created_at: string;
          descricao: string | null;
          id: string;
          is_active: boolean;
          limite_uso: number | null;
          tipo_desconto: string;
          updated_at: string;
          usos: number;
          valido_ate: string | null;
          valido_de: string | null;
          valor_desconto: number;
        };
        Insert: {
          codigo: string;
          created_at?: string;
          descricao?: string | null;
          id?: string;
          is_active?: boolean;
          limite_uso?: number | null;
          tipo_desconto?: string;
          updated_at?: string;
          usos?: number;
          valido_ate?: string | null;
          valido_de?: string | null;
          valor_desconto?: number;
        };
        Update: {
          codigo?: string;
          created_at?: string;
          descricao?: string | null;
          id?: string;
          is_active?: boolean;
          limite_uso?: number | null;
          tipo_desconto?: string;
          updated_at?: string;
          usos?: number;
          valido_ate?: string | null;
          valido_de?: string | null;
          valor_desconto?: number;
        };
        Relationships: [];
      };
      cliente_enderecos: {
        Row: {
          bairro: string | null;
          cep: string | null;
          cidade: string | null;
          cliente_id: string;
          complemento: string | null;
          created_at: string;
          estado: string | null;
          id: string;
          is_primary: boolean;
          label: string | null;
          lat: number | null;
          lng: number | null;
          logradouro: string | null;
          numero: string | null;
          referencia: string | null;
          updated_at: string;
        };
        Insert: {
          bairro?: string | null;
          cep?: string | null;
          cidade?: string | null;
          cliente_id: string;
          complemento?: string | null;
          created_at?: string;
          estado?: string | null;
          id?: string;
          is_primary?: boolean;
          label?: string | null;
          lat?: number | null;
          lng?: number | null;
          logradouro?: string | null;
          numero?: string | null;
          referencia?: string | null;
          updated_at?: string;
        };
        Update: {
          bairro?: string | null;
          cep?: string | null;
          cidade?: string | null;
          cliente_id?: string;
          complemento?: string | null;
          created_at?: string;
          estado?: string | null;
          id?: string;
          is_primary?: boolean;
          label?: string | null;
          lat?: number | null;
          lng?: number | null;
          logradouro?: string | null;
          numero?: string | null;
          referencia?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cliente_enderecos_cliente_id_fkey";
            columns: ["cliente_id"];
            isOneToOne: false;
            referencedRelation: "clientes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cliente_enderecos_cliente_id_fkey";
            columns: ["cliente_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
        ];
      };
      cliente_responsaveis: {
        Row: {
          cliente_id: string;
          cpf: string | null;
          created_at: string;
          email: string | null;
          full_name: string;
          id: string;
          is_financeiro: boolean;
          parentesco: string | null;
          phone: string | null;
          pode_agendar: boolean;
          pode_visualizar: boolean;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          cliente_id: string;
          cpf?: string | null;
          created_at?: string;
          email?: string | null;
          full_name: string;
          id?: string;
          is_financeiro?: boolean;
          parentesco?: string | null;
          phone?: string | null;
          pode_agendar?: boolean;
          pode_visualizar?: boolean;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          cliente_id?: string;
          cpf?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string;
          id?: string;
          is_financeiro?: boolean;
          parentesco?: string | null;
          phone?: string | null;
          pode_agendar?: boolean;
          pode_visualizar?: boolean;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "cliente_responsaveis_cliente_id_fkey";
            columns: ["cliente_id"];
            isOneToOne: false;
            referencedRelation: "clientes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cliente_responsaveis_cliente_id_fkey";
            columns: ["cliente_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
        ];
      };
      clientes: {
        Row: {
          alergias: string | null;
          avatar_url: string | null;
          birth_date: string | null;
          cid: string | null;
          convenio: string | null;
          convenio_numero: string | null;
          cpf: string | null;
          created_at: string;
          created_by: string;
          diagnostico: string | null;
          email: string | null;
          emergencia_nome: string | null;
          emergencia_telefone: string | null;
          full_name: string;
          id: string;
          medicamentos_uso: string | null;
          mobilidade: string | null;
          observacoes: string | null;
          phone: string | null;
          profile_id: string | null;
          rg: string | null;
          sexo: Database["public"]["Enums"]["cliente_sexo"];
          social_name: string | null;
          status: Database["public"]["Enums"]["cliente_status"];
          updated_at: string;
        };
        Insert: {
          alergias?: string | null;
          avatar_url?: string | null;
          birth_date?: string | null;
          cid?: string | null;
          convenio?: string | null;
          convenio_numero?: string | null;
          cpf?: string | null;
          created_at?: string;
          created_by: string;
          diagnostico?: string | null;
          email?: string | null;
          emergencia_nome?: string | null;
          emergencia_telefone?: string | null;
          full_name: string;
          id?: string;
          medicamentos_uso?: string | null;
          mobilidade?: string | null;
          observacoes?: string | null;
          phone?: string | null;
          profile_id?: string | null;
          rg?: string | null;
          sexo?: Database["public"]["Enums"]["cliente_sexo"];
          social_name?: string | null;
          status?: Database["public"]["Enums"]["cliente_status"];
          updated_at?: string;
        };
        Update: {
          alergias?: string | null;
          avatar_url?: string | null;
          birth_date?: string | null;
          cid?: string | null;
          convenio?: string | null;
          convenio_numero?: string | null;
          cpf?: string | null;
          created_at?: string;
          created_by?: string;
          diagnostico?: string | null;
          email?: string | null;
          emergencia_nome?: string | null;
          emergencia_telefone?: string | null;
          full_name?: string;
          id?: string;
          medicamentos_uso?: string | null;
          mobilidade?: string | null;
          observacoes?: string | null;
          phone?: string | null;
          profile_id?: string | null;
          rg?: string | null;
          sexo?: Database["public"]["Enums"]["cliente_sexo"];
          social_name?: string | null;
          status?: Database["public"]["Enums"]["cliente_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "clientes_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      colaboradores: {
        Row: {
          carga_horaria: string | null;
          cargo: string | null;
          created_at: string;
          data_admissao: string | null;
          data_demissao: string | null;
          departamento: string | null;
          email: string | null;
          full_name: string;
          id: string;
          observacoes: string | null;
          phone: string | null;
          salario: number | null;
          status: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          carga_horaria?: string | null;
          cargo?: string | null;
          created_at?: string;
          data_admissao?: string | null;
          data_demissao?: string | null;
          departamento?: string | null;
          email?: string | null;
          full_name: string;
          id?: string;
          observacoes?: string | null;
          phone?: string | null;
          salario?: number | null;
          status?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          carga_horaria?: string | null;
          cargo?: string | null;
          created_at?: string;
          data_admissao?: string | null;
          data_demissao?: string | null;
          departamento?: string | null;
          email?: string | null;
          full_name?: string;
          id?: string;
          observacoes?: string | null;
          phone?: string | null;
          salario?: number | null;
          status?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      contratos: {
        Row: {
          clausulas: string | null;
          cliente_id: string | null;
          created_at: string;
          data_fim: string | null;
          data_inicio: string | null;
          id: string;
          observacoes: string | null;
          profissional_id: string | null;
          status: string;
          title: string;
          type: string;
          updated_at: string;
          valor: number | null;
        };
        Insert: {
          clausulas?: string | null;
          cliente_id?: string | null;
          created_at?: string;
          data_fim?: string | null;
          data_inicio?: string | null;
          id?: string;
          observacoes?: string | null;
          profissional_id?: string | null;
          status?: string;
          title: string;
          type?: string;
          updated_at?: string;
          valor?: number | null;
        };
        Update: {
          clausulas?: string | null;
          cliente_id?: string | null;
          created_at?: string;
          data_fim?: string | null;
          data_inicio?: string | null;
          id?: string;
          observacoes?: string | null;
          profissional_id?: string | null;
          status?: string;
          title?: string;
          type?: string;
          updated_at?: string;
          valor?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "contratos_cliente_id_fkey";
            columns: ["cliente_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contratos_profissional_id_fkey";
            columns: ["profissional_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      conversation_participants: {
        Row: {
          conversation_id: string;
          joined_at: string;
          user_id: string;
        };
        Insert: {
          conversation_id: string;
          joined_at?: string;
          user_id: string;
        };
        Update: {
          conversation_id?: string;
          joined_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
        ];
      };
      conversations: {
        Row: {
          created_at: string;
          created_by: string | null;
          id: string;
          last_message_at: string | null;
          title: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          last_message_at?: string | null;
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          last_message_at?: string | null;
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      crm_clientes: {
        Row: {
          cidade: string | null;
          created_at: string;
          created_by: string | null;
          email: string | null;
          full_name: string;
          id: string;
          notas: string | null;
          origem: string | null;
          phone: string | null;
          responsavel: string | null;
          stage: string;
          ultimo_contato: string | null;
          updated_at: string;
          valor_estimado: number | null;
        };
        Insert: {
          cidade?: string | null;
          created_at?: string;
          created_by?: string | null;
          email?: string | null;
          full_name: string;
          id?: string;
          notas?: string | null;
          origem?: string | null;
          phone?: string | null;
          responsavel?: string | null;
          stage?: string;
          ultimo_contato?: string | null;
          updated_at?: string;
          valor_estimado?: number | null;
        };
        Update: {
          cidade?: string | null;
          created_at?: string;
          created_by?: string | null;
          email?: string | null;
          full_name?: string;
          id?: string;
          notas?: string | null;
          origem?: string | null;
          phone?: string | null;
          responsavel?: string | null;
          stage?: string;
          ultimo_contato?: string | null;
          updated_at?: string;
          valor_estimado?: number | null;
        };
        Relationships: [];
      };
      disponibilidade_profissional: {
        Row: {
          atende_domicilio: boolean;
          atende_teleconsulta: boolean;
          ativo: boolean;
          created_at: string;
          dia_semana: number;
          hora_fim: string;
          hora_inicio: string;
          id: string;
          profissional_id: string;
          updated_at: string;
        };
        Insert: {
          atende_domicilio?: boolean;
          atende_teleconsulta?: boolean;
          ativo?: boolean;
          created_at?: string;
          dia_semana: number;
          hora_fim: string;
          hora_inicio: string;
          id?: string;
          profissional_id: string;
          updated_at?: string;
        };
        Update: {
          atende_domicilio?: boolean;
          atende_teleconsulta?: boolean;
          ativo?: boolean;
          created_at?: string;
          dia_semana?: number;
          hora_fim?: string;
          hora_inicio?: string;
          id?: string;
          profissional_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      escalas: {
        Row: {
          colaborador_id: string;
          created_at: string;
          dia_semana: number;
          hora_fim: string;
          hora_inicio: string;
          id: string;
          tipo: string;
          updated_at: string;
        };
        Insert: {
          colaborador_id: string;
          created_at?: string;
          dia_semana: number;
          hora_fim: string;
          hora_inicio: string;
          id?: string;
          tipo?: string;
          updated_at?: string;
        };
        Update: {
          colaborador_id?: string;
          created_at?: string;
          dia_semana?: number;
          hora_fim?: string;
          hora_inicio?: string;
          id?: string;
          tipo?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "escalas_colaborador_id_fkey";
            columns: ["colaborador_id"];
            isOneToOne: false;
            referencedRelation: "colaboradores";
            referencedColumns: ["id"];
          },
        ];
      };
      especialidades: {
        Row: {
          categoria: Database["public"]["Enums"]["professional_category"];
          created_at: string;
          descricao: string | null;
          id: string;
          is_active: boolean;
          nome: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          categoria: Database["public"]["Enums"]["professional_category"];
          created_at?: string;
          descricao?: string | null;
          id?: string;
          is_active?: boolean;
          nome: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          categoria?: Database["public"]["Enums"]["professional_category"];
          created_at?: string;
          descricao?: string | null;
          id?: string;
          is_active?: boolean;
          nome?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      evaluations: {
        Row: {
          appointment_id: string | null;
          attendance_id: string | null;
          author_id: string;
          comment: string | null;
          created_at: string;
          id: string;
          is_public: boolean;
          rating: number;
          service_call_id: string | null;
          target_user_id: string | null;
          updated_at: string;
        };
        Insert: {
          appointment_id?: string | null;
          attendance_id?: string | null;
          author_id: string;
          comment?: string | null;
          created_at?: string;
          id?: string;
          is_public?: boolean;
          rating: number;
          service_call_id?: string | null;
          target_user_id?: string | null;
          updated_at?: string;
        };
        Update: {
          appointment_id?: string | null;
          attendance_id?: string | null;
          author_id?: string;
          comment?: string | null;
          created_at?: string;
          id?: string;
          is_public?: boolean;
          rating?: number;
          service_call_id?: string | null;
          target_user_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "evaluations_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "evaluations_attendance_id_fkey";
            columns: ["attendance_id"];
            isOneToOne: false;
            referencedRelation: "attendances";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "evaluations_service_call_id_fkey";
            columns: ["service_call_id"];
            isOneToOne: false;
            referencedRelation: "service_calls";
            referencedColumns: ["id"];
          },
        ];
      };
      ferias: {
        Row: {
          colaborador_id: string;
          created_at: string;
          data_fim: string;
          data_inicio: string;
          dias: number;
          id: string;
          observacoes: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          colaborador_id: string;
          created_at?: string;
          data_fim: string;
          data_inicio: string;
          dias?: number;
          id?: string;
          observacoes?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          colaborador_id?: string;
          created_at?: string;
          data_fim?: string;
          data_inicio?: string;
          dias?: number;
          id?: string;
          observacoes?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ferias_colaborador_id_fkey";
            columns: ["colaborador_id"];
            isOneToOne: false;
            referencedRelation: "colaboradores";
            referencedColumns: ["id"];
          },
        ];
      };
      folha_pagamento: {
        Row: {
          colaborador_id: string;
          created_at: string;
          data_pagamento: string | null;
          descontos: number | null;
          id: string;
          mes_referencia: string;
          salario_bruto: number | null;
          salario_liquido: number | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          colaborador_id: string;
          created_at?: string;
          data_pagamento?: string | null;
          descontos?: number | null;
          id?: string;
          mes_referencia: string;
          salario_bruto?: number | null;
          salario_liquido?: number | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          colaborador_id?: string;
          created_at?: string;
          data_pagamento?: string | null;
          descontos?: number | null;
          id?: string;
          mes_referencia?: string;
          salario_bruto?: number | null;
          salario_liquido?: number | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "folha_pagamento_colaborador_id_fkey";
            columns: ["colaborador_id"];
            isOneToOne: false;
            referencedRelation: "colaboradores";
            referencedColumns: ["id"];
          },
        ];
      };
      health_records: {
        Row: {
          attachment_url: string | null;
          author_id: string | null;
          category: Database["public"]["Enums"]["health_record_category"];
          content: string | null;
          created_at: string;
          data: Json | null;
          id: string;
          patient_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          attachment_url?: string | null;
          author_id?: string | null;
          category: Database["public"]["Enums"]["health_record_category"];
          content?: string | null;
          created_at?: string;
          data?: Json | null;
          id?: string;
          patient_id: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          attachment_url?: string | null;
          author_id?: string | null;
          category?: Database["public"]["Enums"]["health_record_category"];
          content?: string | null;
          created_at?: string;
          data?: Json | null;
          id?: string;
          patient_id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          content: string;
          conversation_id: string;
          created_at: string;
          id: string;
          sender_id: string;
        };
        Insert: {
          content: string;
          conversation_id: string;
          created_at?: string;
          id?: string;
          sender_id: string;
        };
        Update: {
          content?: string;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          sender_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
        ];
      };
      notification_settings: {
        Row: {
          created_at: string;
          email_enabled: boolean;
          event_type: string;
          id: string;
          in_app_enabled: boolean;
          push_enabled: boolean;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          email_enabled?: boolean;
          event_type: string;
          id?: string;
          in_app_enabled?: boolean;
          push_enabled?: boolean;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          email_enabled?: boolean;
          event_type?: string;
          id?: string;
          in_app_enabled?: boolean;
          push_enabled?: boolean;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          created_at: string;
          data: Json;
          id: string;
          link: string | null;
          message: string | null;
          read: boolean;
          title: string;
          type: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          data?: Json;
          id?: string;
          link?: string | null;
          message?: string | null;
          read?: boolean;
          title: string;
          type?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          data?: Json;
          id?: string;
          link?: string | null;
          message?: string | null;
          read?: boolean;
          title?: string;
          type?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      pagamentos: {
        Row: {
          cliente_id: string;
          contrato_id: string | null;
          created_at: string;
          data_pagamento: string | null;
          descricao: string;
          id: string;
          metodo: string | null;
          status: string;
          updated_at: string;
          valor: number;
          vencimento: string | null;
        };
        Insert: {
          cliente_id: string;
          contrato_id?: string | null;
          created_at?: string;
          data_pagamento?: string | null;
          descricao: string;
          id?: string;
          metodo?: string | null;
          status?: string;
          updated_at?: string;
          valor?: number;
          vencimento?: string | null;
        };
        Update: {
          cliente_id?: string;
          contrato_id?: string | null;
          created_at?: string;
          data_pagamento?: string | null;
          descricao?: string;
          id?: string;
          metodo?: string | null;
          status?: string;
          updated_at?: string;
          valor?: number;
          vencimento?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "pagamentos_contrato_id_fkey";
            columns: ["contrato_id"];
            isOneToOne: false;
            referencedRelation: "contratos";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          amount_cents: number;
          appointment_id: string | null;
          created_at: string;
          external_id: string | null;
          fee_cents: number;
          id: string;
          method: string;
          net_cents: number | null;
          paid_at: string | null;
          payee_id: string | null;
          payer_id: string;
          receipt_path: string | null;
          service_call_id: string | null;
          status: string;
          transaction_id: string | null;
          updated_at: string;
        };
        Insert: {
          amount_cents: number;
          appointment_id?: string | null;
          created_at?: string;
          external_id?: string | null;
          fee_cents?: number;
          id?: string;
          method?: string;
          net_cents?: number | null;
          paid_at?: string | null;
          payee_id?: string | null;
          payer_id: string;
          receipt_path?: string | null;
          service_call_id?: string | null;
          status?: string;
          transaction_id?: string | null;
          updated_at?: string;
        };
        Update: {
          amount_cents?: number;
          appointment_id?: string | null;
          created_at?: string;
          external_id?: string | null;
          fee_cents?: number;
          id?: string;
          method?: string;
          net_cents?: number | null;
          paid_at?: string | null;
          payee_id?: string | null;
          payer_id?: string;
          receipt_path?: string | null;
          service_call_id?: string | null;
          status?: string;
          transaction_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_service_call_id_fkey";
            columns: ["service_call_id"];
            isOneToOne: false;
            referencedRelation: "service_calls";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_transaction_id_fkey";
            columns: ["transaction_id"];
            isOneToOne: false;
            referencedRelation: "transactions";
            referencedColumns: ["id"];
          },
        ];
      };
      permission_groups: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      permissions: {
        Row: {
          action: string;
          created_at: string;
          description: string | null;
          group_id: string | null;
          id: string;
          key: string;
          resource: string;
          updated_at: string;
        };
        Insert: {
          action: string;
          created_at?: string;
          description?: string | null;
          group_id?: string | null;
          id?: string;
          key: string;
          resource: string;
          updated_at?: string;
        };
        Update: {
          action?: string;
          created_at?: string;
          description?: string | null;
          group_id?: string | null;
          id?: string;
          key?: string;
          resource?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "permissions_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "permission_groups";
            referencedColumns: ["id"];
          },
        ];
      };
      planos_de_cuidado: {
        Row: {
          author_id: string | null;
          cliente_id: string;
          created_at: string;
          cuidados: Json;
          fim: string | null;
          frequencia: string | null;
          id: string;
          inicio: string | null;
          objetivo: string | null;
          status: Database["public"]["Enums"]["plano_cuidado_status"];
          titulo: string;
          updated_at: string;
        };
        Insert: {
          author_id?: string | null;
          cliente_id: string;
          created_at?: string;
          cuidados?: Json;
          fim?: string | null;
          frequencia?: string | null;
          id?: string;
          inicio?: string | null;
          objetivo?: string | null;
          status?: Database["public"]["Enums"]["plano_cuidado_status"];
          titulo: string;
          updated_at?: string;
        };
        Update: {
          author_id?: string | null;
          cliente_id?: string;
          created_at?: string;
          cuidados?: Json;
          fim?: string | null;
          frequencia?: string | null;
          id?: string;
          inicio?: string | null;
          objetivo?: string | null;
          status?: Database["public"]["Enums"]["plano_cuidado_status"];
          titulo?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "planos_de_cuidado_cliente_id_fkey";
            columns: ["cliente_id"];
            isOneToOne: false;
            referencedRelation: "clientes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "planos_de_cuidado_cliente_id_fkey";
            columns: ["cliente_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
        ];
      };
      plans: {
        Row: {
          created_at: string;
          description: string | null;
          features: Json;
          id: string;
          interval: string;
          is_active: boolean;
          name: string;
          price_cents: number;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          features?: Json;
          id?: string;
          interval?: string;
          is_active?: boolean;
          name: string;
          price_cents?: number;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          features?: Json;
          id?: string;
          interval?: string;
          is_active?: boolean;
          name?: string;
          price_cents?: number;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      procedures: {
        Row: {
          allowed_categories: string[];
          base_price_cents: number;
          code: string;
          created_at: string;
          description: string | null;
          estimated_duration_minutes: number;
          group_label: string;
          is_active: boolean;
          name: string;
          requires_prescription: boolean;
          updated_at: string;
        };
        Insert: {
          allowed_categories?: string[];
          base_price_cents?: number;
          code: string;
          created_at?: string;
          description?: string | null;
          estimated_duration_minutes?: number;
          group_label: string;
          is_active?: boolean;
          name: string;
          requires_prescription?: boolean;
          updated_at?: string;
        };
        Update: {
          allowed_categories?: string[];
          base_price_cents?: number;
          code?: string;
          created_at?: string;
          description?: string | null;
          estimated_duration_minutes?: number;
          group_label?: string;
          is_active?: boolean;
          name?: string;
          requires_prescription?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          aceita_novos_pacientes: boolean;
          atende_teleconsulta: boolean;
          avatar_url: string | null;
          bio: string | null;
          category: Database["public"]["Enums"]["professional_category"] | null;
          cidade: string | null;
          city: string | null;
          council_number: string | null;
          created_at: string;
          estado: string | null;
          full_name: string | null;
          id: string;
          onboarding_completed: boolean;
          phone: string | null;
          preco_hora_cents: number | null;
          raio_atendimento_km: number;
          state: string | null;
          status: string;
          updated_at: string;
          verificado: boolean;
        };
        Insert: {
          aceita_novos_pacientes?: boolean;
          atende_teleconsulta?: boolean;
          avatar_url?: string | null;
          bio?: string | null;
          category?: Database["public"]["Enums"]["professional_category"] | null;
          cidade?: string | null;
          city?: string | null;
          council_number?: string | null;
          created_at?: string;
          estado?: string | null;
          full_name?: string | null;
          id: string;
          onboarding_completed?: boolean;
          phone?: string | null;
          preco_hora_cents?: number | null;
          raio_atendimento_km?: number;
          state?: string | null;
          status?: string;
          updated_at?: string;
          verificado?: boolean;
        };
        Update: {
          aceita_novos_pacientes?: boolean;
          atende_teleconsulta?: boolean;
          avatar_url?: string | null;
          bio?: string | null;
          category?: Database["public"]["Enums"]["professional_category"] | null;
          cidade?: string | null;
          city?: string | null;
          council_number?: string | null;
          created_at?: string;
          estado?: string | null;
          full_name?: string | null;
          id?: string;
          onboarding_completed?: boolean;
          phone?: string | null;
          preco_hora_cents?: number | null;
          raio_atendimento_km?: number;
          state?: string | null;
          status?: string;
          updated_at?: string;
          verificado?: boolean;
        };
        Relationships: [];
      };
      profiles_sensitive: {
        Row: {
          address: string | null;
          bairro: string | null;
          birth_date: string | null;
          cep: string | null;
          complemento: string | null;
          cpf: string | null;
          created_at: string;
          email: string | null;
          id: string;
          numero: string | null;
          observacoes: string | null;
          rg: string | null;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          bairro?: string | null;
          birth_date?: string | null;
          cep?: string | null;
          complemento?: string | null;
          cpf?: string | null;
          created_at?: string;
          email?: string | null;
          id: string;
          numero?: string | null;
          observacoes?: string | null;
          rg?: string | null;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          bairro?: string | null;
          birth_date?: string | null;
          cep?: string | null;
          complemento?: string | null;
          cpf?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          numero?: string | null;
          observacoes?: string | null;
          rg?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_sensitive_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profissional_documentos: {
        Row: {
          created_at: string;
          file_name: string | null;
          file_path: string;
          file_url: string | null;
          id: string;
          motivo_recusa: string | null;
          numero: string | null;
          observacoes: string | null;
          orgao_emissor: string | null;
          profissional_id: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: Database["public"]["Enums"]["documento_status"];
          tipo: Database["public"]["Enums"]["documento_tipo"];
          title: string | null;
          type: string | null;
          updated_at: string;
          validade: string | null;
        };
        Insert: {
          created_at?: string;
          file_name?: string | null;
          file_path: string;
          file_url?: string | null;
          id?: string;
          motivo_recusa?: string | null;
          numero?: string | null;
          observacoes?: string | null;
          orgao_emissor?: string | null;
          profissional_id: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: Database["public"]["Enums"]["documento_status"];
          tipo?: Database["public"]["Enums"]["documento_tipo"];
          title?: string | null;
          type?: string | null;
          updated_at?: string;
          validade?: string | null;
        };
        Update: {
          created_at?: string;
          file_name?: string | null;
          file_path?: string;
          file_url?: string | null;
          id?: string;
          motivo_recusa?: string | null;
          numero?: string | null;
          observacoes?: string | null;
          orgao_emissor?: string | null;
          profissional_id?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: Database["public"]["Enums"]["documento_status"];
          tipo?: Database["public"]["Enums"]["documento_tipo"];
          title?: string | null;
          type?: string | null;
          updated_at?: string;
          validade?: string | null;
        };
        Relationships: [];
      };
      profissional_especialidades: {
        Row: {
          anos_experiencia: number;
          created_at: string;
          especialidade_id: string;
          id: string;
          is_primary: boolean;
          observacoes: string | null;
          preco_hora_cents: number | null;
          profissional_id: string;
          updated_at: string;
        };
        Insert: {
          anos_experiencia?: number;
          created_at?: string;
          especialidade_id: string;
          id?: string;
          is_primary?: boolean;
          observacoes?: string | null;
          preco_hora_cents?: number | null;
          profissional_id: string;
          updated_at?: string;
        };
        Update: {
          anos_experiencia?: number;
          created_at?: string;
          especialidade_id?: string;
          id?: string;
          is_primary?: boolean;
          observacoes?: string | null;
          preco_hora_cents?: number | null;
          profissional_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profissional_especialidades_especialidade_id_fkey";
            columns: ["especialidade_id"];
            isOneToOne: false;
            referencedRelation: "especialidades";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profissional_especialidades_especialidade_id_fkey";
            columns: ["especialidade_id"];
            isOneToOne: false;
            referencedRelation: "specialties";
            referencedColumns: ["id"];
          },
        ];
      };
      quotes: {
        Row: {
          client_name: string | null;
          created_at: string;
          id: string;
          items: Json;
          notes: string | null;
          owner_id: string;
          patient_id: string | null;
          status: Database["public"]["Enums"]["quote_status"];
          title: string;
          total_cents: number;
          updated_at: string;
        };
        Insert: {
          client_name?: string | null;
          created_at?: string;
          id?: string;
          items?: Json;
          notes?: string | null;
          owner_id: string;
          patient_id?: string | null;
          status?: Database["public"]["Enums"]["quote_status"];
          title: string;
          total_cents?: number;
          updated_at?: string;
        };
        Update: {
          client_name?: string | null;
          created_at?: string;
          id?: string;
          items?: Json;
          notes?: string | null;
          owner_id?: string;
          patient_id?: string | null;
          status?: Database["public"]["Enums"]["quote_status"];
          title?: string;
          total_cents?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          created_at: string;
          file_path: string | null;
          filters: Json;
          id: string;
          kind: string;
          owner_id: string;
          period_end: string | null;
          period_start: string | null;
          result: Json;
          status: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          file_path?: string | null;
          filters?: Json;
          id?: string;
          kind?: string;
          owner_id: string;
          period_end?: string | null;
          period_start?: string | null;
          result?: Json;
          status?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          file_path?: string | null;
          filters?: Json;
          id?: string;
          kind?: string;
          owner_id?: string;
          period_end?: string | null;
          period_start?: string | null;
          result?: Json;
          status?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      role_permissions: {
        Row: {
          created_at: string;
          id: string;
          permission_id: string;
          role: Database["public"]["Enums"]["app_role"];
        };
        Insert: {
          created_at?: string;
          id?: string;
          permission_id: string;
          role: Database["public"]["Enums"]["app_role"];
        };
        Update: {
          created_at?: string;
          id?: string;
          permission_id?: string;
          role?: Database["public"]["Enums"]["app_role"];
        };
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey";
            columns: ["permission_id"];
            isOneToOne: false;
            referencedRelation: "permissions";
            referencedColumns: ["id"];
          },
        ];
      };
      roles: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          key: Database["public"]["Enums"]["app_role"];
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          key: Database["public"]["Enums"]["app_role"];
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          key?: Database["public"]["Enums"]["app_role"];
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      sae_evolutions: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          patient_id: string;
          procedures: Json;
          professional_id: string;
          sae_record_id: string;
          vital_signs: Json;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          patient_id: string;
          procedures?: Json;
          professional_id: string;
          sae_record_id: string;
          vital_signs?: Json;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          patient_id?: string;
          procedures?: Json;
          professional_id?: string;
          sae_record_id?: string;
          vital_signs?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "sae_evolutions_sae_record_id_fkey";
            columns: ["sae_record_id"];
            isOneToOne: false;
            referencedRelation: "sae_records";
            referencedColumns: ["id"];
          },
        ];
      };
      sae_records: {
        Row: {
          avaliacao: string | null;
          closed_at: string | null;
          created_at: string;
          diagnosticos: Json;
          historico: Json;
          id: string;
          opened_at: string;
          patient_id: string;
          planejamento: Json;
          prescricoes: Json;
          professional_id: string;
          status: Database["public"]["Enums"]["sae_status"];
          title: string;
          updated_at: string;
          vital_signs: Json;
        };
        Insert: {
          avaliacao?: string | null;
          closed_at?: string | null;
          created_at?: string;
          diagnosticos?: Json;
          historico?: Json;
          id?: string;
          opened_at?: string;
          patient_id: string;
          planejamento?: Json;
          prescricoes?: Json;
          professional_id: string;
          status?: Database["public"]["Enums"]["sae_status"];
          title: string;
          updated_at?: string;
          vital_signs?: Json;
        };
        Update: {
          avaliacao?: string | null;
          closed_at?: string | null;
          created_at?: string;
          diagnosticos?: Json;
          historico?: Json;
          id?: string;
          opened_at?: string;
          patient_id?: string;
          planejamento?: Json;
          prescricoes?: Json;
          professional_id?: string;
          status?: Database["public"]["Enums"]["sae_status"];
          title?: string;
          updated_at?: string;
          vital_signs?: Json;
        };
        Relationships: [];
      };
      sae_section_versions: {
        Row: {
          author_id: string;
          created_at: string;
          id: string;
          note: string | null;
          payload: Json;
          sae_record_id: string;
          section: Database["public"]["Enums"]["sae_section"];
          status: Database["public"]["Enums"]["sae_version_status"];
          version_number: number;
        };
        Insert: {
          author_id: string;
          created_at?: string;
          id?: string;
          note?: string | null;
          payload?: Json;
          sae_record_id: string;
          section: Database["public"]["Enums"]["sae_section"];
          status?: Database["public"]["Enums"]["sae_version_status"];
          version_number?: number;
        };
        Update: {
          author_id?: string;
          created_at?: string;
          id?: string;
          note?: string | null;
          payload?: Json;
          sae_record_id?: string;
          section?: Database["public"]["Enums"]["sae_section"];
          status?: Database["public"]["Enums"]["sae_version_status"];
          version_number?: number;
        };
        Relationships: [
          {
            foreignKeyName: "sae_section_versions_sae_record_id_fkey";
            columns: ["sae_record_id"];
            isOneToOne: false;
            referencedRelation: "sae_records";
            referencedColumns: ["id"];
          },
        ];
      };
      service_calls: {
        Row: {
          accepted_at: string | null;
          address: string;
          address_complement: string | null;
          cancel_reason: string | null;
          cancelled_at: string | null;
          completed_at: string | null;
          created_at: string;
          id: string;
          lat: number | null;
          lng: number | null;
          notes: string | null;
          patient_id: string;
          price_cents: number;
          procedure_code: string;
          professional_id: string | null;
          requester_id: string;
          scheduled_at: string | null;
          started_at: string | null;
          status: Database["public"]["Enums"]["service_call_status"];
          updated_at: string;
        };
        Insert: {
          accepted_at?: string | null;
          address: string;
          address_complement?: string | null;
          cancel_reason?: string | null;
          cancelled_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          lat?: number | null;
          lng?: number | null;
          notes?: string | null;
          patient_id: string;
          price_cents?: number;
          procedure_code: string;
          professional_id?: string | null;
          requester_id: string;
          scheduled_at?: string | null;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["service_call_status"];
          updated_at?: string;
        };
        Update: {
          accepted_at?: string | null;
          address?: string;
          address_complement?: string | null;
          cancel_reason?: string | null;
          cancelled_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          lat?: number | null;
          lng?: number | null;
          notes?: string | null;
          patient_id?: string;
          price_cents?: number;
          procedure_code?: string;
          professional_id?: string | null;
          requester_id?: string;
          scheduled_at?: string | null;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["service_call_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "service_calls_procedure_code_fkey";
            columns: ["procedure_code"];
            isOneToOne: false;
            referencedRelation: "procedures";
            referencedColumns: ["code"];
          },
        ];
      };
      settings: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          key: string;
          scope: string;
          updated_at: string;
          user_id: string | null;
          value: Json;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          key: string;
          scope?: string;
          updated_at?: string;
          user_id?: string | null;
          value?: Json;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          key?: string;
          scope?: string;
          updated_at?: string;
          user_id?: string | null;
          value?: Json;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          cancelled_at: string | null;
          created_at: string;
          current_period_end: string | null;
          external_id: string | null;
          id: string;
          plan_id: string;
          started_at: string;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          cancelled_at?: string | null;
          created_at?: string;
          current_period_end?: string | null;
          external_id?: string | null;
          id?: string;
          plan_id: string;
          started_at?: string;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          cancelled_at?: string | null;
          created_at?: string;
          current_period_end?: string | null;
          external_id?: string | null;
          id?: string;
          plan_id?: string;
          started_at?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
        ];
      };
      tickets: {
        Row: {
          assignee_id: string | null;
          category: string;
          closed_at: string | null;
          created_at: string;
          description: string | null;
          id: string;
          priority: string;
          requester_id: string;
          resolution: string | null;
          status: string;
          subject: string;
          updated_at: string;
        };
        Insert: {
          assignee_id?: string | null;
          category?: string;
          closed_at?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          priority?: string;
          requester_id: string;
          resolution?: string | null;
          status?: string;
          subject: string;
          updated_at?: string;
        };
        Update: {
          assignee_id?: string | null;
          category?: string;
          closed_at?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          priority?: string;
          requester_id?: string;
          resolution?: string | null;
          status?: string;
          subject?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          amount_cents: number;
          appointment_id: string | null;
          category_id: string | null;
          cliente_id: string | null;
          created_at: string;
          description: string;
          id: string;
          kind: string;
          metadata: Json;
          occurred_at: string;
          owner_id: string;
          service_call_id: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          amount_cents: number;
          appointment_id?: string | null;
          category_id?: string | null;
          cliente_id?: string | null;
          created_at?: string;
          description: string;
          id?: string;
          kind: string;
          metadata?: Json;
          occurred_at?: string;
          owner_id: string;
          service_call_id?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          amount_cents?: number;
          appointment_id?: string | null;
          category_id?: string | null;
          cliente_id?: string | null;
          created_at?: string;
          description?: string;
          id?: string;
          kind?: string;
          metadata?: Json;
          occurred_at?: string;
          owner_id?: string;
          service_call_id?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_cliente_id_fkey";
            columns: ["cliente_id"];
            isOneToOne: false;
            referencedRelation: "clientes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_cliente_id_fkey";
            columns: ["cliente_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_service_call_id_fkey";
            columns: ["service_call_id"];
            isOneToOne: false;
            referencedRelation: "service_calls";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      clients: {
        Row: {
          alergias: string | null;
          avatar_url: string | null;
          birth_date: string | null;
          cid: string | null;
          convenio: string | null;
          convenio_numero: string | null;
          cpf: string | null;
          created_at: string | null;
          created_by: string | null;
          diagnostico: string | null;
          email: string | null;
          emergencia_nome: string | null;
          emergencia_telefone: string | null;
          full_name: string | null;
          id: string | null;
          medicamentos_uso: string | null;
          mobilidade: string | null;
          observacoes: string | null;
          phone: string | null;
          profile_id: string | null;
          rg: string | null;
          sexo: Database["public"]["Enums"]["cliente_sexo"] | null;
          social_name: string | null;
          status: Database["public"]["Enums"]["cliente_status"] | null;
          updated_at: string | null;
        };
        Insert: {
          alergias?: string | null;
          avatar_url?: string | null;
          birth_date?: string | null;
          cid?: string | null;
          convenio?: string | null;
          convenio_numero?: string | null;
          cpf?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          diagnostico?: string | null;
          email?: string | null;
          emergencia_nome?: string | null;
          emergencia_telefone?: string | null;
          full_name?: string | null;
          id?: string | null;
          medicamentos_uso?: string | null;
          mobilidade?: string | null;
          observacoes?: string | null;
          phone?: string | null;
          profile_id?: string | null;
          rg?: string | null;
          sexo?: Database["public"]["Enums"]["cliente_sexo"] | null;
          social_name?: string | null;
          status?: Database["public"]["Enums"]["cliente_status"] | null;
          updated_at?: string | null;
        };
        Update: {
          alergias?: string | null;
          avatar_url?: string | null;
          birth_date?: string | null;
          cid?: string | null;
          convenio?: string | null;
          convenio_numero?: string | null;
          cpf?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          diagnostico?: string | null;
          email?: string | null;
          emergencia_nome?: string | null;
          emergencia_telefone?: string | null;
          full_name?: string | null;
          id?: string | null;
          medicamentos_uso?: string | null;
          mobilidade?: string | null;
          observacoes?: string | null;
          phone?: string | null;
          profile_id?: string | null;
          rg?: string | null;
          sexo?: Database["public"]["Enums"]["cliente_sexo"] | null;
          social_name?: string | null;
          status?: Database["public"]["Enums"]["cliente_status"] | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "clientes_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      specialties: {
        Row: {
          categoria: Database["public"]["Enums"]["professional_category"] | null;
          created_at: string | null;
          descricao: string | null;
          id: string | null;
          is_active: boolean | null;
          nome: string | null;
          slug: string | null;
          updated_at: string | null;
        };
        Insert: {
          categoria?: Database["public"]["Enums"]["professional_category"] | null;
          created_at?: string | null;
          descricao?: string | null;
          id?: string | null;
          is_active?: boolean | null;
          nome?: string | null;
          slug?: string | null;
          updated_at?: string | null;
        };
        Update: {
          categoria?: Database["public"]["Enums"]["professional_category"] | null;
          created_at?: string | null;
          descricao?: string | null;
          id?: string | null;
          is_active?: boolean | null;
          nome?: string | null;
          slug?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      start_direct_conversation: {
        Args: { _other_id: string };
        Returns: string;
      };
    };
    Enums: {
      app_role: "paciente" | "familiar" | "profissional" | "admin" | "cliente" | "executivo";
      appointment_status: "agendado" | "confirmado" | "concluido" | "cancelado";
      appointment_type: "domiciliar" | "teleconsulta" | "presencial";
      call_offer_status: "enviada" | "aceita" | "recusada" | "expirada";
      cliente_sexo: "feminino" | "masculino" | "outro" | "nao_informado";
      cliente_status: "ativo" | "inativo" | "em_avaliacao" | "alta";
      documento_status: "pendente" | "aprovado" | "recusado" | "assinado" | "rejeitado";
      documento_tipo:
        | "coren"
        | "crm"
        | "crp"
        | "crefito"
        | "crfa"
        | "crn"
        | "rg"
        | "cpf"
        | "diploma"
        | "certificado"
        | "comprovante_endereco"
        | "outro";
      health_record_category:
        "perfil_clinico" | "medicamento" | "vacina" | "sinais_vitais" | "exame" | "evolucao";
      plano_cuidado_status: "ativo" | "suspenso" | "encerrado";
      professional_category:
        | "enfermeiro"
        | "tecnico_enfermagem"
        | "medico"
        | "psicologo"
        | "fisioterapeuta"
        | "fonoaudiologo"
        | "nutricionista"
        | "terapeuta_ocupacional"
        | "cuidador"
        | "auxiliar_enfermagem";
      quote_status: "rascunho" | "enviado" | "aprovado" | "recusado";
      sae_section: "coleta" | "diagnosticos" | "planejamento" | "prescricoes" | "avaliacao";
      sae_status: "aberto" | "em_andamento" | "concluido" | "cancelado";
      sae_version_status: "rascunho" | "publicada";
      service_call_status:
        "buscando" | "aceita" | "a_caminho" | "em_atendimento" | "concluida" | "cancelada";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["paciente", "familiar", "profissional", "admin", "cliente", "executivo"],
      appointment_status: ["agendado", "confirmado", "concluido", "cancelado"],
      appointment_type: ["domiciliar", "teleconsulta", "presencial"],
      call_offer_status: ["enviada", "aceita", "recusada", "expirada"],
      cliente_sexo: ["feminino", "masculino", "outro", "nao_informado"],
      cliente_status: ["ativo", "inativo", "em_avaliacao", "alta"],
      documento_status: ["pendente", "aprovado", "recusado", "assinado", "rejeitado"],
      documento_tipo: [
        "coren",
        "crm",
        "crp",
        "crefito",
        "crfa",
        "crn",
        "rg",
        "cpf",
        "diploma",
        "certificado",
        "comprovante_endereco",
        "outro",
      ],
      health_record_category: [
        "perfil_clinico",
        "medicamento",
        "vacina",
        "sinais_vitais",
        "exame",
        "evolucao",
      ],
      plano_cuidado_status: ["ativo", "suspenso", "encerrado"],
      professional_category: [
        "enfermeiro",
        "tecnico_enfermagem",
        "medico",
        "psicologo",
        "fisioterapeuta",
        "fonoaudiologo",
        "nutricionista",
        "terapeuta_ocupacional",
        "cuidador",
        "auxiliar_enfermagem",
      ],
      quote_status: ["rascunho", "enviado", "aprovado", "recusado"],
      sae_section: ["coleta", "diagnosticos", "planejamento", "prescricoes", "avaliacao"],
      sae_status: ["aberto", "em_andamento", "concluido", "cancelado"],
      sae_version_status: ["rascunho", "publicada"],
      service_call_status: [
        "buscando",
        "aceita",
        "a_caminho",
        "em_atendimento",
        "concluida",
        "cancelada",
      ],
    },
  },
} as const;
