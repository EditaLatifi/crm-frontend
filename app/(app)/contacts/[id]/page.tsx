export default function ContactDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Kontakt-Details</h1>
      <div>Details und verknüpfti Firma, Deals, Tasks und Aktivitätsverlauf für Kontakt {params.id}.</div>
    </div>
  );
}
