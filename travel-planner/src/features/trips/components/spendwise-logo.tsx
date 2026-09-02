import Image from "next/image";

export function SpendwiseLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`spendwise-logo${compact ? " spendwise-logo--compact" : ""}`} aria-label="Spendwise Trip">
      <Image className="spendwise-logo__image" src="/spendwise-butterfly-logo-icon-transparent.png" alt="Spendwise Trip logo" width={110} height={110} sizes="24px" priority />
      <span className="spendwise-logo__type">
        <span className="spendwise-logo__name">Spendwise</span>
        <span className="spendwise-logo__trip">TRIP</span>
      </span>
    </span>
  );
}
