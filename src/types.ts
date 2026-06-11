/**
 * TypeScript types for the CNPJ querying app.
 */

export type ApiProvider = "auto" | "cnpj_ws" | "brasil_api";

export interface NormalizedSummary {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  situacao: string;
  situacaoData: string;
  enderecoCompleto: string;
  cidadeUf: string;
  cnaePrincipal: string; // code + description
  telefone: string;
  email: string;
  capitalSocial: string;
  inscricoesEstaduais: Array<{
    ie: string;
    uf: string;
    ativo: boolean;
  }>;
  sociosCount: number;
  dataInicioAtividade: string;
  regimeApuracao: string;
  naturezaJuridica: string;
  cnaeSecundarios: Array<string>;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  municipio: string;
  uf: string;
}

export interface VehicleData {
  placa: string;
  marca: string;
  modelo: string;
  ano: string;
  anoModelo: string;
  cor: string;
  situacao: string;
  municipio: string;
  uf: string;
  chassi: string;
  motor: string;
  combustivel: string;
  segmento: string;
}

