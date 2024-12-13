'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const res = await signIn("credentials", {
            email: formData.get('email'),
            password: formData.get('password'),
            redirect: false,
        });
        if (res?.error) {
            setError(res.error as string);
        }
        if (res?.ok) {
            router.push('/');
        }
    };

    const handleGoogleSignIn = async () => {
        const res = await signIn("google", { redirect: false });
        if (res?.error) {
            setError(res.error as string);
        }
        if (res?.ok) {
            router.push('/');
        }
    };

    return (
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
          <form 
              className="p-8 w-full max-w-md space-y-6 bg-white rounded-xl shadow-2xl"
              onSubmit={handleSubmit}
          >
              {error && (
                  <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg">
                      {error}
                  </div>
              )}
              
              <div className="text-center">
                  <h1 className="text-3xl font-extrabold text-gray-900">
                      Bienvenido a MiMapa
                  </h1>
                  <p className="mt-2 text-sm text-gray-600">
                      Inicia sesión con tu cuenta
                  </p>
              </div>

              <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700">
                          Email
                      </label>
                      <input
                          type="email"
                          placeholder="you@example.com"
                          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                          focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          name="email"
                      />
                  </div>

                  <div>
                      <label className="block text-sm font-medium text-gray-700">
                          Contrseña
                      </label>
                      <input
                          type="password"
                          placeholder="••••••••"
                          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                          focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          name="password"
                      />
                  </div>
              </div>

              <div className="space-y-3">
                  <button
                      type="submit"
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                      Iniciar Sesión
                  </button>

                  <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                          <path
                              fill="currentColor"
                              d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                          />
                      </svg>
                      Iniciar sesión con Google
                  </button>
              </div>

              <div className="text-center">
                  <Link
                      href="/registro"
                      className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
                  >
                      ¿No tienes cuenta? Regístrate
                  </Link>
              </div>
          </form>
      </section>
  );
}