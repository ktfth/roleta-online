import { Handlers, PageProps } from "$fresh/server.ts";

import { Head } from "$fresh/runtime.ts";

interface Data {
  chatOnly: boolean;
}

export const handler: Handlers<Data> = {
  GET(req, ctx) {
    const url = new URL(req.url);
    const chatOnly = url.searchParams.get("chat") === "true";
    return ctx.render({ chatOnly });
  },
};

export default function NovaSala({ data }: PageProps<Data>) {
  const roomId = Math.random().toString(36).substring(2, 8);
  
  return (
    <>
      <Head>
        <title>Nova Sala - Roleta Online</title>
      </Head>
      <div class="min-h-screen bg-gray-100 py-8">
        <div class="max-w-md mx-auto bg-white rounded-lg shadow p-6">
          <h1 class="text-2xl font-bold mb-6">
            {data.chatOnly ? "Nova Sala de Chat" : "Nova Sala"}
          </h1>
          
          <form class="space-y-4" method="GET" action={`/sala/${roomId}`}>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Seu Nome (opcional)
              </label>
              <input
                type="text"
                name="userName"
                class="w-full px-3 py-2 border rounded-lg"
                placeholder="Digite seu nome"
              />
            </div>

            <div>
              <label class="flex items-center space-x-2">
                <input type="checkbox" name="isPrivate" value="true" class="rounded" />
                <span class="text-sm text-gray-700">Sala Privada</span>
              </label>
            </div>

            <div class="password-input hidden">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Senha da Sala
              </label>
              <input
                type="password"
                name="password"
                class="w-full px-3 py-2 border rounded-lg"
                placeholder="Digite a senha"
              />
            </div>

            {data.chatOnly && (
              <input type="hidden" name="chatOnly" value="true" />
            )}

            <div class="flex gap-4">
              <button
                type="submit"
                class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Criar Sala
              </button>
              <a
                href="/"
                class="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </a>
            </div>
          </form>

          <script>
            {`
              document.querySelector('input[name="isPrivate"]').addEventListener('change', (e) => {
                const passwordInput = document.querySelector('.password-input');
                if (e.target.checked) {
                  passwordInput.classList.remove('hidden');
                } else {
                  passwordInput.classList.add('hidden');
                  passwordInput.querySelector('input').value = '';
                }
              });
            `}
          </script>
        </div>
      </div>
    </>
  );
} 