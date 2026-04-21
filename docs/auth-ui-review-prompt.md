Revise toda a experiencia de autenticacao da aplicacao com foco visual e funcional.

Objetivos da revisao:
- Identificar telas que ainda prendem o usuario na splash, logo screen ou loading state por mais de 1-2 segundos sem feedback util.
- Encontrar campos de formulario em que texto digitado, placeholder, labels, icones ou mensagens de erro estejam colados nas bordas.
- Verificar espacamentos verticais entre titulo, subtitulo, labels, campos, links auxiliares, alertas e botoes.
- Garantir consistencia entre login, cadastro, esqueci a senha, redefinir senha e verificacao de email.
- Procurar resets globais de CSS que possam sobrescrever padding, margin, line-height, border-radius ou estilos de componentes.
- Confirmar se hooks de autenticacao estao sendo executados mais de uma vez sem necessidade.

Checklist pratico:
- Abrir login em desktop e mobile.
- Abrir esqueci a senha em desktop e mobile.
- Abrir redefinir senha em desktop e mobile.
- Testar estado vazio, preenchido, autofill do navegador, loading e erro.
- Inspecionar o CSS computado dos inputs para confirmar padding-left, padding-right e altura final.
- Medir tempo entre primeiro paint e saida da splash screen.
- Listar exatamente arquivo, linha e causa raiz antes de propor mudancas.

Formato esperado da resposta:
- Problema encontrado
- Causa raiz
- Arquivo e trecho afetado
- Ajuste recomendado
- Risco de regressao
