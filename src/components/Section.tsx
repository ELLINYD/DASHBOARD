export default function Section({ title }: { title: string }) {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">This page is intentionally empty for now.</p>
    </div>
  );
}
