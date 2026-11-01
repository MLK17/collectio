"use client";

import { useActionState } from "react";

export type EtatFormulaire = { erreur?: string; ok?: boolean } | null;
export type ActionFormulaire = (
  etat: EtatFormulaire,
  formData: FormData,
) => Promise<EtatFormulaire>;

export default function FormulaireAdmin({
  action,
  libelle,
  confirmation,
  children,
  style,
}: {
  action: ActionFormulaire;
  libelle: string;
  confirmation?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const [etat, envoyer, enCours] = useActionState(action, null);
  return (
    <form
      action={envoyer}
      onSubmit={(e) => {
        if (confirmation && !window.confirm(confirmation)) e.preventDefault();
      }}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.5rem",
        alignItems: "center",
        ...style,
      }}
    >
      {children}
      <button type="submit" disabled={enCours}>
        {enCours ? "..." : libelle}
      </button>
      {etat?.erreur && (
        <span role="alert" style={{ color: "crimson" }}>
          {etat.erreur}
        </span>
      )}
      {etat?.ok && <span style={{ color: "green" }}>Enregistré</span>}
    </form>
  );
}
