export const CATEGORIES = [
  { value: 'alimentacao', label: 'Alimentação', color: '#B4703A' },
  { value: 'moradia', label: 'Moradia', color: '#2F5D50' },
  { value: 'transporte', label: 'Transporte', color: '#4A7C8C' },
  { value: 'saude', label: 'Saúde', color: '#8C4A5F' },
  { value: 'educacao', label: 'Educação', color: '#5B5F97' },
  { value: 'lazer', label: 'Lazer', color: '#C79A3C' },
  { value: 'compras', label: 'Compras', color: '#A65D3F' },
  { value: 'assinaturas', label: 'Assinaturas', color: '#6B7A8F' },
  { value: 'contas', label: 'Contas e serviços', color: '#7A6A58' },
  { value: 'investimentos', label: 'Investimentos', color: '#2E7D6B' },
  { value: 'salario', label: 'Salário', color: '#1F6F4A' },
  { value: 'transferencias', label: 'Transferências', color: '#8A8F7C' },
  { value: 'impostos', label: 'Impostos', color: '#9B4A3A' },
  { value: 'outros', label: 'Outros', color: '#9A958C' },
];

export const categoryLabel = (value) =>
  CATEGORIES.find((c) => c.value === value)?.label ?? 'Outros';

export const categoryColor = (value) =>
  CATEGORIES.find((c) => c.value === value)?.color ?? '#9A958C';