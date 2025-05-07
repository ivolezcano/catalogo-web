'use client'
import Image from "next/image";
import { useState, useEffect } from "react";
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "@/components/ui/sheet"

type Producto = {
  Stock: string;
  "CódigoArtículo": string;
  "NombreArtículo": string;
  "Precio ": string;
  "Descuento ": string;
  "PrecioFinal": string;
  "Marcas": string;
  "LinkFoto": string;
};

export default function Home() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cantidades, setCantidades] = useState<{ [codigo: string]: number }>({});
  const [filtroMarcas, setFiltroMarcas] = useState<string[]>([]);
  const [marcasDisponibles, setMarcasDisponibles] = useState<string[]>([]);
  const [mostrarFiltros] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    fetch("/productos.json")
      .then((res) => res.json())
      .then((data) => {
        const productosConStock = data.filter((p: Producto) => p.Stock === "Si");
        const marcas = Array.from(new Set(productosConStock.map((producto: Producto) => producto.Marcas))) as string[];
        setMarcasDisponibles(marcas);
        setProductos(productosConStock);
      });
  }, []);

  const handleCantidadChange = (codigo: string, cantidad: number) => {
    setCantidades({
      ...cantidades,
      [codigo]: cantidad,
    });
  };

  const handleMarcaChange = (marca: string) => {
    setFiltroMarcas((prev) =>
      prev.includes(marca) ? prev.filter((m) => m !== marca) : [...prev, marca]
    );
  };

  const generarMensajeWhatsApp = () => {
    const productosSeleccionados = productos.filter((producto) => cantidades[producto["CódigoArtículo"]] > 0);

    if (productosSeleccionados.length === 0) {
      alert("No seleccionaste ningún producto");
      return;
    }

    const mensaje = productosSeleccionados
      .map((producto) => {
        return `• ${producto["NombreArtículo"]} \n_${producto["CódigoArtículo"]}_ \n*x${cantidades[producto["CódigoArtículo"]]} Unidades*\n--`;
      })
      .join("\n");

    const link = `https://wa.me/+5491128501525?text=${encodeURIComponent("Hola, quiero pedir:\n" + mensaje)}`;
    window.open(link, "_blank");
  };

  const productosFiltrados = productos.filter((producto) => {
    const coincideMarca = filtroMarcas.length === 0 || filtroMarcas.includes(producto.Marcas);
    
    const palabrasBusqueda = busqueda.toLowerCase().split(" ").filter(p => p);
    const coincideBusqueda = palabrasBusqueda.every(palabra =>
      producto["NombreArtículo"].toLowerCase().includes(palabra)
    );
    
    return coincideMarca && coincideBusqueda;
  });

  const productosAgrupadosPorMarca = productosFiltrados.reduce((acc, producto: Producto) => {
    const marca = producto.Marcas;
    if (!acc[marca]) acc[marca] = [];
    acc[marca].push(producto);
    return acc;
  }, {} as { [key: string]: Producto[] });

  return (
    <main className="flex min-h-screen bg-gray-50">
      {/* Panel de Filtros */}
      <aside className="hidden md:flex flex-col p-4 w-64 bg-white shadow-md border-r">
        <h2 className="text-lg font-semibold mb-4">Filtrar por Marca</h2>
        <div className="overflow-y-auto h-[calc(100vh-150px)] pr-2">
          {marcasDisponibles.map((marca) => (
            <label key={marca} className="flex items-center gap-2 mb-3 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={filtroMarcas.includes(marca)}
                onChange={() => handleMarcaChange(marca)}
                className="accent-green-500"
              />
              {marca}
            </label>
          ))}
        </div>

        {/* Powered by - Desktop */}
        <div className="mt-10 text-sm text-center text-gray-500 tracking-wide">
          <a
            href="https://ivanlezcano.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="relative inline-block transition-all duration-300 hover:text-black hover:after:w-full after:content-[''] after:block after:h-[1px] after:bg-black after:w-0 after:transition-all after:duration-300 after:mx-auto"
          >
            Powered by Ivan Lezcano
          </a>
        </div>
      </aside>

      {/* Contenido Principal */}
      <div className="flex flex-col flex-1 p-4">
        <button
          onClick={generarMensajeWhatsApp}
          className="bg-green-500 fixed top-16 right-4 z-50 border px-4 py-2 rounded-md bg-white text-sm shadow-md cursor-pointer"
        >
          Enviar Pedido
        </button>
        <div className="fixed bottom-12 right-4 z-50 flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-full shadow-lg transition-all duration-300 focus-within:ring-2 focus-within:ring-green-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar producto..."
            className="outline-none text-sm w-48 placeholder-gray-400"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        {/* Botón para Filtros en Mobile */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button
                className="fixed top-4 right-4 z-50 border px-4 py-2 rounded-md bg-white text-sm shadow-md"
              >
                Filtros
              </button>
            </SheetTrigger>
            <button
                onClick={generarMensajeWhatsApp}
                className="bg-green-500 fixed top-16 right-4 z-50 border px-4 py-2 rounded-md bg-white text-sm shadow-md"
              >
                Enviar Pedido
              </button>
              <input
                type="text"
                placeholder="Buscar producto..."
                className="fixed top-2 right-4 z-50 border px-4 py-2 rounded-md bg-white text-sm shadow-md"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            <SheetTitle>MARCAS</SheetTitle>
            <SheetContent side="right" className="w-72 p-6 bg-white rounded-2xl shadow-lg overflow-hidden">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 tracking-tight">Filtrar por Marca</h2>
              <div className="flex flex-col gap-4 overflow-y-auto max-h-[80vh]">
                {marcasDisponibles.map((marca) => (
                  <label
                    key={marca}
                    className="flex items-center gap-4 cursor-pointer hover:bg-gray-100 p-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105"
                  >
                    <input
                      type="checkbox"
                      checked={filtroMarcas.includes(marca)}
                      onChange={() => handleMarcaChange(marca)}
                      className="accent-teal-500 border-transparent focus:ring-2 focus:ring-teal-500"
                    />
                    <span className="text-lg font-medium text-gray-800 leading-relaxed">{marca}</span>
                  </label>
                ))}
              </div>

              {/* Powered by - Mobile */}
              <div className="mt-10 text-sm text-center text-gray-500 tracking-wide">
                <a
                  href="https://ivanlezcano.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative inline-block transition-all duration-300 hover:text-black hover:after:w-full after:content-[''] after:block after:h-[1px] after:bg-black after:w-0 after:transition-all after:duration-300 after:mx-auto"
                >
                  Powered by Ivan Lezcano
                </a>
              </div>

            </SheetContent>
          </Sheet>
        </div>

        {mostrarFiltros && (
          <div className="mb-4 bg-white p-4 rounded-md shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Filtrar por Marca</h2>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {marcasDisponibles.map((marca) => (
                <label key={marca} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filtroMarcas.includes(marca)}
                    onChange={() => handleMarcaChange(marca)}
                    className="accent-green-500"
                  />
                  {marca}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Object.keys(productosAgrupadosPorMarca).map((marca) => (
            <div key={marca}>
              <h2 className="text-3xl font-black tracking-tight uppercase border-b-2 border-black sticky top-0 bg-white z-10 py-2">
                {marca}
              </h2>

              {productosAgrupadosPorMarca[marca].map((producto) => (
                <div key={producto["CódigoArtículo"]} className="bg-white p-4 rounded-lg shadow flex flex-col items-center">
                  {producto.LinkFoto && (
                    <Image
                      src={producto.LinkFoto.trim()}
                      alt={producto["NombreArtículo"]}
                      width={150}
                      height={150}
                      className="object-contain max-w-full h-auto mb-2"
                    />
                  )}
                  <h3 className="text-md font-semibold text-center">{producto["NombreArtículo"]}</h3>
                  <p className="text-gray-600 text-sm mb-2">{`$${producto["PrecioFinal"]}`}</p>
                  <input
                    type="number"
                    min="0"
                    value={cantidades[producto["CódigoArtículo"]] || ""}
                    onChange={(e) => handleCantidadChange(producto["CódigoArtículo"], parseInt(e.target.value))}
                    placeholder="Cantidad"
                    className="border rounded p-1 text-center w-20"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Botón de Enviar Pedido */}
        <div className="flex justify-center mt-8">
          <button
            onClick={generarMensajeWhatsApp}
            className="bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-8 rounded-full border-2 border-black cursor-pointer"
          >
            Enviar Pedido por WhatsApp
          </button>
        </div>
      </div>
    </main>
  );
}