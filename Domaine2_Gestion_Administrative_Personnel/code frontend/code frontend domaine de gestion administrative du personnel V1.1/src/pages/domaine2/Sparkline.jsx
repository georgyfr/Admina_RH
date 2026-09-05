// ============================================================
// Sparkline.jsx — Mini-graphique de tendance dans une cellule KPI
// Équivalent Excel : =SPARKLINE(plage; {"charttype";"line";"color";"#4472C4"})
// ============================================================
import { LineChart, Line, ResponsiveContainer, YAxis, Area, AreaChart } from 'recharts';

// Palette de couleurs par type de KPI
const SPARK_COLORS = {
  primary: '#0b2a4a',
  success: '#2a7a4a',
  warning: '#b86a2a',
  error: '#b33a4a',
  info: '#2a6a9a',
  gold: '#f9c74f',
  neutral: '#6b7a8a',
};

/**
 * Sparkline — mini LineChart sans axes
 * @param {number[]} data - tableau de valeurs (ex: [18, 19, 17, 20, 19, 20])
 * @param {string} color - couleur de la ligne (clé SPARK_COLORS ou hex)
 * @param {string} type - 'line' | 'area' (défaut: 'area' pour effet visuel)
 * @param {number} height - hauteur en px (défaut: 32)
 * @param {boolean} showFill - remplir sous la courbe (défaut: true)
 */
export default function Sparkline({ data = [], color = 'primary', type = 'area', height = 32, showFill = true }) {
  const couleur = SPARK_COLORS[color] || color;
  const gradientId = `spark-grad-${color.replace('#', '')}-${Math.random().toString(36).slice(2, 8)}`;

  // Convertir en format Recharts
  const chartData = data.map((v, i) => ({ x: i, y: v }));

  if (!data || data.length < 2) {
    return <div style={{ height, width: '100%' }} />;
  }

  return (
    <ResponsiveContainer width='100%' height={height}>
      {type === 'area' ? (
        <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor={couleur} stopOpacity={0.35} />
              <stop offset='100%' stopColor={couleur} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <YAxis domain={['dataMin', 'dataMax']} hide />
          <Area
            type='monotone'
            dataKey='y'
            stroke={couleur}
            strokeWidth={1.8}
            fill={showFill ? `url(#${gradientId})` : 'none'}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      ) : (
        <LineChart data={chartData} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
          <YAxis domain={['dataMin', 'dataMax']} hide />
          <Line
            type='monotone'
            dataKey='y'
            stroke={couleur}
            strokeWidth={1.8}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      )}
    </ResponsiveContainer>
  );
}
