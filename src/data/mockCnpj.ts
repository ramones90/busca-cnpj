/**
 * Rich realistic mock files for sandbox & immediate offline UI testing of CNPJ parsing.
 */

export const MOCK_GOOGLE_BRASIL = {
  cnpj: "06990590000123",
  razao_social: "GOOGLE BRASIL INTERNET LIMITADA",
  natureza_juridica: {
    id: "2062",
    descricao: "Sociedade Empresária Limitada"
  },
  capital_social: "250000000.00",
  porte: {
    id: "05",
    descricao: "Demais"
  },
  ente_federativo_responsavel: null,
  socios: [
    {
      nome: "GOOGLE INTERNATIONAL LLC",
      tipo: "Pessoa Jurídica",
      qualificacao_socio: {
        id: "22",
        descricao: "Sócio"
      },
      data_entrada: "2004-12-07",
      pais: {
        id: "USA",
        nome: "Estados Unidos da América"
      }
    },
    {
      nome: "GOOGLE LLC",
      tipo: "Pessoa Jurídica",
      qualificacao_socio: {
        id: "22",
        descricao: "Sócio"
      },
      data_entrada: "2004-12-07",
      pais: {
        id: "USA",
        nome: "Estados Unidos da América"
      }
    },
    {
      nome: "FABIO COELHO",
      tipo: "Pessoa Física",
      qualificacao_socio: {
        id: "05",
        descricao: "Administrador"
      },
      data_entrada: "2011-01-14",
      pais: null
    }
  ],
  estabelecimento: {
    cnpj: "06990590000123",
    tipo: "Matriz",
    nome_fantasia: "GOOGLE BRASIL",
    situacao_cadastral: "Ativa",
    data_situacao_cadastral: "2004-12-07",
    motivo_situacao_cadastral: {
      id: "00",
      descricao: "Sem Motivo"
    },
    nome_cidade_exterior: null,
    tipo_logradouro: "Avenida",
    logradouro: "Brigadeiro Faria Lima",
    numero: "3477",
    complemento: "ANDAR 18 E 20 TORRE SUL",
    bairro: "Itaim Bibi",
    cep: "04538133",
    uf: "SP",
    ddd_telefone1: "11",
    telefone1: "23951000",
    ddd_telefone2: null,
    telefone2: null,
    ddd_fax: null,
    fax_numero: null,
    email: "legal-br@google.com",
    situacao_especial: null,
    data_situacao_especial: null,
    municipio: {
      id: "9701",
      nome: "SÃO PAULO",
      codigo_ibge: "3550308"
    },
    estado: {
      id: 25,
      nome: "São Paulo",
      sigla: "SP"
    },
    atividade_principal: {
      id: "6319400",
      codigo: "63.19-4-00",
      descricao: "Portais, provedores de conteúdo e outros serviços de informação na internet"
    },
    atividades_secundarias: [
      {
        id: "7311400",
        codigo: "73.11-4-00",
        descricao: "Agências de publicidade"
      },
      {
        id: "7319003",
        codigo: "73.19-0-03",
        descricao: "Marketing direto"
      },
      {
        id: "6204000",
        codigo: "62.04-0-00",
        descricao: "Consultoria em tecnologia da informação"
      },
      {
        id: "8599604",
        codigo: "85.99-6-04",
        descricao: "Treinamento em desenvolvimento profissional e gerencial"
      }
    ],
    inscricoes_estaduates: [], // empty or mock
    inscricoes_estaduais: [
      {
        inscricao_estadual: "148965823114",
        ativo: true,
        estado: {
          sigla: "SP"
        }
      },
      {
        inscricao_estadual: "298457102341",
        ativo: false,
        estado: {
          sigla: "SP"
        }
      }
    ]
  }
};

export const MOCK_PETROBRAS = {
  cnpj: "33000167000101",
  razao_social: "PETROLEO BRASILEIRO S.A. PETROBRAS",
  natureza_juridica: {
    id: "2011",
    descricao: "Empresa Pública"
  },
  capital_social: "205431960000.00",
  porte: {
    id: "05",
    descricao: "Demais"
  },
  ente_federativo_responsavel: "UNIÃO",
  socios: [
    {
      nome: "MAGDA CHAMBRIARD",
      tipo: "Pessoa Física",
      qualificacao_socio: {
        id: "05",
        descricao: "Presidente"
      },
      data_entrada: "2024-05-24",
      pais: null
    }
  ],
  estabelecimento: {
    cnpj: "33000167000101",
    tipo: "Matriz",
    nome_fantasia: "PETROBRAS CORREIO",
    situacao_cadastral: "Ativa",
    data_situacao_cadastral: "1966-08-16",
    motivo_situacao_cadastral: {
      id: "00",
      descricao: "Sem Motivo"
    },
    tipo_logradouro: "Avenida",
    logradouro: "República do Chile",
    numero: "65",
    complemento: "SALA 2001",
    bairro: "Centro",
    cep: "20031912",
    uf: "RJ",
    ddd_telefone1: "21",
    telefone1: "32244477",
    ddd_telefone2: null,
    telefone2: null,
    email: "servicos_petrobras@petrobras.com.br",
    situacao_especial: null,
    data_situacao_especial: null,
    municipio: {
      id: "6001",
      nome: "RIO DE JANEIRO",
      codigo_ibge: "3304557"
    },
    estado: {
      id: 19,
      nome: "Rio de Janeiro",
      sigla: "RJ"
    },
    atividade_principal: {
      id: "0610101",
      codigo: "06.10-1-01",
      descricao: "Extração de petróleo e gás natural"
    },
    atividades_secundarias: [
      {
        id: "1921700",
        codigo: "19.21-7-00",
        descricao: "Fabricação de produtos do refino de petróleo"
      }
    ],
    inscricoes_estaduais: [
      {
        inscricao_estadual: "80123456",
        ativo: true,
        estado: {
          sigla: "RJ"
        }
      }
    ]
  }
};

export const MOCK_BANCO_BRASIL = {
  cnpj: "00000000000191",
  razao_social: "BANCO DO BRASIL SA",
  natureza_juridica: {
    id: "2038",
    descricao: "Sociedade de Economia Mista"
  },
  capital_social: "90000000000.00",
  porte: {
    id: "05",
    descricao: "Demais"
  },
  socios: [
    {
      nome: "TARCISIANA MEDEIROS",
      tipo: "Pessoa Física",
      qualificacao_socio: {
        id: "05",
        descricao: "Presidente"
      },
      data_entrada: "2023-01-16",
      pais: null
    }
  ],
  estabelecimento: {
    cnpj: "00000000000191",
    tipo: "Matriz",
    nome_fantasia: "DIRECAO GERAL BB",
    situacao_cadastral: "Ativa",
    data_situacao_cadastral: "1966-08-01",
    tipo_logradouro: "Setor",
    logradouro: "SBN QUADRA 01 BLOCO G",
    numero: "31",
    complemento: "ED. SEDE III",
    bairro: "Asa Norte",
    cep: "70073901",
    uf: "DF",
    ddd_telefone1: "61",
    telefone1: "34931000",
    email: "secex-df@bb.com.br",
    municipio: {
      id: "9701",
      nome: "BRASILIA",
      codigo_ibge: "5300108"
    },
    estado: {
      id: 53,
      nome: "Distrito Federal",
      sigla: "DF"
    },
    atividade_principal: {
      id: "6421500",
      codigo: "64.21-5-00",
      descricao: "Bancos múltiplos, com carteira comercial"
    },
    inscricoes_estaduais: [
      {
        inscricao_estadual: "0730000100100",
        ativo: true,
        estado: {
          sigla: "DF"
        }
      }
    ]
  }
};
