import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Search, ListFilter, Copy, Check, Eye, Columns, Sparkles } from "lucide-react";
import { 
  formatCNPJ, 
  formatCEP, 
  formatCurrency, 
  formatDate, 
  formatBoolean, 
  humanizeKey, 
  countFilledFields 
} from "../utils/formatter";

interface DynamicDataExplorerProps {
  rawData: any;
}

export const DynamicDataExplorer: React.FC<DynamicDataExplorerProps> = ({ rawData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [collapsedPaths, setCollapsedPaths] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  // Field counter metric
  const filledFieldsCount = useMemo(() => {
    return countFilledFields(rawData);
  }, [rawData]);

  const copyJsonToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(rawData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const togglePath = (path: string) => {
    setCollapsedPaths((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const expandAll = () => {
    setCollapsedPaths({});
  };

  const collapseAll = () => {
    // We can auto-collapse objects by walking the keys, but simpler is setting all is collapsed.
    // For now we can recursively find all paths and set them to true.
    const paths: Record<string, boolean> = {};
    const walk = (val: any, currentPath: string) => {
      if (val && typeof val === "object") {
        paths[currentPath] = true;
        if (Array.isArray(val)) {
          val.forEach((item, index) => walk(item, `${currentPath}[${index}]`));
        } else {
          Object.keys(val).forEach((key) => walk(val[key], `${currentPath}.${key}`));
        }
      }
    };
    walk(rawData, "root");
    setCollapsedPaths(paths);
  };

  // Helper to format values recursively depending on the key name
  const formatNodeValue = (key: string, value: any): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-slate-400 italic">Nulo / Vazio</span>;
    }

    if (typeof value === "boolean") {
      return (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${value ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
          {formatBoolean(value)}
        </span>
      );
    }

    const keyLower = key.toLowerCase();
    const valString = String(value);

    // If key has CNPJ in name or length is 14 numbers
    if (keyLower.includes("cnpj") || (valString.length === 14 && /^\d+$/.test(valString))) {
      return <span className="font-mono text-slate-800 font-semibold">{formatCNPJ(valString)}</span>;
    }

    // If key has CEP in name or length is 8 numbers
    if (keyLower.includes("cep") || (valString.length === 8 && /^\d+$/.test(valString))) {
      return <span className="font-mono text-slate-700">{formatCEP(valString)}</span>;
    }

    // Currency fields (capital_social, capital, etc.) or specifically marked keys
    if (keyLower.includes("capital_social") || keyLower.includes("valor") || keyLower === "capital") {
      return <span className="font-bold text-slate-900">{formatCurrency(valString)}</span>;
    }

    // Date keywords
    if (keyLower.includes("data_") || keyLower.includes("inicio_") || keyLower.includes("data") || keyLower.includes("cadastro")) {
      const formatted = formatDate(valString);
      if (formatted !== valString) {
        return <span className="text-slate-800 font-medium">{formatted}</span>;
      }
    }

    // E-mail link
    if (keyLower.includes("email") || valString.includes("@")) {
      return (
        <a href={`mailto:${valString}`} className="text-indigo-600 hover:underline hover:text-indigo-800 break-all font-medium">
          {valString}
        </a>
      );
    }

    // Simple number highlight
    if (typeof value === "number") {
      return <span className="text-indigo-600 font-semibold">{value}</span>;
    }

    return <span className="text-slate-700 break-words font-medium">{valString}</span>;
  };

  // Main recursive node renderer
  const renderNode = (key: string, val: any, path: string, depth: number): React.ReactNode => {
    const isCollapsible = val && typeof val === "object";
    const isCollapsed = collapsedPaths[path] ?? false;
    const humanizedName = humanizeKey(key);

    // If there is filter, check if this node matches
    if (searchTerm) {
      const matchText = (searchTerm || "").toLowerCase();
      const serialize = JSON.stringify({ [key]: val }).toLowerCase();
      if (!serialize.includes(matchText)) {
        return null;
      }
    }

    if (!isCollapsible) {
      return (
        <div key={path} className="flex flex-col sm:flex-row sm:items-center py-2 px-3 hover:bg-slate-50/70 border-b border-slate-100/50 rounded transition duration-150 gap-1 sm:gap-4 ml-2" style={{ paddingLeft: `${depth * 12 + 12}px` }}>
          <div className="sm:w-1/3 min-w-[140px] flex-shrink-0">
            <span className="text-xs font-semibold text-slate-400 block tracking-wide">{key}</span>
            <span className="text-slate-800 text-xs font-semibold">{humanizedName}</span>
          </div>
          <div className="text-sm text-slate-700 flex-grow font-mono sm:pl-4">
            {formatNodeValue(key, val)}
          </div>
        </div>
      );
    }

    const isArrayOfPrimitives = Array.isArray(val) && val.every((item) => typeof item !== "object" || item === null);
    
    // Arrays of objects or simple list of objects
    if (Array.isArray(val) && !isArrayOfPrimitives) {
      return (
        <div key={path} className="mb-4 mt-2" style={{ paddingLeft: `${depth * 8}px` }}>
          <button
            onClick={() => togglePath(path)}
            className="flex items-center gap-2 w-full text-left py-2 px-3 bg-indigo-50/50 text-indigo-900 border border-indigo-100/60 rounded-xl hover:bg-indigo-50 transition font-medium text-xs md:text-sm"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4 text-indigo-400" /> : <ChevronDown className="w-4 h-4 text-indigo-500" />}
            <span className="font-bold text-indigo-800">{humanizedName}</span>
            <span className="bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
              {val.length} {val.length === 1 ? "item" : "itens"}
            </span>
          </button>

          {!isCollapsed && (
            <div className="grid grid-cols-1 gap-4 mt-3 pl-2 md:pl-4 border-l-2 border-indigo-100/60 transition-all duration-300">
              {val.map((item, index) => (
                <div key={`${path}[${index}]`} className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 relative">
                  <span className="absolute top-3 right-3 text-[10px] font-bold text-slate-300 uppercase bg-slate-50 border border-slate-100 rounded px-2 py-0.5">
                    #{index + 1}
                  </span>
                  <div className="space-y-1">
                    {Object.keys(item || {}).map((itemKey) => 
                      renderNode(itemKey, item[itemKey], `${path}[${index}].${itemKey}`, depth + 1)
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Normal objects or simple arrays of primitives
    return (
      <div key={path} className="mb-2 mt-2" style={{ paddingLeft: `${depth * 8}px` }}>
        <button
          onClick={() => togglePath(path)}
          className="flex items-center gap-2 py-2 px-3 w-full text-left bg-slate-100/60 text-slate-800 rounded-xl hover:bg-slate-200/50 border border-slate-100 transition text-xs font-semibold"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          <span>{humanizedName}</span>
          <span className="text-[10px] font-mono text-slate-400 font-normal">({key})</span>
        </button>

        {!isCollapsed && (
          <div className="mt-1 pb-2 pl-2 md:pl-4 border-l-2 border-slate-200/50 space-y-1">
            {Array.isArray(val) ? (
              // Simple array of primitives
              <div className="flex flex-wrap gap-1.5 p-3 bg-white border border-slate-100 rounded-xl mt-2">
                {val.map((primitiveVal, primitiveIndex) => (
                  <span key={primitiveIndex} className="bg-slate-50 text-slate-700 text-xs px-2.5 py-1 rounded-lg border border-slate-150 font-medium">
                    {formatNodeValue(key, primitiveVal)}
                  </span>
                ))}
              </div>
            ) : (
              // Typical object
              Object.keys(val).map((subKey) => 
                renderNode(subKey, val[subKey], `${path}.${subKey}`, depth + 1)
              )
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm mt-8" id="cnpj-explorer-section">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              Explorador Dinâmico de Dados
            </h3>
            <span className="bg-indigo-50 text-indigo-700 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full font-bold border border-indigo-100">
              Auto-Mapeado
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-xl">
            Esta seção reconstrói e formata dinamicamente todas as propriedades recebidas nas respostas da API de CNPJ (incluindo sócios, históricos e cadastros alternativos).
          </p>
        </div>

        {/* Counter of filled stats */}
        <div className="bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-2xl flex items-center gap-3">
          <div className="p-1 px-2.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-black rounded-lg">
            {filledFieldsCount}
          </div>
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Campos<br />Preenchidos
          </div>
        </div>
      </div>

      {/* Control Actions & Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 bg-slate-55/65 p-3 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="text-xs font-semibold border border-slate-205 text-slate-700 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 shadow-sm transition"
          >
            Expandir Tudo
          </button>
          <button
            onClick={collapseAll}
            className="text-xs font-semibold border border-slate-205 text-slate-700 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 shadow-sm transition"
          >
            Recolher Tudo
          </button>
        </div>

        {/* API utilities controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRawJson(!showRawJson)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-205 px-3 py-1.5 rounded-xl hover:bg-slate-50 shadow-sm transition"
          >
            <Eye className="w-3.5 h-3.5" />
            {showRawJson ? "Ver Interface Amigável" : "Ver JSON Bruto"}
          </button>

          <button
            onClick={copyJsonToClipboard}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border shadow-sm transition ${
              copied 
                ? "bg-emerald-50 text-emerald-800 border-emerald-305" 
                : "bg-white text-slate-700 border-slate-205 hover:bg-slate-55"
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copiado!" : "Copiar JSON"}
          </button>
        </div>
      </div>

      {/* Dynamic search bar */}
      {!showRawJson && (
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrar dados dinâmicos por palavra-chave ou valor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs md:text-sm pl-10 pr-4 py-2.5 bg-slate-50 text-slate-800 font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")} 
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-indigo-600 font-bold"
            >
              Limpar
            </button>
          )}
        </div>
      )}

      {/* Displaying Nodes or Plain JSON */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 overflow-hidden max-h-[600px] overflow-y-auto">
        {showRawJson ? (
          <div>
            <div className="flex justify-between items-center bg-slate-850/80 text-slate-400 text-[10px] font-mono px-3 py-1.5 rounded-t-xl">
              <span>JSON COMPLETO</span>
              <span>application/json</span>
            </div>
            <pre className="font-mono text-xs text-slate-800 bg-slate-100 p-4 rounded-b-xl overflow-x-auto whitespace-pre leading-relaxed select-all">
              {JSON.stringify(rawData, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="space-y-1">
            {Object.keys(rawData || {}).map((topKey) => 
              renderNode(topKey, rawData[topKey], `root.${topKey}`, 0)
            )}
          </div>
        )}
      </div>
    </div>
  );
};
