import * as XLSX from 'xlsx';

export interface DashboardData {
  faturamento: { particular: number; plano: number; mediaMes: number };
  metaAnual: { tendencia: number; faturamentoAA: number; metaAnual: number; faltaRealizar: number; realizado: number };
  atendimentos: { total: number; mediaMes: number; totalExames: number; mediaMesExames: number };
  portaClinica: { porta: number; clinica: number };
  ticketCesta: { ticketMedio: number; cestaMedia: number };
  regioes: { nome: string; valor: number }[];
  mensal: { mes: string; meta: number; realizado: number }[];
}

function readSheet(wb: XLSX.WorkBook, name: string): any[][] {
  const ws = wb.Sheets[name];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
}

export function parseExcelFile(buffer: ArrayBuffer): DashboardData {
  const wb = XLSX.read(buffer, { type: 'array' });

  const fat = readSheet(wb, 'Faturamento');
  const meta = readSheet(wb, 'Meta Anual');
  const atend = readSheet(wb, 'Atendimentos');
  const pc = readSheet(wb, 'Porta Clinica');
  const tc = readSheet(wb, 'Ticket Cesta');
  const reg = readSheet(wb, 'Regiões');
  const mensal = readSheet(wb, 'Mensal');

  return {
    faturamento: {
      particular: fat[1]?.[1] ?? 0,
      plano: fat[2]?.[1] ?? 0,
      mediaMes: fat[3]?.[1] ?? 0,
    },
    metaAnual: {
      tendencia: meta[1]?.[1] ?? 0,
      faturamentoAA: meta[2]?.[1] ?? 0,
      metaAnual: meta[3]?.[1] ?? 0,
      faltaRealizar: meta[4]?.[1] ?? 0,
      realizado: meta[5]?.[1] ?? 0,
    },
    atendimentos: {
      total: atend[1]?.[1] ?? 0,
      mediaMes: atend[2]?.[1] ?? 0,
      totalExames: atend[3]?.[1] ?? 0,
      mediaMesExames: atend[4]?.[1] ?? 0,
    },
    portaClinica: {
      porta: pc[1]?.[1] ?? 0,
      clinica: pc[2]?.[1] ?? 0,
    },
    ticketCesta: {
      ticketMedio: tc[1]?.[1] ?? 0,
      cestaMedia: tc[2]?.[1] ?? 0,
    },
    regioes: reg.slice(1).map((r) => ({ nome: r[0] ?? '', valor: r[1] ?? 0 })),
    mensal: mensal.slice(1).map((r) => ({ mes: r[0] ?? '', meta: r[1] ?? 0, realizado: r[2] ?? 0 })),
  };
}
