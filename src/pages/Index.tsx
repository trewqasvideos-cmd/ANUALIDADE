import { useState, useRef, useEffect } from 'react';
import { Upload, FileSpreadsheet, TrendingUp, Users, FlaskConical, DollarSign, LogOut, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { parseExcelFile, type DashboardData } from '@/lib/parseExcel';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import logo from '@/assets/logo-bom-pastor.png';

/* ─── Credenciais ─── */
const VALID_USER = 'admin';
const VALID_PASS = 'bompastor@2025';
const AUTH_KEY   = 'bp_auth';
const DATA_KEY   = 'bp_data';

/* ─── Formatação ─── */
const formatCurrency = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatNumber = (v: number) => v.toLocaleString('pt-BR');

/* ─── Cores ─── */
const BLUE       = 'hsl(210, 60%, 50%)';
const BLUE_DARK  = 'hsl(210, 60%, 38%)';
const BLUE_LIGHT = 'hsl(210, 40%, 88%)';
const RED        = 'hsl(4, 80%, 56%)';
const GREEN      = 'hsl(142, 72%, 40%)';
const GOLD       = 'hsl(43, 80%, 50%)';

function AnimatedCard({ children, className = '', delay = 0 }: {
  children: React.ReactNode; className?: string; delay?: number;
}) {
  return (
    <Card className={`shadow-md animate-fade-up ${className}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </Card>
  );
}

/* ════════════════════════════════════
   TELA DE LOGIN
════════════════════════════════════ */
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [user, setUser]       = useState('');
  const [pass, setPass]       = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (user === VALID_USER && pass === VALID_PASS) {
        localStorage.setItem(AUTH_KEY, '1');
        onLogin();
      } else {
        setError('Usuário ou senha inválidos.');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="flex flex-col items-center mb-8 gap-2">
          <img src={logo} alt="Laboratório Bom Pastor" className="h-20 object-contain" />
          <p className="text-sm text-muted-foreground">Dashboard de Faturamento</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-lg font-bold text-foreground">Entrar</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Usuário</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={user}
                    onChange={e => { setUser(e.target.value); setError(''); }}
                    className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Digite seu usuário"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={pass}
                    onChange={e => { setPass(e.target.value); setError(''); }}
                    className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Digite sua senha"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-center font-medium" style={{ color: RED }}>{error}</p>
              )}

              <Button type="submit" className="w-full mt-1" disabled={loading}>
                {loading ? 'Verificando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   DASHBOARD
════════════════════════════════════ */
export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [data, setData]             = useState<DashboardData | null>(null);
  const inputRef                    = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (localStorage.getItem(AUTH_KEY) === '1') setIsLoggedIn(true);
    const saved = localStorage.getItem(DATA_KEY);
    if (saved) {
      try { setData(JSON.parse(saved)); } catch { /* ignora */ }
    }
  }, []);

  const handleLogin  = () => setIsLoggedIn(true);
  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsLoggedIn(false);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const buffer = await file.arrayBuffer();
    const parsed = parseExcelFile(buffer);
    setData(parsed);
    localStorage.setItem(DATA_KEY, JSON.stringify(parsed));
    e.target.value = '';
  };

  if (!isLoggedIn) return <LoginScreen onLogin={handleLogin} />;

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-8">
        <img src={logo} alt="Laboratório Bom Pastor" className="h-20 object-contain animate-scale-fade" />
        <div className="flex flex-col items-center gap-3 text-center animate-fade-up" style={{ animationDelay: '150ms' }}>
          <FileSpreadsheet className="h-16 w-16 text-primary" strokeWidth={1.5} />
          <h1 className="text-2xl font-bold text-foreground">Dashboard de Faturamento</h1>
          <p className="max-w-md text-muted-foreground">
            Faça upload do arquivo Excel (.xlsx) com os dados para visualizar o dashboard.
          </p>
        </div>
        <input ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFile} />
        <Button size="lg" onClick={() => inputRef.current?.click()} className="gap-2 active:scale-[0.97] transition-transform animate-fade-up" style={{ animationDelay: '300ms' }}>
          <Upload className="h-5 w-5" /> Upload Excel
        </Button>
        <button onClick={handleLogout} className="text-xs text-muted-foreground underline mt-2">Sair</button>
      </div>
    );
  }

  const pieData = [
    { name: 'Porta',   value: data.portaClinica.porta   },
    { name: 'Clínica', value: data.portaClinica.clinica },
  ];
  const realizadoPct  = data.metaAnual.realizado * 100;
  const metaDonutData = [
    { name: 'Realizado', value: realizadoPct          },
    { name: 'Restante',  value: 100 - realizadoPct    },
  ];
  const ticketMeta = 200;
  const cestaMeta  = 6;
  const ROW2_H     = 'h-[400px]';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-card px-6 py-3 shadow-sm animate-fade-up">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <img src={logo} alt="Laboratório Bom Pastor" className="h-10 object-contain" />
          <div className="flex items-center gap-2">
            <input ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFile} />
            <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()} className="gap-2 active:scale-[0.97] transition-transform">
              <Upload className="h-4 w-4" /> Atualizar Dados
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Row 1 — KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard icon={<TrendingUp />}   label="Tendência"       value={formatCurrency(data.metaAnual.tendencia)}      delay={80}  />
          <KpiCard icon={<DollarSign />}   label="Média Mês"       value={formatCurrency(data.faturamento.mediaMes)}     delay={160} />
          <KpiCard icon={<Users />}        label="Atendimentos"    value={formatNumber(data.atendimentos.total)}          delay={240} />
          <KpiCard icon={<FlaskConical />} label="Total de Exames" value={formatNumber(data.atendimentos.totalExames)}    delay={320} />
        </div>

        {/* Row 2 — 3 colunas simétricas */}
        <div className="grid gap-4 lg:grid-cols-3">

          {/* 1. Meta Anual */}
          <AnimatedCard delay={400} className={ROW2_H}>
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <TrendingUp className="h-4 w-4" /> Meta Anual
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-2">
              <div className="relative h-40 w-40">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={metaDonutData} dataKey="value"
                      cx="50%" cy="50%"
                      innerRadius={50} outerRadius={68}
                      startAngle={90} endAngle={-270}
                      paddingAngle={0} stroke="none"
                    >
                      <Cell fill={BLUE_DARK} />
                      <Cell fill={BLUE_LIGHT} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold" style={{ color: BLUE_DARK }}>{realizadoPct.toFixed(1)}%</span>
                </div>
              </div>
              <div className="mt-4 w-full border-t pt-4 flex flex-col gap-3">
                {[
                  { label: 'Realizado',       value: formatCurrency(data.metaAnual.metaAnual * data.metaAnual.realizado), color: undefined, bold: true },
                  { label: 'Meta',            value: formatCurrency(data.metaAnual.metaAnual),                            color: undefined, bold: false },
                  { label: 'Falta',           value: formatCurrency(data.metaAnual.faltaRealizar),                        color: RED,       bold: false },
                  { label: 'Faturamento A.A', value: formatCurrency(data.metaAnual.faturamentoAA),                        color: undefined, bold: false },
                ].map(({ label, value, color, bold }) => (
                  <div key={label} className="flex items-baseline justify-between gap-2">
                    <span className="text-sm text-muted-foreground shrink-0">{label}</span>
                    <span
                      className="text-sm text-right leading-tight"
                      style={{ color: color, fontWeight: bold ? 700 : 600 }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </AnimatedCard>

          {/* 2. Porta / Clínica */}
          <AnimatedCard delay={480} className={ROW2_H}>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Porta / Clínica</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-between h-[calc(100%-52px)]">
              <div className="h-56 w-full">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData} dataKey="value"
                      cx="50%" cy="50%"
                      innerRadius={54} outerRadius={76}
                      paddingAngle={4}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill={BLUE} />
                      <Cell fill={RED}  />
                    </Pie>
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex w-full justify-around text-xs text-muted-foreground border-t pt-3">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: BLUE }} />
                  Porta: {formatCurrency(data.portaClinica.porta)}
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: RED }} />
                  Clínica: {formatCurrency(data.portaClinica.clinica)}
                </span>
              </div>
            </CardContent>
          </AnimatedCard>

          {/* 3. Ticket + Cesta — mesma altura via flex-1 */}
          <div className={`flex flex-col gap-4 ${ROW2_H}`}>
            <AnimatedCard delay={560} className="flex-1">
              <CardContent className="flex items-center justify-center h-full p-3">
                <DonutCard
                  value={data.ticketCesta.ticketMedio}
                  max={ticketMeta}
                  label="TICKET MÉDIO"
                  format={(v) => formatCurrency(v)}
                  color={BLUE_DARK}
                />
              </CardContent>
            </AnimatedCard>
            <AnimatedCard delay={640} className="flex-1">
              <CardContent className="flex items-center justify-center h-full p-3">
                <DonutCard
                  value={data.ticketCesta.cestaMedia}
                  max={cestaMeta}
                  label="CESTA MÉDIA"
                  format={(v) => v.toFixed(1)}
                  color={BLUE}
                />
              </CardContent>
            </AnimatedCard>
          </div>
        </div>

        {/* Row 3 — Gráfico mensal */}
        <AnimatedCard delay={720}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Faturamento por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer>
                <BarChart data={data.mensal} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(215,14%,90%)" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Legend />
                  <Bar dataKey="meta"      name="Meta"      fill={BLUE}  radius={[4,4,0,0]} />
                  <Bar dataKey="realizado" name="Realizado" fill={GREEN} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </AnimatedCard>
      </main>
    </div>
  );
}

/* ─── KPI Card ─── */
function KpiCard({ icon, label, value, sub, delay = 0 }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; delay?: number;
}) {
  return (
    <AnimatedCard delay={delay}>
      <CardContent className="flex items-start gap-3 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-lg font-bold text-foreground truncate">{value}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </AnimatedCard>
  );
}

/* ─── Donut com valor centralizado ─── */
function DonutCard({ value, max, label, format, color }: {
  value: number; max: number; label: string; format: (v: number) => string; color: string;
}) {
  const pct          = Math.min(value / max, 1);
  const r            = 42;
  const circumference = 2 * Math.PI * r;
  const filled       = circumference * pct;
  const gap          = circumference - filled;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-2">
      <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">{label}</span>
      <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
        <svg viewBox="0 0 100 100" width="120" height="120">
          <circle cx="50" cy="50" r={r} fill="none" stroke="hsl(215,14%,92%)" strokeWidth="13" />
          <circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke={color}
            strokeWidth="13"
            strokeLinecap="butt"
            strokeDasharray={`${filled} ${gap}`}
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dasharray 0.7s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-bold text-foreground leading-none" style={{ fontSize: value >= 100 ? '13px' : '16px' }}>
            {format(value)}
          </span>
        </div>
      </div>
    </div>
  );
}
