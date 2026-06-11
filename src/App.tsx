import React, { useState, useEffect } from "react";
import { 
  Search, 
  Building2, 
  Layers, 
  XCircle, 
  History, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  Info, 
  Globe, 
  ArrowRight,
  Database,
  Trash2,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { formatCNPJ, cleanCNPJ } from "./utils/formatter";
import { normalizeCnpjData } from "./utils/normalizer";
import { NormalizedSummary, ApiProvider } from "./types";
import { CNPJSummary } from "./components/CNPJSummary";
import { DynamicDataExplorer } from "./components/DynamicDataExplorer";
import { 
  MOCK_GOOGLE_BRASIL, 
  MOCK_PETROBRAS, 
  MOCK_BANCO_BRASIL 
} from "./data/mockCnpj";

interface HistoryItem {
  cnpj: string;
  razaoSocial: string;
  situacao: string;
  timestamp: string;
  apiSource: string;
}


export default function App() {
  const [cnpjInput, setCnpjInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [stepLogs, setStepLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<ApiProvider>("auto");
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [queryResult, setQueryResult] = useState<any | null>(null);
  const [normalizedSummary, setNormalizedSummary] = useState<NormalizedSummary | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<"summary" | "explorer">("summary");

  // Name Search Configuration & State
  const [searchMode, setSearchMode] = useState<"cnpj" | "name">("cnpj");
  const [nameInput, setNameInput] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchingName, setSearchingName] = useState(false);
  const [nameSearchError, setNameSearchError] = useState<string | null>(null);

  // Search by name/reason/keywords function
  const executeNameSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const queryClean = nameInput.trim();
    if (!queryClean) {
      setNameSearchError("Por favor, digite um nome fantasia, razão social ou termo de busca.");
      return;
    }

    setSearchingName(true);
    setNameSearchError(null);
    setSearchResults([]);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(queryClean)}`);
      if (!response.ok) {
        throw new Error(`Erro na busca: Código de retorno ${response.status}`);
      }
      const data = await response.json();
      setSearchResults(data);
      if (data.length === 0) {
        setNameSearchError("Nenhuma empresa encontrada com os termos digitados.");
      }
    } catch (err: any) {
      console.error(err);
      setNameSearchError(err.message || "Erro de conexão ao buscar empresas.");
    } finally {
      setSearchingName(false);
    }
  };

  // Triggers selecting a search-by-name result
  const selectSearchResult = (cnpj: string) => {
    setSearchMode("cnpj");
    setCnpjInput(formatCNPJ(cnpj));
    setTimeout(() => {
      executeQuery(cnpj);
    }, 100);
  };

  // Load History from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("cnpj_query_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Erro ao ler histórico de buscas", e);
    }
  }, []);

  // Save history item helper
  const saveToHistory = (cnpj: string, razaoSocial: string, situacao: string, apiSource: string) => {
    const formattedCnpj = formatCNPJ(cnpj);
    const newItem: HistoryItem = {
      cnpj: formattedCnpj,
      razaoSocial,
      situacao,
      apiSource,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    setHistory((prev) => {
      // Remove duplicate if exists
      const filtered = prev.filter((item) => item.cnpj !== formattedCnpj);
      const updated = [newItem, ...filtered].slice(0, 8); // Keep last 8 searches
      localStorage.setItem("cnpj_query_history", JSON.stringify(updated));
      return updated;
    });
  };

  // Clear query history
  const clearHistory = () => {
    localStorage.removeItem("cnpj_query_history");
    setHistory([]);
  };

  // Mask function for input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const cleaned = cleanCNPJ(val);
    if (cleaned.length <= 14) {
      setCnpjInput(formatCNPJ(cleaned));
    }
  };

  // Auto trigger query from Suggestions or History
  const loadCnpjDirect = (cnpj: string) => {
    setCnpjInput(formatCNPJ(cnpj));
    // Trigger query
    setTimeout(() => {
      executeQuery(cnpj);
    }, 100);
  };

  // Standard interactive query flow
  const executeQuery = async (targetCnpj: string) => {
    const clean = cleanCNPJ(targetCnpj);
    if (clean.length !== 14) {
      setError("O CNPJ deve conter exatamente 14 dígitos numéricos.");
      setQueryResult(null);
      setNormalizedSummary(null);
      return;
    }

    setLoading(true);
    setError(null);
    setQueryResult(null);
    setNormalizedSummary(null);
    setActiveSource(null);
    setStepLogs([]);

    const log = (msg: string) => {
      setStepLogs((prev) => [...prev, msg]);
    };

    log("Formatando CNPJ e validando estrutura...");

    // Helper functions for providers
    const tryLocalProxy = async () => {
      log("Conectando ao barramento seguro do servidor (Evita CORS e Bloqueios)...");
      const response = await fetch(`/api/cnpj/${clean}`);
      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Servidor retornou status ${response.status}`);
      }
      log("Dados recuperados via servidor seguro com sucesso.");
      const resData = await response.json();
      return { data: resData.data, source: resData.source as "cnpj_ws" | "brasil_api" };
    };

    const tryCnpjWs = async () => {
      log("Conectando ao provedor primário: CNPJ.ws...");
      // Make direct request
      const response = await fetch(`https://publica.cnpj.ws/cnpj/${clean}`);
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Limite de rate-limit atingido no CNPJ.ws (máximo 3 consultas/min).");
        }
        throw new Error(`CNPJ.ws retornou status ${response.status}`);
      }
      log("Dados recuperados de CNPJ.ws com sucesso.");
      const data = await response.json();
      return { data, source: "cnpj_ws" as const };
    };

    const tryBrasilApi = async () => {
      log("Conectando ao provedor alternativo estável: BrasilAPI...");
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`);
      if (!response.ok) {
        throw new Error(`BrasilAPI retornou status ${response.status} (CNPJ pode não existir).`);
      }
      log("Dados recuperados da BrasilAPI com sucesso.");
      const data = await response.json();
      return { data, source: "brasil_api" as const };
    };

    try {
      let resultData: any = null;
      let usedSource: "cnpj_ws" | "brasil_api" = "cnpj_ws";

      if (selectedProvider === "cnpj_ws") {
        try {
          const res = await tryLocalProxy();
          resultData = res.data;
          usedSource = res.source;
        } catch (err) {
          log("Falha via proxy seguro, tentando conexão direta de navegador...");
          const res = await tryCnpjWs();
          resultData = res.data;
          usedSource = "cnpj_ws";
        }
      } else if (selectedProvider === "brasil_api") {
        try {
          const res = await tryLocalProxy();
          resultData = res.data;
          usedSource = "brasil_api";
        } catch (err) {
          log("Falha via proxy seguro, tentando conexão direta de navegador...");
          const res = await tryBrasilApi();
          resultData = res.data;
          usedSource = "brasil_api";
        }
      } else {
        // Auto / Fallback strategy
        try {
          // Try local secure proxy first
          const res = await tryLocalProxy();
          resultData = res.data;
          usedSource = res.source;
        } catch (err: any) {
          log(`Falha via proxy seguro: ${err.message || err}. Tentando conexão direta do navegador...`);
          try {
            const res = await tryCnpjWs();
            resultData = res.data;
            usedSource = "cnpj_ws";
          } catch (errDirect: any) {
            log(`Falha ou CORS no CNPJ.ws direto: ${errDirect.message}. Iniciando fallback direto para BrasilAPI.`);
            const res = await tryBrasilApi();
            resultData = res.data;
            usedSource = "brasil_api";
          }
        }
      }

      log("Mapeando árvores de dados do JSON...");
      const normalized = normalizeCnpjData(resultData, usedSource);
      
      log("Normalização concluída com sucesso!");
      setQueryResult(resultData);
      setNormalizedSummary(normalized);
      setActiveSource(usedSource);
      
      // Save item to historic list
      saveToHistory(
        clean,
        normalized.razaoSocial,
        normalized.situacao,
        usedSource === "cnpj_ws" ? "CNPJ.ws" : "BrasilAPI"
      );

    } catch (err: any) {
      console.error(err);
      log("Erro na consulta de dados reais.");
      
      // Detailed error analysis
      if (err.message && err.message.includes("Failed to fetch")) {
        setError(
          "CORS / Bloqueio de Rede: O navegador impediu a requisição direta devido à política de CORS da API. Como alternativa, você pode testar mudando de provedor ou usando o Sandbox de Demonstração."
        );
      } else {
        setError(
          err.message || "Não foi possível carregar as informações do CNPJ informado. Verifique se o número está correto."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Mock Sandbox Loader: allows perfect demonstration if API limits are reached
  const loadMockSandbox = (mockType: "google" | "petrobras" | "bancobrasil") => {
    setLoading(true);
    setError(null);
    setQueryResult(null);
    setNormalizedSummary(null);
    setStepLogs(["Iniciando simulação local...", "Acessando banco de dados sandbox..."]);

    setTimeout(() => {
      let data: any;
      let label = "";
      if (mockType === "google") {
        data = MOCK_GOOGLE_BRASIL;
        label = "Google Brasil";
      } else if (mockType === "petrobras") {
        data = MOCK_PETROBRAS;
        label = "Petrobras S.A.";
      } else {
        data = MOCK_BANCO_BRASIL;
        label = "Banco do Brasil S.A.";
      }

      setStepLogs((prev) => [...prev, `Simulação de ${label} carregada localmente com sucesso!`, "Mapeando JSON recursivo..."]);
      const normalized = normalizeCnpjData(data, "cnpj_ws");
      
      setQueryResult(data);
      setNormalizedSummary(normalized);
      setActiveSource("sandbox");
      setLoading(false);
      
      saveToHistory(data.cnpj, normalized.razaoSocial, normalized.situacao, "Mock Sandbox");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-indigo-100 selection:text-indigo-900 pb-16">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-indigo-100/40 to-sky-100/20 blur-3xl rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[20%] left-0 w-[300px] h-[300px] bg-gradient-to-tr from-indigo-50/30 to-rose-50/20 blur-3xl rounded-full pointer-events-none -z-10" />

      {/* Main Structural Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        {/* Header Branding Unit */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200/50 pb-3 mb-5 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 py-2 bg-indigo-600 text-white rounded-xl shadow-xs">
              <Building2 className="w-5 h-5" id="app-logo-icon" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-bold text-slate-950 tracking-tight">
                  Consulta de CNPJ
                </h1>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase border border-indigo-100">
                  Pública
                </span>
              </div>
              <p className="text-slate-500 text-[11px] md:text-xs">
                Plataforma avançada para análise cadastral com de-serializador de JSON recursivo.
              </p>
            </div>
          </div>
          
          {/* Real-time Status Badge */}
          <div className="flex items-center gap-2 bg-white border border-slate-150 px-3 py-1.5 rounded-xl shadow-xs">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <span className="text-[11px] font-semibold text-slate-600">Servidores Operacionais</span>
          </div>
        </header>

        {/* Primary Screen Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* LEFT SIDEBAR: Search widget and History */}
          <div className="lg:col-span-4 space-y-4">
            {/* CNPJ Query Form Panel */}
            <section className="bg-white border border-slate-150 rounded-2xl p-4 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600" />
              
              <h2 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-indigo-600" />
                Nova Consulta Cadastral
              </h2>

              {/* Toggles for search mode */}
              <div className="flex border-b border-slate-100 mb-4 gap-4">
                <button
                  type="button"
                  onClick={() => setSearchMode("cnpj")}
                  className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition duration-150 ${
                    searchMode === "cnpj"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Por CNPJ
                </button>
                <button
                  type="button"
                  onClick={() => setSearchMode("name")}
                  className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition duration-150 ${
                    searchMode === "name"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Por Nome / Razão
                </button>
              </div>

              {searchMode === "cnpj" ? (
                <form onSubmit={(e) => { e.preventDefault(); executeQuery(cnpjInput); }} className="space-y-3">
                  {/* Input with live mask */}
                  <div>
                    <label htmlFor="cnpj-input-field" className="block text-[10px] font-bold text-slate-400 mb-1 uppercase pl-1">
                      Digite o CNPJ da Empresa
                    </label>
                    <div className="relative">
                      <input
                        id="cnpj-input-field"
                        type="text"
                        className="w-full pl-4 pr-10 py-2.5 bg-slate-50 text-slate-800 font-mono text-base font-bold rounded-xl border border-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-650 focus:border-indigo-650 focus:bg-white transition duration-200"
                        placeholder="00.000.000/0000-00"
                        value={cnpjInput}
                        onChange={handleInputChange}
                      />
                      {cnpjInput && !loading && (
                        <button
                          type="button"
                          onClick={() => setCnpjInput("")}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-rose-500 rounded-full transition"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5 pl-1">
                      Insira apenas números. A formatação é automática.
                    </p>
                  </div>

                  {/* Query Provider selector */}
                  <div className="bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">
                      Estratégia de Consulta
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedProvider("auto")}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition text-center ${
                          selectedProvider === "auto"
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        Auto
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedProvider("cnpj_ws")}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition text-center ${
                          selectedProvider === "cnpj_ws"
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        CNPJ.ws
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedProvider("brasil_api")}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition text-center ${
                          selectedProvider === "brasil_api"
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        BrasilAPI
                      </button>
                    </div>
                  </div>

                  {/* Main Submit action */}
                  <button
                    type="submit"
                    disabled={loading || !cnpjInput}
                    className="w-full py-2.5 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 active:bg-indigo-805 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition duration-200 shadow-xs flex items-center justify-center gap-2 text-xs"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Consultando Provedores...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        Consultar CNPJ Ativo
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-3">
                  {/* Name input form */}
                  <form onSubmit={executeNameSearch} className="space-y-2.5">
                    <div>
                      <label htmlFor="name-input-field" className="block text-[10px] font-bold text-slate-400 mb-1 uppercase pl-1">
                        Termo de Busca (Nome Fantasia, Razão ou Atividade)
                      </label>
                      <div className="relative">
                        <input
                          id="name-input-field"
                          type="text"
                          className="w-full pl-4 pr-10 py-2.5 bg-slate-50 text-slate-800 text-sm font-bold rounded-xl border border-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:bg-white transition duration-200"
                          placeholder="Ex: Google, Magalu, Osdweb, Restaurante"
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                        />
                        {nameInput && !searchingName && (
                          <button
                            type="button"
                            onClick={() => setNameInput("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-rose-500 rounded-full transition whitespace-nowrap"
                          >
                            <XCircle className="w-4.5 h-4.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={searchingName || !nameInput.trim()}
                      className="w-full py-2.5 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 active:bg-indigo-805 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition duration-205 shadow-xs flex items-center justify-center gap-2 text-xs"
                    >
                      {searchingName ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Pesquisando empresas...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          Buscar por Nome/Atividade
                        </>
                      )}
                    </button>
                  </form>

                  {/* Name Search Errors */}
                  {nameSearchError && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-700 leading-relaxed">
                      {nameSearchError}
                    </div>
                  )}

                  {/* Name Search Results Cards */}
                  {searchResults.length > 0 && (
                    <div className="space-y-2 mt-2 max-h-[350px] overflow-y-auto pr-1">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 pl-1">
                        Resultados Encontrados ({searchResults.length})
                      </span>
                      {searchResults.map((item, idx) => (
                        <div
                          key={idx}
                          id={`search-result-item-${idx}`}
                          onClick={() => selectSearchResult(item.cnpj)}
                          className="p-3.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-150 hover:border-indigo-200 rounded-2xl cursor-pointer transition flex flex-col gap-1 text-left relative overflow-hidden group shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-indigo-700 font-mono tracking-wider">
                              {formatCNPJ(item.cnpj)}
                            </span>
                            <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase border border-emerald-100">
                              {item.situacao || "ATIVA"}
                            </span>
                          </div>
                          
                          <div className="text-slate-900 font-bold text-sm tracking-tight line-clamp-1 mt-0.5">
                            {item.razao_social}
                          </div>

                          {item.nome_fantasia && item.nome_fantasia !== item.razao_social && (
                            <div className="text-slate-500 font-medium text-xs line-clamp-1">
                              Fantasia: <span className="text-slate-700">{item.nome_fantasia}</span>
                            </div>
                          )}

                          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                            <span className="font-semibold text-slate-500">
                              {item.municipio} - {item.uf}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step Logs */}
              <AnimatePresence>
                {loading && stepLogs.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-slate-100 space-y-2 bg-slate-50 p-3 rounded-2xl"
                  >
                    <span className="block text-[10px] font-bold text-slate-450 uppercase mb-1">
                      Logs de Execução da Consulta
                    </span>
                    <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                      {stepLogs.map((logMsg, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[11px] font-mono leading-tight text-slate-600">
                          <span className="text-indigo-500 font-bold">●</span>
                          <span>{logMsg}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Search History Panel */}
            <section className="bg-white border border-slate-150 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                <h3 className="text-[11px] font-bold text-slate-805 uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-indigo-505" />
                  Histórico de Consultas
                </h3>
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-[10px] font-bold text-rose-500 hover:text-rose-700 uppercase flex items-center gap-1 transition cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    Limpar
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-[11px] text-slate-400">Nenhum histórico recente.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {history.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50/70 rounded-xl border border-slate-100/60 hover:border-indigo-200 transition duration-150 flex items-center justify-between group"
                    >
                      <div className="cursor-pointer flex-grow pr-3" onClick={() => loadCnpjDirect(item.cnpj)}>
                        <h4 className="text-xs font-bold text-slate-700 line-clamp-1 group-hover:text-indigo-600 transition">
                          {item.razaoSocial}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[10px] text-slate-500 font-semibold">{item.cnpj}</span>
                          <span className="text-[9px] text-slate-400">({item.timestamp})</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-[8px] uppercase tracking-wider px-1 py-0.5 rounded font-black bg-slate-200/60 text-slate-600">
                          {item.apiSource}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-600">
                          {item.situacao}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>

           {/* RIGHT SIDE: Summary and Dynamic Explored Nodes */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {error && (
                    <motion.div
                      key="error-box"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="bg-rose-50 border border-rose-150 rounded-3xl p-6 shadow-sm flex items-start gap-4 mb-8"
                    >
                      <AlertCircle className="w-6 h-6 text-rose-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-bold text-rose-900 uppercase tracking-wide">
                          Erro na Consulta do CNPJ
                        </h3>
                        <p className="text-xs text-rose-700 leading-relaxed mt-1">{error}</p>
                        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                          <button
                            onClick={() => executeQuery(cnpjInput)}
                            className="py-1.5 px-3 bg-rose-600 text-white hover:bg-rose-700 font-bold text-xs rounded-xl shadow-sm transition"
                          >
                            Tentar Novamente
                          </button>
                          <button
                            onClick={() => {
                              setError(null);
                              loadMockSandbox("google");
                            }}
                            className="py-1.5 px-3 bg-white text-slate-700 hover:bg-slate-100 border border-rose-200 font-bold text-xs rounded-xl shadow-sm transition"
                          >
                            Carregar Mock Simulado
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Loading Indicator placeholder */}
                  {loading && !queryResult && (
                    <motion.div
                      key="loading-placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-white border border-slate-150 rounded-3xl p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[400px]"
                    >
                      <div className="p-4 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full animate-bounce mb-4">
                        <Database className="w-8 h-8" />
                      </div>
                      <h3 className="text-base font-black text-slate-800">
                        Acessando Bases Governamentais...
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
                        Aguarde, estamos conectando à API e mapeando os nós XML/JSON do CNPJ solicitado. Isso pode levar alguns segundos.
                      </p>
                      
                      <div className="w-48 bg-slate-100 h-1.5 rounded-full mt-6 overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full animate-pulse" style={{ width: "70%" }} />
                      </div>
                    </motion.div>
                  )}

                  {/* No Search Made Placeholder */}
                  {!loading && !queryResult && !error && (
                    <motion.div
                      key="empty-placeholder"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-white border border-slate-150 rounded-3xl p-12 text-center shadow-sm min-h-[460px] flex flex-col items-center justify-center"
                    >
                      <div className="p-4 bg-slate-50 border border-slate-100 text-indigo-500 rounded-full mb-4 shadow-sm">
                        <Building2 className="w-8 h-8" />
                      </div>
                      <h3 className="text-base font-black text-slate-900">
                        Nenhum CNPJ Consultado
                      </h3>
                      <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed">
                        Insira um número de CNPJ ativo no formulário à esquerda ou utilize uma das entidades de demonstração recomendadas para visualizar a mágica da formatação recursiva de dados.
                      </p>
                      
                      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block w-full mb-2">
                          Experimente um clique:
                        </span>
                        <button
                          onClick={() => loadMockSandbox("google")}
                          className="inline-flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 font-bold px-3 py-1.5 rounded-xl transition cursor-pointer"
                        >
                          Google Brasil
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => loadMockSandbox("petrobras")}
                          className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 font-bold px-3 py-1.5 rounded-xl transition cursor-pointer"
                        >
                          Petrobras
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Query Result Displays */}
                  {!loading && queryResult && normalizedSummary && (
                    <motion.section
                      key="results-block"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="space-y-6"
                    >
                      {/* Results Sub-header and source badge */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-150 p-4 rounded-3xl shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-slate-900">
                              Consulta Concluída
                            </h3>
                            <p className="text-[11px] text-slate-500 font-medium">
                              Informações extraídas e catalogadas em tempo real.
                            </p>
                          </div>
                        </div>

                        {/* Active API Provider flag */}
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 py-1.5 px-3 rounded-xl self-start sm:self-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                            Fonte da Resposta:
                          </span>
                          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                            {activeSource === "cnpj_ws" ? "CNPJ.ws (API)" : activeSource === "brasil_api" ? "BrasilAPI (API)" : "Demonstração (Sandbox)"}
                          </span>
                        </div>
                      </div>

                      {/* Sub-Tabs Selector for custom details layout */}
                      <div className="flex items-center border-b border-slate-200 gap-2">
                        <button
                          onClick={() => setActiveTab("summary")}
                          className={`pb-3 px-4 text-xs md:text-sm font-bold border-b-2 transition duration-200 relative ${
                            activeTab === "summary"
                              ? "border-indigo-600 text-indigo-600"
                              : "border-transparent text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          Resumo da Empresa
                          {activeTab === "summary" && (
                            <motion.div 
                              layoutId="active-tab-indicator" 
                              className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                            />
                          )}
                        </button>
                        
                        <button
                          onClick={() => setActiveTab("explorer")}
                          className={`pb-3 px-4 text-xs md:text-sm font-bold border-b-2 transition duration-200 relative flex items-center gap-2 ${
                            activeTab === "explorer"
                              ? "border-indigo-600 text-indigo-600"
                              : "border-transparent text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          <Layers className="w-4 h-4" />
                          Explorador de Dados Completos
                          {activeTab === "explorer" && (
                            <motion.div 
                              layoutId="active-tab-indicator" 
                              className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                            />
                          )}
                        </button>
                      </div>

                      {/* Tab Contents */}
                      <div>
                        {activeTab === "summary" ? (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <CNPJSummary summary={normalizedSummary} />
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <DynamicDataExplorer rawData={queryResult} />
                          </motion.div>
                        )}
                      </div>
                    </motion.section>
                  )}
            </AnimatePresence>
          </div>

        </div>

        {/* Informative Footer Block */}
        <footer className="mt-16 border-t border-slate-200/60 pt-8 flex flex-col md:flex-row items-center justify-between text-slate-400 text-xs gap-4 text-center md:text-left">
          <p>© 2026 Consulta CNPJ. Algoritmo avançado de de-serialização de dados públicos de empresas brasileiras.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-500 font-semibold direct-links">
              <Globe className="w-3.5 h-3.5" />
              API Pública Gratuita
            </span>
            <span className="text-slate-300">|</span>
            <a 
              href="https://publica.cnpj.ws/" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-indigo-600 transition flex items-center gap-1 font-semibold"
            >
              CNPJ.ws Oficial
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
