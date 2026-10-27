export const formatBRL = (value) =>
  (Number(value) || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

export const formatDate = (value) => {
  if (!value) return '';
  const iso = value.length === 10 ? `${value}T12:00:00` : value;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

export const monthLabel = (date) =>
  date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');