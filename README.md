# Roleta Online

Um aplicativo de chat e vídeo aleatório construído com Deno Fresh.

## Funcionalidades

- Chat em tempo real
- Transmissão de vídeo
- Modo apenas chat (sem vídeo)
- Modo transmissão (apenas espectadores)

## Requisitos

Certifique-se de ter o Deno instalado: https://deno.land/manual/getting_started/installation

## Desenvolvimento

Para iniciar o projeto em modo desenvolvimento:

```bash
deno task start
```

Isso irá observar o diretório do projeto e reiniciar conforme necessário.

## Testes

O projeto inclui testes automatizados para garantir o funcionamento correto das funcionalidades. Para executar os testes:

```bash
deno task test
```

### Suítes de Teste

- `tests/rooms.test.ts`: Testa as funções de gerenciamento de salas
  - Criação de salas (normais e apenas chat)
  - Listagem de salas
  - Contagem de usuários
  - Remoção de salas

- `tests/ws.test.ts`: Testa a comunicação WebSocket
  - Conexão em salas normais
  - Conexão em salas apenas chat
  - Transmissão de mensagens
  - Tratamento de erros

## Build e Produção

Para construir o projeto para produção:

```bash
deno task build
```

Para executar em produção:

```bash
deno task preview
```
