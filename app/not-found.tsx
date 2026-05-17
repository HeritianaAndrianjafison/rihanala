import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <p className="text-8xl font-accent text-primary/20 mb-4">404</p>
        <h1 className="font-accent text-3xl text-primary mb-3">Page introuvable</h1>
        <p className="text-slate-500 text-sm mb-8">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/fr"
            className="bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-h transition-colors text-sm"
          >
            Retour à l'accueil
          </Link>
          <Link
            href="/fr/contact"
            className="border border-primary text-primary font-semibold px-6 py-3 rounded-xl hover:bg-primary hover:text-white transition-colors text-sm"
          >
            Nous contacter
          </Link>
        </div>
      </div>
    </div>
  );
}
