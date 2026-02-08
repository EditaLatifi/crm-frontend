export default function ContactDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Contact Details</h1>
      <div>Details and related account, deals, tasks, and activity timeline for contact {params.id}.</div>
    </div>
  );
}
