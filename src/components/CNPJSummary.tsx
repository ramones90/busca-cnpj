import React, { useState } from "react";
import { NormalizedSummary } from "../types";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign, 
  ShieldCheck, 
  Printer, 
  Copy, 
  Check, 
  Users, 
  BookOpen, 
  Info,
  Clock,
  ExternalLink
} from "lucide-react";

interface CNPJSummaryProps {
  summary: NormalizedSummary;
}

export const CNPJSummary: React.FC<CNPJSummaryProps> = ({ summary }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `Ficha_Cadastral_${summary.cnpj.replace(/\D/g, "")}`;
    window.print();
    document.title = originalTitle;
  };

  // Status Badge Styling for Company Status
  const getStatusBadgeStyles = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes("ATIVA") || s.includes("ATIVO") || s.includes("SIM") || s === "02") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (s.includes("BAIXADA") || s.includes("INATIVA") || s.includes("BAIXADO")) {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    if (s.includes("SUSPENSA") || s.includes("SUSPENSO") || s.includes("INAPTA")) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  const getIEBadgeStyles = (isActive: boolean) => {
    return isActive 
      ? "bg-teal-50 text-teal-700 border-teal-150" 
      : "bg-slate-100 text-slate-500 border-slate-200";
  };

  const currentFormattedDate = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
  const currentFormattedTime = new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div className="space-y-4" id="cnpj-summary-section">
      
      {/* Interactive Controls Bar - Hidden on Print */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-white p-3 rounded-2xl border border-slate-100 shadow-xs print:hidden">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-500">
            Ficha de Informações Cadastrais
          </span>
        </div>

        <button
          onClick={handlePrint}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          Salvar PDF / Imprimir Ficha
        </button>
      </div>

      {/* Main Consolidated Profile Card */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden p-5 md:p-6 space-y-5 print:border-none print:shadow-none print:p-0">
        
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row justify-between gap-4 pb-4 border-b border-slate-100 print:pb-3">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 focus:outline-none select-all">
                CNPJ {summary.cnpj}
                <button 
                  onClick={() => handleCopy(summary.cnpj, "cnpj")}
                  className="p-0.5 hover:bg-slate-200 rounded text-slate-500 transition cursor-pointer print:hidden"
                  title="Copiar CNPJ"
                >
                  {copiedField === "cnpj" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeStyles(summary.situacao)}`}>
                SITUAÇÃO: {summary.situacao.toUpperCase()}
              </span>
              {summary.regimeApuracao && (
                <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full">
                  {summary.regimeApuracao}
                </span>
              )}
            </div>

            <h1 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight leading-tight uppercase select-all">
              {summary.razaoSocial}
            </h1>

            {summary.nomeFantasia && summary.nomeFantasia !== summary.razaoSocial && (
              <p className="text-slate-500 text-xs md:text-sm font-medium flex items-center gap-1.5 select-all">
                <span className="text-slate-400 font-normal uppercase text-[10px]">Nome Fantasia:</span>
                <strong className="text-slate-700 font-semibold uppercase">{summary.nomeFantasia}</strong>
              </p>
            )}
          </div>

          <div className="flex flex-row md:flex-col items-start md:items-end justify-between md:justify-start gap-1 border-t md:border-t-0 border-slate-50 pt-3 md:pt-0 shrink-0">
            <span className="text-[9px] text-slate-400 font-extrabold tracking-wider uppercase">Data da Consulta</span>
            <div className="bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 text-right">
              <p className="text-xs font-bold text-slate-700 font-mono">{currentFormattedDate}</p>
              <p className="text-[9px] text-slate-400 font-medium font-mono">{currentFormattedTime} (Horário Local)</p>
            </div>
          </div>
        </div>

        {/* Bento Grid layout of features */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Box 1: Identificação Básica (Main Columns) */}
          <div className="lg:col-span-8 space-y-4">
            
            <div className="bg-slate-50/50 border border-slate-100/70 rounded-xl p-4 space-y-3.5">
              <h3 className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                Dados Gerais do Estabelecimento
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-5">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Data de Abertura / Início</span>
                  <span className="text-xs font-semibold text-slate-800 block mt-0.5">{summary.dataInicioAtividade || "Não Informado"}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Capital Social Declarado</span>
                  <span className="text-xs font-bold text-slate-900 block mt-0.5 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    {summary.capitalSocial}
                  </span>
                </div>

                <div className="sm:col-span-2 border-t border-slate-100/60 pt-2.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Natureza Jurídica</span>
                  <span className="text-xs font-semibold text-slate-700 block mt-0.5 line-clamp-2 select-all leading-normal uppercase">{summary.naturezaJuridica || "Sem registro"}</span>
                </div>

                <div className="sm:col-span-2 border-t border-slate-100/60 pt-2.5 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Quadro de Sócios</span>
                    <span className="text-[11px] text-slate-550 block mt-0.5">
                      Contagem registrada de parceiros corporativos/administradores nesta empresa.
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-1 rounded-xl font-bold text-xs shrink-0">
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    {summary.sociosCount} {summary.sociosCount === 1 ? "Sócio" : "Sócios"}
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2: Endereço & Localização */}
            <div className="border border-slate-150 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  Endereço Registrado
                </h3>
                
                <button
                  onClick={() => handleCopy(`${summary.logradouro}, ${summary.numero}${summary.complemento !== "******" ? " - " + summary.complemento : ""}, ${summary.bairro}, ${summary.municipio} - ${summary.uf}, CEP: ${summary.cep}`, "address")}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition cursor-pointer print:hidden"
                >
                  {copiedField === "address" ? (
                    <>
                      <Check className="w-2.5 h-2.5 text-emerald-600" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-2.5 h-2.5" />
                      Copiar Endereço
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Logradouro</span>
                  <span className="text-xs font-semibold text-slate-800 block mt-0.5 uppercase select-all">{summary.logradouro || "-"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Número</span>
                  <span className="text-xs font-semibold text-slate-800 block mt-0.5 uppercase select-all">{summary.numero || "S/N"}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Complemento</span>
                  <span className="text-xs font-semibold text-slate-800 block mt-0.5 uppercase select-all">{summary.complemento || "******"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-405 uppercase tracking-wide block">Bairro / Distrito</span>
                  <span className="text-xs font-semibold text-slate-800 block mt-0.5 uppercase select-all">{summary.bairro || "-"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-405 uppercase tracking-wide block">CEP</span>
                  <span className="text-xs font-medium font-mono text-slate-800 block mt-0.5 select-all">{summary.cep || "-"}</span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-[10px] font-bold text-slate-405 uppercase tracking-wide block">Município / Cidade</span>
                  <span className="text-xs font-semibold text-slate-800 block mt-0.5 uppercase select-all">{summary.municipio || "-"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-405 uppercase tracking-wide block">Estado (UF)</span>
                  <span className="text-xs font-bold text-indigo-700 block mt-0.5 uppercase select-all">{summary.uf || "-"}</span>
                </div>
              </div>

              <div className="bg-slate-50/75 rounded-lg p-2.5 text-[11px] text-slate-500 font-medium select-all font-mono leading-relaxed">
                {summary.enderecoCompleto}
              </div>
            </div>

          </div>

          {/* Right Columns: Registrations & Statuses */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Box 3: Inscrições Estaduais / ICMS Setup */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 space-y-3.5">
              <h3 className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                Inscrição Estadual (SEFAZ)
              </h3>

              <div className="space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Inscrições Estaduais</span>
                  {summary.inscricoesEstaduais && summary.inscricoesEstaduais.length > 0 ? (
                    <div className="space-y-1.5">
                      {summary.inscricoesEstaduais.map((ie, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center justify-between border border-slate-200/60 bg-white rounded-lg p-2 text-xs font-semibold"
                        >
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400 font-bold font-mono text-[9px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded uppercase">
                              {ie.uf}
                            </span>
                            <span className="font-mono text-slate-755 select-all font-bold">
                              {ie.ie}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold border ${getIEBadgeStyles(ie.ativo)}`}>
                              {ie.ativo ? "ATIVO" : "INATIVO"}
                            </span>
                            <button
                              onClick={() => handleCopy(ie.ie, `ie-${idx}`)}
                              className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition cursor-pointer print:hidden"
                              title="Copiar Inscrição"
                            >
                              {copiedField === `ie-${idx}` ? (
                                <Check className="w-2.5 h-2.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-2.5 h-2.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-2 bg-white border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-405 italic">
                      Não Contribuidor de ICMS (Isento / Isolação)
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Última Atualização Registral</span>
                  <span className="text-xs font-semibold text-slate-700 block mt-0.5">{summary.situacaoData || "Não Constante"}</span>
                </div>
              </div>
            </div>

            {/* Box 4: Contatos Corporativos */}
            <div className="border border-slate-100 bg-white rounded-xl p-4 space-y-3">
              <h3 className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                Contatos Corporativos
              </h3>

              <div className="space-y-2.5">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Endereço de E-mail</span>
                  <div className="flex items-center justify-between gap-1.5 mt-0.5">
                    <span className="text-xs font-semibold text-slate-700 truncate select-all">{summary.email || "-"}</span>
                    {summary.email && summary.email !== "-" && (
                      <button
                        onClick={() => handleCopy(summary.email, "email")}
                        className="p-1 hover:bg-slate-55 text-slate-400 hover:text-slate-600 rounded-lg transition cursor-pointer print:hidden border border-slate-100"
                        title="Copiar E-mail"
                      >
                        {copiedField === "email" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-50 pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Telefone Corporativo</span>
                  <div className="flex items-center justify-between gap-1.5 mt-0.5">
                    <span className="text-xs font-bold text-slate-800 font-mono select-all">{summary.telefone || "-"}</span>
                    {summary.telefone && summary.telefone !== "-" && (
                      <button
                        onClick={() => handleCopy(summary.telefone, "phone")}
                        className="p-1 hover:bg-slate-55 text-slate-400 hover:text-slate-600 rounded-lg transition cursor-pointer print:hidden border border-slate-100"
                        title="Copiar Telefone"
                      >
                        {copiedField === "phone" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Section CNAEs: Atividades Econômicas */}
        <div className="border-t border-slate-100 pt-5 space-y-3">
          <h3 className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            Atividades Econômicas (CNAE)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* CNAE Principal */}
            <div className="md:col-span-1 bg-gradient-to-br from-indigo-50/40 to-slate-50 border border-indigo-150/50 rounded-xl p-4">
              <span className="text-[9px] font-extrabold text-indigo-700 tracking-widest uppercase block mb-1.5">Atividade Econômica Principal</span>
              <p className="text-xs font-mono font-bold text-slate-800 leading-normal uppercase select-all">
                {summary.cnaePrincipal || "Não Especificado"}
              </p>
            </div>

            {/* CNAE Secundários */}
            <div className="md:col-span-2 border border-slate-100 bg-white rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-extrabold text-slate-400 tracking-widest uppercase block mb-2">Atividades Econômicas Secundárias</span>
                {summary.cnaeSecundarios && summary.cnaeSecundarios.length > 0 ? (
                  <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                    {summary.cnaeSecundarios.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="text-[11px] font-mono font-medium text-slate-650 hover:bg-slate-50 p-1 rounded-lg transition select-all leading-normal uppercase border border-slate-105"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Não constam atividades secundárias associadas.</p>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Footer info: simple, authentic, elegant */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-5 gap-3">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-slate-350 shrink-0" />
            <p className="font-medium">
              Dados extraídos em tempo real via consulta regulada pública.
            </p>
          </div>
          <p className="font-mono text-[10px] text-slate-350">
            Ficha de Consulta CNPJ • Em conformidade com a LGPD
          </p>
        </div>

      </div>

    </div>
  );
};
