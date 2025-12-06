import { Truck, Menu } from "lucide-react";

export function Header() {
  return (
    <div className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
      {/* Sol taraf: Logo ve İsim */}
      <div className="flex items-center gap-2">
        <Truck size={24} />
        <span className="font-bold text-lg">LojistikApp</span>
      </div>

      {/* Sağ taraf: Menü Butonu */}
      <button className="p-1 hover:bg-blue-700 rounded">
        <Menu size={24} />
      </button>
    </div>
  );
}