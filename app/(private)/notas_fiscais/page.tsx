import NfeList from "./NfeList";

export default function NFePage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5">Notas Fiscais</h1>
      <NfeList />
    </div>
  );
}
