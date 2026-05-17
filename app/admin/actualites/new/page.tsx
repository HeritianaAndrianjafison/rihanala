import ActualiteForm from "@/components/admin/ActualiteForm";

export default function AdminActualiteNewPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Rédiger un article</h1>
        <p className="text-slate-500 text-sm mt-1">Nouvel article de blog</p>
      </div>
      <ActualiteForm />
    </div>
  );
}
