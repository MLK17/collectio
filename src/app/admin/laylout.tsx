import { Suspense } from "react";
import { exigerAdministrateur } from "@/auth/session";
import BoutonDeconnexion from "@/components/BoutonDeconnexion";

async function EnteteAdmin() {
  const session = await exigerAdministrateur();
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <strong>Administration, connecté : {session.user.name}</strong>
      <BoutonDeconnexion />
    </header>
  );
}

async function GardeAdmin({ children }: { children: React.ReactNode }) {
  await exigerAdministrateur();
  return <>{children}</>;
}

export default function LayoutAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ padding: "1rem" }}>
      <Suspense fallback={<p>Vérification des droits...</p>}>
        <EnteteAdmin />
        <hr />
        <GardeAdmin>{children}</GardeAdmin>
      </Suspense>
    </div>
  );
}