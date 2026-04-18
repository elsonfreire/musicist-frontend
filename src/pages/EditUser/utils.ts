export function formatMemberDate(dateString: string) {
  const date = new Date(dateString);

  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
}
