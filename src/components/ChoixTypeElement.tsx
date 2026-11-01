export const LIBELLES_TYPE_ELEMENT = {
  sticker: "Stickers",
  carte: "Cartes",
} as const;

export default function ChoixTypeElement({
  valeur = "sticker",
}: {
  valeur?: keyof typeof LIBELLES_TYPE_ELEMENT;
}) {
  return (
    <select
      name="typeElement"
      defaultValue={valeur}
      aria-label="Type d'élément"
    >
      {Object.entries(LIBELLES_TYPE_ELEMENT).map(([v, libelle]) => (
        <option key={v} value={v}>
          {libelle}
        </option>
      ))}
    </select>
  );
}
