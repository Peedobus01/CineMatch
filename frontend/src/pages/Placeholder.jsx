export default function Placeholder({ title, phaseNote }) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <h1 className="font-display text-3xl font-semibold text-cream mb-2">
        {title}
      </h1>
      <p className="text-muted font-mono text-sm">{phaseNote}</p>
    </div>
  );
}
