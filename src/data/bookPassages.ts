export interface PassagePage {
  pageNumber: number;
  chapterTitle: string;
  text: string;
}

export interface BookContent {
  bookId: string;
  pages: PassagePage[];
}

export const BOOK_PASSAGES: Record<string, PassagePage[]> = {
  b1: [
    {
      pageNumber: 1,
      chapterTitle: "Prólogo de Zaratustra",
      text: "Quando Zaratustra completou trinta anos, deixou sua pátria e o lago de sua pátria, e retirou-se para as montanhas. Ali desfrutou do seu espírito e da sua solidão, e durante dez anos não se cansou de o fazer. Mas, por fim, transformou-se-lhe o coração — e, levantando-se uma manhã com a aurora, dirigiu-se ao Sol e falou-lhe assim:\n\n'Grande astro! Que seria da tua felicidade se não tivesses aqueles a quem iluminas! Durante dez anos subiste aqui à minha caverna: ter-te-ias fartado da tua luz e desta caminhada, sem mim, sem a minha águia e a minha serpente.'"
    },
    {
      pageNumber: 2,
      chapterTitle: "Das Três Metamorfoses",
      text: "Três metamorfoses do espírito vos menciono: como o espírito se torna camelo, e o camelo se torna leão, e o leão, por fim, criança.\n\nPara o espírito forte e paciente que habita no respeito, há muitas coisas pesadas. A sua força exige o pesado, o mais pesado de tudo. O que é pesado? — pergunta o espírito de carga; e ajoelha-se como o camelo, querendo que o carreguem bem.\n\nCom que se parece o espírito de carga? Com aquele que se rebaixa para fazer sofrer o seu orgulho, que faz brilhar a sua loucura para zombar da sua própria sabedoria."
    },
    {
      pageNumber: 3,
      chapterTitle: "O Leão e a Criança",
      text: "Mas no mais deserto dos desertos ocorre a segunda metamorfose: aqui o espírito se transforma em leão; quer conquistar a liberdade e ser senhor do seu próprio deserto.\n\nProcura aqui o seu último senhor: quer ser o inimigo dele e do seu último Deus; quer lutar pela vitória com o grande dragão.\n\nQual é o grande dragão que o espírito já não quer chamar de senhor e Deus? 'Tu deves' chama-se o grande dragão. Mas o espírito do leão diz: 'Eu quero'. Criar novos valores — isso nem o leão o pode ainda; mas criar liberdade para nova criação — isso pode o poder do leão."
    },
    {
      pageNumber: 4,
      chapterTitle: "O Espírito da Criança",
      text: "Mas dizei-me, meus irmãos, que pode fazer a criança que nem o leão pôde fazer? Por que o leão rapace tem ainda de se tornar criança?\n\nInocência é a criança, e esquecimento; um novo começar, um brinquedo, uma roda que gira por si mesma, um movimento inicial, um santo dizer sim.\n\nSim, para o jogo da criação, meus irmãos, é necessário um santo dizer sim: o espírito quer agora a sua própria vontade; o que se perdeu para o mundo conquista agora o seu próprio mundo."
    }
  ],
  b2: [
    {
      pageNumber: 1,
      chapterTitle: "Capítulo I — Do Título",
      text: "Uma noite destas, vindo da cidade para o Engenho Novo, encontrei no trem da Central um rapaz aqui do bairro, que eu conheço de vista e de chapéu. Cumprimentou-me, sentou-se ao pé de mim, falou do tempo, dos partidos, dos bondes, e finalmente do livro que estava escrevendo. Abriu a pasta e leu-me algumas páginas, que eu ouvi com atenção e agrado.\n\nComo eu hesitasse em dar uma opinião definitiva, ele sugeriu que a vida humana é uma ópera, cujo libreto foi composto pelo Criador e a partitura por Satanás. Achei a ideia excelente."
    },
    {
      pageNumber: 2,
      chapterTitle: "Capítulo II - Olhos de Ressaca",
      text: "Criatura de dezoito anos, Capitu tinha uns olhos assim de ressaca, que traziam a imaginação em sobressalto, como a onda que se retrai da praia em dia de tempestade.\n\nFalavam-me daqueles olhos, que eram como a água do mar que quer tragar a gente. Ela era muito mais mulher do que eu era homem. Eu, mero seminarista assustado, olhava para ela admirado com o seu desembaraço, a sua graça extraordinária e a força quase imperiosa do seu olhar que dominava meus sentimentos pueris."
    },
    {
      pageNumber: 3,
      chapterTitle: "Capítulo XIV - A Ópera do Destino",
      text: "A vida é uma ópera, meu caro Bento. Deus escreveu o libreto, mas a música é toda do diabo. Há partes lindíssimas, coros celestiais, solos de extrema delicadeza; mas os acordes que ligam as cenas guardam um mistério sombrio, uma tensão insuportável.\n\nMais tarde, quando se apagam as luzes do teatro e o público volta para casa, resta apenas o eco de uma melodia que não sabemos se foi triunfo ou completa ruína da alma humana."
    }
  ],
  b3: [
    {
      pageNumber: 1,
      chapterTitle: "Introdução — O Conhecimento e a Experiência",
      text: "Não há dúvida de que todo o nosso conhecimento começa com a experiência; pois, de outro modo, como poderia a nossa faculdade de conhecer ser despertada para o exercício, senão através de objetos que tocam os nossos sentidos?\n\nMas, embora todo o nosso conhecimento comece com a experiência, nem por isso todo ele se origina da experiência. Pois poderia muito bem acontecer que mesmo o nosso conhecimento de experiência seja um composto daquilo que recebemos por impressões e daquilo que a nossa própria faculdade de conhecer fornece de si mesma."
    },
    {
      pageNumber: 2,
      chapterTitle: "Sobre os Juízos a Priori",
      text: "Denomino cognições a priori aquelas que ocorrem independentemente de toda a experiência, e mesmo de todas as impressões dos sentidos. São opostas às cognições empíricas, que têm suas fontes a posteriori, isto é, na experiência.\n\nPara que um juízo seja universal e necessário, ele deve repousar sobre bases a priori, intocadas pelas flutuações e particularidades do mundo físico contingente."
    }
  ],
  b4: [
    {
      pageNumber: 1,
      chapterTitle: "A Travessia do Sertão",
      text: "Nonada. Tiros que o senhor ouviu foram de briga de homem não, Deus esteja. Alvejei mira em árvore, no quintal, no baixo do córrego... O senhor de fora, viajado, sabe: o sertão não tem janelas, a gente olha para o vazio e encontra o infinito.\n\nO diabo não existe de forma de bicho, o diabo está é no homem mesmo, ou não está em parte nenhuma. O sertão é o tamanho do mundo. O sertão é onde o pensamento da gente cresce mais do que as cercas das fazendas."
    },
    {
      pageNumber: 2,
      chapterTitle: "O Sentido do Viver",
      text: "Viver é muito perigoso. Porque aprender a viver é que é o viver mesmo. O sertão me produz, depois me engole, depois me cospe de volta.\n\nO que eu queria era entender o mistério da travessia. Diadorim, com aqueles olhos de água de poço, me olhava de um jeito que a alma de jagunço amolecia. Um amor que não cabe em lei de homem, que atravessa as fendas das pedras e brilha no meio da poeira da guerra."
    }
  ],
  b5: [
    {
      pageNumber: 1,
      chapterTitle: "Livro II — Despertar Diário",
      text: "Ao amanhecer, dize a ti mesmo: encontrar-me-ei hoje com o intrometido, com o ingrato, com o insolente, com o ardiloso, com o invejoso, com o antissocial.\n\nTodas estas ofensas lhes ocorrem por ignorância do que é o bem e o mal. Mas eu, que vi a natureza do bem, que é o belo, e a do mal, que é o vergonhoso, e a do próprio pecador, que é meu parente, não posso ser lesado por nenhum deles, pois ninguém me cobrirá de vergonha."
    },
    {
      pageNumber: 2,
      chapterTitle: "Da Impermanência",
      text: "Lembra-te sempre de quão rápido todas as coisas passam e desaparecem, tanto os próprios seres quanto os acontecimentos. A existência é como um rio em fluxo perpétuo, as forças estão em constante mudança e as causas em infinitas variações.\n\nApenas a razão calma nos protege. Controla e domestica os teus impulsos, aceita o destino com altivez e serve aos teus semelhantes sem vaidade."
    }
  ],
  b6: [
    {
      pageNumber: 1,
      chapterTitle: "A Fundação de Macondo",
      text: "Muitos anos depois, diante do pelotão de fuzilamento, o Coronel Aureliano Buendía havia de recordar aquela tarde remota em que seu pai o levou para conhecer o gelo. Macondo era então uma aldeia de vinte casas de barro e taquara, construídas à margem de um rio de águas diáfanas que se precipitavam por um leito de pedras polidas, brancas e enormes como ovos pré-históricos.\n\nO mundo era tão recente que muitas coisas careciam de nome e, para mencioná-las, precisava-se apontar com o dedo."
    },
    {
      pageNumber: 2,
      chapterTitle: "A Solidão de Buendía",
      text: "José Arcadio Buendía passava horas trancado no laboratório de alquimia, tentando extrair ouro da terra ou encontrar a passagem para as grandes invenções de Melquíades.\n\nMas o maior perigo era o vento da solidão que soprava sobre as telhas da grande casa. Naquela solidão fantástica, cada herdeiro do nome Buendía estava condenado a repetir os erros do passado, amando e odiando na mais absoluta falta de testemunhas reais."
    }
  ],
  b7: [
    {
      pageNumber: 1,
      chapterTitle: "Livro VII — A Alegoria da Caverna",
      text: "Imagina homens numa morada subterrânea, em forma de caverna, com uma entrada aberta para a luz que se estende por toda a largura. Eles estão lá desde a infância, de pernas e pescoço acorrentados, de modo que só podem ver o que está diante deles, pois as correntes os impedem de girar a cabeça.\n\nAtrás deles, a uma certa distância e altura, brilha a luz de um fogo. Entre o fogo e os prisioneiros passa um caminho elevado, ao longo do qual foi construído um pequeno muro."
    },
    {
      pageNumber: 2,
      chapterTitle: "As Sombras e a Realidade",
      text: "Se pudessem conversar uns com os outros, não achas que tomariam as sombras que veem diante de si pela própria realidade? E se na prisão houvesse um eco vindo da parede oposta, cada vez que um dos transeuntes falasse, creriam eles que as palavras vinham de outra coisa senão da sombra que passa?\n\nPara tais homens, a verdade consistiria inteiramente nas sombras dos objetos fabricados."
    },
    {
      pageNumber: 3,
      chapterTitle: "A Luz do Sol",
      text: "Pensa agora no que lhes aconteceria se fossem libertados das correntes e curados da sua ignorância. Se um deles fosse libertado e forçado a levantar-se de repente, a girar o pescoço, a caminhar e a olhar para a luz, sofreria dores terríveis.\n\nPrecisaria habituar-se para ver o mundo superior. Primeiro, as sombras; depois, as imagens na água; e, finalmente, o próprio Sol, contemplado não na sua imagem na água, mas no seu próprio domínio superior."
    }
  ]
};

export const FALLBACK_PASSAGES = (title: string, author: string): PassagePage[] => [
  {
    pageNumber: 1,
    chapterTitle: "Capítulo I — Abertura da Jornada",
    text: `As páginas de "${title}" escritas por ${author || 'Autor'} representam um convite à reflexão profunda e dedicada.\n\nLer com atenção livre de distrações é o segredo para absorver os silêncios contidos entre as palavras do autor. Cada frase foi cinzelada para expressar uma visão de mundo única, esperando pela centelha da sua curiosidade de leitor para voltar à vida ativa.`
  },
  {
    pageNumber: 2,
    chapterTitle: "Capítulo II — Filosofia Contida",
    text: "O leitor arguto sabe que a verdadeira obra não termina no ponto final de seus capítulos. Ela ecoa na nossa ação diária, no nosso vocabulário, e no refinamento da nossa sensibilidade para enxergar a complexidade do real.\n\nAproveite as ferramentas literárias inteligentes para desvendar camadas implícitas desta obra milenar e consolidar sua própria trilha de estudos."
  }
];

export function getBookPassages(bookId: string, title: string, author: string): PassagePage[] {
  return BOOK_PASSAGES[bookId] || FALLBACK_PASSAGES(title, author);
}
