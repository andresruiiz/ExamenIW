import type { Metadata } from "next";
import "./globals.css";
import { Provider } from "./provider";
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Examen Frontend",
  description: "Creado por Andrés Ruiz Sánchez",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="es" className="overflow-x-hidden">
      <Provider>
        <body className="min-h-screen bg-gray-50 overflow-x-hidden">
          <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <Link href="/" className="flex-shrink-0 flex items-center">
                    <h1 className="text-xl font-bold text-gray-800">MiMapa</h1>
                  </Link>
                </div>
                {session?.user && (
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-600">Usuario: {session.user.name}</span>
                    <form action="/api/auth/signout" method="POST">
                      <button 
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm"
                        type="submit"
                      >
                        Cerrar Sesión
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </nav>
          <main>
            {children}
          </main>
        </body>
      </Provider>
    </html>
  );
}